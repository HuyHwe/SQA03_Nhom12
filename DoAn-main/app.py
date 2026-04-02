import torch
import torch.nn as nn
import torch.nn.functional as F
# import dgl
import numpy as np
import psycopg2
from psycopg2.extras import Json
from sentence_transformers import SentenceTransformer
os.environ["OMP_NUM_THREADS"] = "1"

DB_CONFIG = {
    "dbname": "jober_test",
    "user": "admin",
    "password": "juile2022",
    "host": "localhost",
    "port": "5433"
}

MODEL_PATH = "gnn_model.pt"
TEXT_MODEL = None  # Loaded lazily

def get_text_model():
    global TEXT_MODEL
    if TEXT_MODEL is None:
        print("📦 Loading SentenceTransformer...")
        TEXT_MODEL = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    return TEXT_MODEL

class SimpleGNN(nn.Module):
    def __init__(self, in_feats, hidden_feats, out_feats):
        super(SimpleGNN, self).__init__()
        self.conv1 = dgl.nn.GraphConv(in_feats, hidden_feats)
        self.conv2 = dgl.nn.GraphConv(hidden_feats, out_feats)
    def forward(self, g, x):
        x = F.relu(self.conv1(g, x))
        x = self.conv2(g, x)
        return x

def get_embedding_from_texts(texts):
    """ Encode nhiều đoạn text cùng lúc bằng SentenceTransformer """
    return get_text_model().encode(texts, convert_to_tensor=True)

def load_data_from_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT id, skilldes, experiencedes, jobtarget FROM freelancer WHERE embedding IS NOT NULL AND active=1")
    candidates = cur.fetchall()
    cur.execute("SELECT id, des, requiredskill, requiredskilllevel, requiredexperiencelevel FROM job WHERE embedding IS NOT NULL AND active=1")
    jobs = cur.fetchall()
    cur.execute("""
        SELECT sender_id, action_url
        FROM notification
        WHERE type IN ('JOB_VIEW','JOB_SAVE','JOB_APPLY')
          AND action_url LIKE '%/post/%'
    """)
    edges = []
    for sender, url in cur.fetchall():
        try:
            job_id = int(url.split("/post/")[1].split("/")[0])
            edges.append((int(sender), job_id))  # Fix: Cast int(sender)
        except:
            continue
    cur.close(); conn.close()
    return candidates, jobs, edges

def build_graph(candidates, jobs, edges):
    """
    Build DGL graph and node_features ensuring:
    - graph.num_nodes() == node_features.shape[0]
    - only include nodes that appear in edges (valid_nodes)
    Returns: g, node_features, user_ids, job_ids, user_map, job_map
    """

    # 1) All ids
    all_user_ids = [c[0] for c in candidates]
    all_job_ids = [j[0] for j in jobs]

    # 2) Find which ids actually appear in edges
    valid_users = set()
    valid_jobs = set()
    for u, j in edges:
        if u in all_user_ids and j in all_job_ids:
            valid_users.add(u)
            valid_jobs.add(j)

    print(f"Debug: Found {len(valid_users)} valid users, {len(valid_jobs)} valid jobs from {len(edges)} edges.")

    if len(valid_users) == 0 or len(valid_jobs) == 0:
        raise ValueError("No valid users or jobs found in edges after filtering.")

    # 3) Build kept lists in deterministic order
    user_keep = sorted(list(valid_users))
    job_keep = sorted(list(valid_jobs))

    # 4) New maps based on kept lists
    user_map = {uid: i for i, uid in enumerate(user_keep)}
    job_map = {jid: i + len(user_keep) for i, jid in enumerate(job_keep)}

    # 5) Build src/dst using new maps (only edges between kept nodes)
    src = []
    dst = []
    for u, j in edges:
        if u in user_map and j in job_map:
            src.append(user_map[u])
            dst.append(job_map[j])

    # 6) Create graph from src/dst
    g = dgl.graph((src, dst), num_nodes=len(user_keep) + len(job_keep))
    g = dgl.add_self_loop(g)

    # 7) Prepare text lists in same order as maps
    # Build lookup dicts from id -> tuple row for quick access
    cand_dict = {c[0]: c for c in candidates}
    job_dict = {j[0]: j for j in jobs}

    user_texts = []
    for uid in user_keep:
        c = cand_dict[uid]
        # Fix: Chỉ 3 text fields (skilldes, experiencedes, jobtarget) → c[1:4]
        txt = f"{c[1] or ''} {c[2] or ''} {c[3] or ''}"
        user_texts.append(txt.strip())

    job_texts = []
    for jid in job_keep:
        j = job_dict[jid]
        # Fix: 4 text fields (des, requiredskill, requiredskilllevel, requiredexperiencelevel) → j[1:5]
        txt = f"{j[1] or ''} {j[2] or ''} {j[3] or ''} {j[4] or ''}"
        job_texts.append(txt.strip())

    # 8) Encode features (SentenceTransformer) -> torch.Tensor
    if len(user_texts) > 0:
        user_emb = get_embedding_from_texts(user_texts)
    else:
        user_emb = torch.empty((0, TEXT_MODEL.get_sentence_embedding_dimension()))
    if len(job_texts) > 0:
        job_emb = get_embedding_from_texts(job_texts)
    else:
        job_emb = torch.empty((0, TEXT_MODEL.get_sentence_embedding_dimension()))

    node_features = torch.cat([user_emb, job_emb], dim=0)

    # 9) Sanity checks
    if g.num_nodes() != node_features.shape[0]:
        raise AssertionError(f"Graph nodes ({g.num_nodes()}) != feats ({node_features.shape[0]})")

    # Return maps and lists in same order as features
    return g, node_features, user_keep, job_keep, user_map, job_map


def train_or_load_model(g, feats):
    model = SimpleGNN(feats.shape[1], 64, 32)
    if os.path.exists(MODEL_PATH):
        print("📦 Load model cũ...")
        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()
        return model
    print("🚀 Train model mới...")
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    src, dst = g.edges()
    for epoch in range(50):
        model.train()
        out = model(g, feats)
        loss = -torch.mean(F.cosine_similarity(out[src], out[dst]))
        opt.zero_grad(); loss.backward(); opt.step()
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: loss={loss.item():.4f}")
    torch.save(model.state_dict(), MODEL_PATH)
    return model

def export_embeddings(model, g, feats, user_ids, job_ids, user_map, job_map):
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
    out = model(g, feats).detach().numpy()
    for uid in user_ids:
        cur.execute("INSERT INTO node_embedding VALUES (%s,%s,%s)", (uid, 'candidate', Json(out[user_map[uid]].tolist())))
    for jid in job_ids:
        cur.execute("INSERT INTO node_embedding VALUES (%s,%s,%s)", (jid, 'job', Json(out[job_map[jid]].tolist())))
    conn.commit(); cur.close(); conn.close()
    print("✅ Export GNN embeddings -> node_embedding thành công.")

if __name__ == "__main__":
    candidates, jobs, edges = load_data_from_db()
    print(f"Loaded {len(candidates)} candidates, {len(jobs)} jobs, {len(edges)} interactions.")
    if not candidates or not jobs or not edges:
        print("⚠️ Không đủ dữ liệu.")
        exit()
    g, feats, uids, jids, umap, jmap = build_graph(candidates, jobs, edges)
    model = train_or_load_model(g, feats)
    export_embeddings(model, g, feats, uids, jids, umap, jmap)