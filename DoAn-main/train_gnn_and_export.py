import torch
import torch.nn as nn
import torch.nn.functional as F
import dgl
import numpy as np
import psycopg2
from psycopg2.extras import Json
from sentence_transformers import SentenceTransformer
import os
from typing import List, Tuple
from sklearn.preprocessing import OneHotEncoder

# ------------------ Cấu hình ------------------
DB_CONFIG = {
    "dbname": "train_db",
    "user": "admin",
    "password": "juile2022",
    "host": "localhost",
    "port": "5433"
}
MODEL_PATH = "gnn_model.pt"

# ------------------ Load SentenceTransformer ------------------
try:
    TEXT_MODEL = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    EMB_DIM = TEXT_MODEL.get_sentence_embedding_dimension()
except Exception as e:
    print(f"Lỗi tải SentenceTransformer: {e}")
    exit()

# ------------------ Mô hình GNN ------------------
class ImprovedGNN(nn.Module):
    def __init__(self, in_feats, hidden_feats, out_feats):
        super().__init__()
        self.conv1 = dgl.nn.GraphConv(in_feats, hidden_feats)
        self.conv2 = dgl.nn.GraphConv(hidden_feats, out_feats)
        self.dropout = nn.Dropout(0.1)

    def forward(self, g, x):
        x = F.relu(self.conv1(g, x))
        x = self.dropout(x)
        x = self.conv2(g, x)
        return x

def contrastive_loss(out, src, dst, temp=0.07):
    """Contrastive loss"""
    pos = F.cosine_similarity(out[src], out[dst]) / temp
    if len(dst) > 1:
        neg_dst = dst[torch.randperm(len(dst))]
    else:
        neg_dst = dst
    neg = F.cosine_similarity(out[src], out[neg_dst]) / temp
    return -torch.mean(F.logsigmoid(pos - neg))

def get_embedding_from_texts(texts: List[str]) -> torch.Tensor:
    if not texts:
        return torch.empty((0, EMB_DIM))
    return TEXT_MODEL.encode(texts, convert_to_tensor=True)

# ------------------ Load dữ liệu ------------------
def load_data_from_db() -> Tuple[List[Tuple], List[Tuple], List[Tuple[int,int,int]], List[int]]:
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Candidates
    cur.execute("SELECT userid, experiencelevel, skilllevel, skilldes, experiencedes FROM freelancer WHERE active=1")
    candidates = [tuple(row) for row in cur.fetchall()]
    
    # Jobs
    cur.execute("SELECT id, requiredskill, requiredskilllevel, requiredexperiencelevel FROM job WHERE active=1")
    jobs = [tuple(row) for row in cur.fetchall()]
    
    # Notifications
    cur.execute("""
        SELECT sender_id, type, action_url
        FROM notification
        WHERE type IN ('JOB_VIEW','JOB_SAVE','JOB_APPLY','PROFILE_VIEW','PROFILE_BOOK','PROFILE_RECRUIMENT')
          AND (action_url LIKE '%/post/%' OR action_url LIKE '%/profiles/%')
    """)
    raw_notifs = cur.fetchall()
    print(f"DEBUG: Loaded {len(raw_notifs)} raw notifications")
    edges = []
    recruiter_ids = set()
    for sender, ntype, url in raw_notifs:
        try:
            sender_id = int(sender)
        except Exception:
            continue
        
        # Candidate -> Job
        if ntype in ['JOB_VIEW','JOB_SAVE','JOB_APPLY']:
            try:
                job_id = int(url.split("/post/")[1].split("/")[0])
                edges.append((sender_id, job_id, 1))
            except Exception:
                continue
        # Recruiter -> Candidate
        elif ntype in ['PROFILE_VIEW','PROFILE_BOOK','PROFILE_RECRUIMENT']:
            try:
                cand_id = int(url.split("/profiles/")[1].split("/")[0])
                edges.append((sender_id, cand_id, 0))
                recruiter_ids.add(sender_id)
            except Exception:
                print(f"Failed to parse recruiter->candidate URL: {url}")
                continue

    cur.close()
    conn.close()
    print(f"DEBUG: Candidates {len(candidates)}, Jobs {len(jobs)}, RawEdges {len(edges)}, Recruiters {len(recruiter_ids)}")
    return candidates, jobs, edges, sorted(list(recruiter_ids))

# ------------------ Xây dựng Graph ------------------
def build_graph(candidates, jobs, edges, recruiter_ids):
    cand_userids = {c[0] for c in candidates}
    job_ids = {j[0] for j in jobs}
    recruiter_set = set(recruiter_ids)

    cand_dict = {c[0]: c for c in candidates}
    job_dict = {j[0]: j for j in jobs}

    valid_recruiters = set()
    valid_candidates = set()
    valid_jobs = set()
    valid_edges = []

    for s, t, flag in edges:
        if flag == 0 and s in recruiter_set and t in cand_userids:
            valid_recruiters.add(s)
            valid_candidates.add(t)
            valid_edges.append((s, t, 0))
        elif flag == 1 and s in cand_userids and t in job_ids:
            valid_candidates.add(s)
            valid_jobs.add(t)
            valid_edges.append((s, t, 1))

    print(f"DEBUG: Valid recruiters {len(valid_recruiters)}, candidates {len(valid_candidates)}, jobs {len(valid_jobs)}, edges {len(valid_edges)}")

    recruiter_keep = sorted(list(valid_recruiters))
    candidate_keep = sorted(list(valid_candidates))
    job_keep = sorted(list(valid_jobs))

    recruiter_map = {rid: i for i, rid in enumerate(recruiter_keep)}
    candidate_map = {cid: i + len(recruiter_keep) for i, cid in enumerate(candidate_keep)}
    job_map = {jid: i + len(recruiter_keep) + len(candidate_keep) for i, jid in enumerate(job_keep)}

    src, dst = [], []
    for s, t, flag in valid_edges:
        if flag == 0:
            src.append(recruiter_map[s])
            dst.append(candidate_map[t])
        elif flag == 1:
            src.append(candidate_map[s])
            dst.append(job_map[t])

    num_nodes = len(recruiter_keep) + len(candidate_keep) + len(job_keep)
    g = dgl.graph((src, dst), num_nodes=num_nodes)
    g = dgl.add_self_loop(g)

    # ---- Node texts ----
    candidate_texts = [f"{cand_dict[cid][1] or ''} {cand_dict[cid][2] or ''} {cand_dict[cid][3] or ''}" for cid in candidate_keep]
    job_texts = [f"{job_dict[jid][1] or ''} {job_dict[jid][2] or ''} {job_dict[jid][3] or ''}" for jid in job_keep]

    recruiter_texts = []
    if recruiter_keep:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        try:
            # tuple(recruiter_keep) để ANY() nhận đúng
            cur.execute(
                "SELECT id, COALESCE(name,'') as name, COALESCE(province,'') as province FROM usercommon WHERE id = ANY(%s)",
                (list(recruiter_keep),)
            )

            rows = {r[0]: f"{r[1]} {r[2]}" for r in cur.fetchall()}
        except Exception as e:
            print("Lỗi query usercommon:", e)
            rows = {}
        finally:
            cur.close(); conn.close()
        recruiter_texts = [rows.get(rid, "") for rid in recruiter_keep]


    recruiter_emb = get_embedding_from_texts(recruiter_texts) if recruiter_texts else torch.zeros((len(recruiter_keep), EMB_DIM))
    candidate_emb = get_embedding_from_texts(candidate_texts) if candidate_texts else torch.zeros((len(candidate_keep), EMB_DIM))
    job_emb = get_embedding_from_texts(job_texts) if job_texts else torch.zeros((len(job_keep), EMB_DIM))

    # ---- Categorical features ----
    enc = OneHotEncoder(sparse_output=False, categories='auto')

    cand_levels = np.array([[int(cand_dict[cid][1] or 0)] for cid in candidate_keep], dtype=int) if candidate_keep else np.zeros((0,1),dtype=int)
    job_levels = np.array([[int(job_dict[jid][2] or 0)] for jid in job_keep], dtype=int) if job_keep else np.zeros((0,1),dtype=int)
    recruiter_levels = np.zeros((len(recruiter_keep),1), dtype=int) if recruiter_keep else np.zeros((0,1),dtype=int)

    all_levels = np.vstack([recruiter_levels, cand_levels, job_levels]) if len(recruiter_levels)+len(cand_levels)+len(job_levels)>0 else np.zeros((0,1),dtype=int)
    enc.fit(all_levels) if all_levels.shape[0]>0 else None

    recruiter_cat = enc.transform(recruiter_levels) if recruiter_levels.size else np.zeros((len(recruiter_keep),1))
    cand_cat = enc.transform(cand_levels) if cand_levels.size else np.zeros((len(candidate_keep),1))
    job_cat = enc.transform(job_levels) if job_levels.size else np.zeros((len(job_keep),1))

    # ---- Node features ----
    node_features_np = np.vstack([
        np.concatenate([recruiter_emb.detach().cpu().numpy(), recruiter_cat], axis=1) if recruiter_keep else np.zeros((0,EMB_DIM+recruiter_cat.shape[1])),
        np.concatenate([candidate_emb.detach().cpu().numpy(), cand_cat], axis=1) if candidate_keep else np.zeros((0,EMB_DIM+cand_cat.shape[1])),
        np.concatenate([job_emb.detach().cpu().numpy(), job_cat], axis=1) if job_keep else np.zeros((0,EMB_DIM+job_cat.shape[1]))
    ])
    node_features = torch.tensor(node_features_np, dtype=torch.float32)

    return g, node_features, recruiter_keep, candidate_keep, job_keep, recruiter_map, candidate_map, job_map

# ------------------ Huấn luyện hoặc load model ------------------
def train_or_load_model(g, feats):
    in_feats = feats.shape[1]
    model = ImprovedGNN(in_feats, 64, 32)

    if os.path.exists(MODEL_PATH):
        print("📦 Load model đã huấn luyện")
        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()
        return model

    print("🚀 Train model mới")
    opt = torch.optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4)
    src, dst = g.edges()
    if src.numel() > 0:
        for epoch in range(100):
            model.train()
            out = model(g, feats)
            loss = contrastive_loss(out, src, dst)
            opt.zero_grad()
            loss.backward()
            opt.step()
            if epoch % 10 == 0:
                print(f"Epoch {epoch}: loss={loss.item():.4f}")
        torch.save(model.state_dict(), MODEL_PATH)
    else:
        print("⚠️ Không có cạnh hợp lệ để huấn luyện, lưu model chưa train")
        torch.save(model.state_dict(), MODEL_PATH)
    return model

# ------------------ Xuất embeddings ------------------
def export_embeddings(model, g, feats, recruiter_ids, candidate_ids, job_ids, recruiter_map, candidate_map, job_map):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS node_embedding (
            node_id BIGINT,
            node_type VARCHAR(50),
            embedding JSONB
        )
    """)
    cur.execute("DELETE FROM node_embedding")
    
    out = model(g, feats).detach().cpu().numpy()
    insert_query = "INSERT INTO node_embedding (node_id, node_type, embedding) VALUES (%s,%s,%s)"

    for rid in recruiter_ids:
        idx = recruiter_map.get(rid)
        if idx is not None:
            cur.execute(insert_query, (rid, 'recruiter', Json(out[idx].tolist())))
    for cid in candidate_ids:
        idx = candidate_map.get(cid)
        if idx is not None:
            cur.execute(insert_query, (cid, 'candidate', Json(out[idx].tolist())))
    for jid in job_ids:
        idx = job_map.get(jid)
        if idx is not None:
            cur.execute(insert_query, (jid, 'job', Json(out[idx].tolist())))

    conn.commit()
    cur.close(); conn.close()
    print("✅ Export embeddings thành công")

# # ------------------ Main ------------------
# if __name__ == "__main__":
#     print("--- Bắt đầu quy trình GNN ---")
#     candidates, jobs, edges, recruiter_ids = load_data_from_db()
#     if not candidates or not jobs or not edges:
#         print("⚠️ Dữ liệu không đủ để tiếp tục")
#         exit()

#     g, feats, rids, cids, jids, rmap, cmap, jmap = build_graph(candidates, jobs, edges, recruiter_ids)
#     feats = feats.float()

#     model = train_or_load_model(g, feats)
#     export_embeddings(model, g, feats, rids, cids, jids, rmap, cmap, jmap)
#     print("--- Quy trình GNN hoàn tất ---")
def main_gnn_process():
    """
    Hàm đóng gói toàn bộ quy trình GNN.
    Trả về: (success: bool, message: str)
    """
    print("--- Bắt đầu quy trình GNN ---")
    
    try:
        candidates, jobs, edges, recruiter_ids = load_data_from_db()
        
        if not candidates or not jobs or not edges:
            msg = "⚠️ Dữ liệu không đủ để tiếp tục."
            print(msg)
            return False, msg

        g, feats, rids, cids, jids, rmap, cmap, jmap = build_graph(candidates, jobs, edges, recruiter_ids)
        
        if g.num_nodes() == 0 or feats.shape[0] == 0:
            msg = "⚠️ Graph rỗng sau khi build, không thể train/export."
            print(msg)
            return False, msg

        feats = feats.float()

        model = train_or_load_model(g, feats)
        export_embeddings(model, g, feats, rids, cids, jids, rmap, cmap, jmap)
        
        print("--- Quy trình GNN hoàn tất ---")
        return True, "Quy trình GNN hoàn tất và embeddings đã được export thành công."
        
    except Exception as e:
        import traceback
        error_msg = f"Lỗi nghiêm trọng trong quá trình GNN: {e}. Traceback: {traceback.format_exc()}"
        print(error_msg)