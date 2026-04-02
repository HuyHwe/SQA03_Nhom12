import os
from contextlib import asynccontextmanager
os.environ["OMP_NUM_THREADS"] = "1"

from fastapi import FastAPI, UploadFile, File, Form, HTTPException,BackgroundTasks
from fastapi.responses import JSONResponse
from io import BytesIO
from PyPDF2 import PdfReader
import traceback



from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
import psycopg2, math, numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from psycopg2.extras import Json
import json
import re
import fitz  # PyMuPDF (pip install PyMuPDF nếu chưa)
import traceback
import pytesseract  # OCR (pip install pytesseract)
from PIL import Image  # (pip install pillow)

from docx import Document  # pip install python-docx cho DOCX
from io import BytesIO
from datetime import datetime, timezone
from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import time
import threading

# Global model placeholders
model = None
resume_tokenizer = None
resume_model = None
resume_ner_pipeline = None

RESUME_MODEL_NAME = "AventIQ-AI/Resume-Parsing-NER-AI-Model"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, resume_tokenizer, resume_model, resume_ner_pipeline
    print("🚀 Loading models...")
    # Load SentenceTransformer
    model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    
    # Load Resume NER Models
    resume_tokenizer = AutoTokenizer.from_pretrained(RESUME_MODEL_NAME)
    resume_model = AutoModelForTokenClassification.from_pretrained(RESUME_MODEL_NAME)
    resume_ner_pipeline = pipeline(
        "ner",
        model=resume_model,
        tokenizer=resume_tokenizer,
        aggregation_strategy="simple"
    )
    print("✅ Models loaded successfully.")
    yield
    # Clean up (if needed)

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

origins = [
    "http://localhost:4200"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # cho phép FE truy cập
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE
    allow_headers=["*"],        # cho phép tất cả header
)
DB_CONFIG = {
    "dbname": "jober_test",
    "user": "admin",
    "password": "juile2022",
    "host": "localhost",
    "port": "5433"
}
def to_jsonable(obj: Any) -> Any:
    """Ép object về kiểu JSON-serializable để tránh 500 do numpy/pydantic/custom obj."""
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, dict):
        return {str(k): to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [to_jsonable(x) for x in obj]
    # pydantic v2
    if hasattr(obj, "model_dump"):
        return to_jsonable(obj.model_dump())
    # pydantic v1
    if hasattr(obj, "dict"):
        return to_jsonable(obj.dict())
    # fallback
    return str(obj)

def fetch_gnn_embedding(node_id, node_type, cursor):
    cursor.execute("SELECT embedding FROM node_embedding WHERE node_id=%s AND node_type=%s", (node_id, node_type))
    row = cursor.fetchone()
    return np.array(row[0]) if row else None

def cosine(a, b):
    return float(cosine_similarity(a.reshape(1, -1), b.reshape(1, -1))[0][0])

def parse_embedding(emb_raw):
    if isinstance(emb_raw, str):
        try:
            return json.loads(emb_raw)
        except json.JSONDecodeError:
            raise ValueError("Invalid embedding format in DB")
    else:
        return list(emb_raw)

def to_pgvector(vec):
    return "[" + ",".join([str(round(v, 6)) for v in vec]) + "]"

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def safe_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0

def safe_str(val):
    return str(val) if val is not None else ""

def convert_job_full(j: tuple, distance: float, score: float):
    return {
        "id": j[0],
        "jobDefaultId": j[1],
        "jobDefaultName": safe_str(j[2]),
        "name": safe_str(j[3]),
        "address": safe_str(j[4]),
        "job": safe_str(j[5]),
        "number": int(j[6]) if j[6] is not None else 0,
        "salary": safe_float(j[7]),
        "lat": safe_float(j[8]),
        "lng": safe_float(j[9]),
        "creationDate": j[10].strftime("%Y-%m-%dT%H:%M:%S") if j[10] else None,
        "expDate": j[11].strftime("%Y-%m-%dT%H:%M:%S") if j[11] else None,
        "province": safe_str(j[12]),
        "ward": safe_str(j[13]),
        "phone": safe_str(j[14]),
        "email": safe_str(j[15]),
        "workingType": int(j[16]) if j[16] is not None else 0,
        "des": safe_str(j[17]),
        "requiredExperienceLevel": int(j[18]) if j[18] is not None else 0,
        "requiredSkillLevel": int(j[19]) if j[19] is not None else 0,
        "profit": safe_float(j[20]) if len(j) > 20 else 0.0,
        "requiredSkill": safe_str(j[21]) if len(j) > 21 else "",
        "organizationId": int(j[22]) if j[22] is not None else 0,
        "userId": int(j[23]) if len(j) > 23 and j[23] is not None else 0,
        "organizationName": safe_str(j[24]) if len(j) > 24 else "",
        "organizationAvatar": safe_str(j[25]) if len(j) > 25 else "",
        "organizationDes": safe_str(j[26]) if len(j) > 26 else "",
        "score": safe_float(score),
        "distance": safe_float(distance)
    }
    
    

def convert_candidate_full(c: tuple, score: float):
    return {
        "id": c[0],
        "name": safe_str(c[1]),
        "job": safe_str(c[2]),
        "skillDes": safe_str(c[3]),
        "experienceDes": safe_str(c[4]),
        "jobTarget": safe_str(c[5]),
        "experienceLevel": int(c[6]) if c[6] is not None else 0,
        "skillLevel": int(c[7]) if c[7] is not None else 0,
        "jobDefaultId": int(c[8]) if c[8] is not None else 0,
        "lat": safe_float(c[9]),
        "lon": safe_float(c[10]),
        "address": safe_str(c[11]),
        "province": safe_str(c[12]),
        "ward": safe_str(c[13]),
        "avatar": safe_str(c[14]),
        "dateOfBirth": c[15].strftime("%Y-%m-%d") if c[15] else None,
        "cv": safe_str(c[16]),
        "phone": safe_str(c[17]),
        "email": safe_str(c[18]),
        "score": round(score, 4)
    }

def get_behavior_boost(candidate_id, job_id, cursor):
    ACTION_WEIGHT = {"JOB_VIEW": 0.05, "JOB_SAVE": 0.2, "JOB_APPLY": 0.5}
    cursor.execute("""
        SELECT type FROM notification 
        WHERE sender_id = %s AND action_url LIKE %s
    """, (candidate_id, f"%/post/{job_id}%"))
    actions = cursor.fetchall()
    boost = sum(ACTION_WEIGHT.get(a[0], 0) for a in actions)
    return boost

class UserRequest(BaseModel):
    user_id: int
    top_k: int = 20
@app.post("/recommend_by_user")
def recommend_by_user(req: UserRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Lấy freelancer của user
        cursor.execute("""
            SELECT id, name, job, skilldes, experiencedes, jobtarget,
                   experiencelevel, skilllevel, jobdefaultid, lat, lon, embedding
            FROM freelancer 
            WHERE userid = %s
        """, (req.user_id,))
        freelancers = cursor.fetchall()

        if not freelancers:
            return []

        results = []

        for f in freelancers:
            flat, flon = safe_float(f[9]), safe_float(f[10])
            emb_raw = f[11]

            # Nếu chưa có embedding thì encode từ text
            if emb_raw is None or not emb_raw:
                freelancer_text = f"{f[3]},{f[4]},{f[5]},{f[6]},{f[7]}"
                emb_list = model.encode([freelancer_text])[0].tolist()
            else:
                emb_list = parse_embedding(emb_raw)

            freelancer_emb = to_pgvector(emb_list)

            # Lấy tất cả job active
            cursor.execute("""
                SELECT j.id, jd.id, COALESCE(jd.name,''), j.name, j.address, j.job, j.number, j.salary,
                       j.lat, j.lon, j.creationdate, j.expdate, j.province, j.ward,
                       j.phone, j.email, j.workingtype, j.des, j.requiredexperiencelevel, j.requiredskilllevel,
                       j.profit, j.requiredskill, j.organizationid, u.id as userCommonId, o.name as orgName,
                       o.avatar as orgAvatar, o.des as orgDes, j.embedding,
                       1 - (j.embedding <=> %s::vector) as similarity
                FROM job j
                LEFT JOIN jobdefault jd ON j.jobdefaultid = jd.id
                LEFT JOIN organization o ON j.organizationid = o.id
                LEFT JOIN usercommon u ON j.userid = u.id
                WHERE j.active = 1 AND j.expdate >= CURRENT_DATE AND j.embedding IS NOT NULL
                ORDER BY j.embedding <=> %s::vector
                LIMIT %s
            """, (freelancer_emb, freelancer_emb, req.top_k))

            jobs = cursor.fetchall()

            for j in jobs:
                try:
                    # 1. Distance
                    distance = haversine(flat, flon, safe_float(j[8]), safe_float(j[9]))

                    # 2. Similarity score (0–1)
                    skill_score = max(min(j[-1], 1), 0)

                    # 3. Behavior score (0–1)
                    boost = get_behavior_boost(f[0], j[0], cursor)
                    behavior_score = min(boost, 1.0)

                    # 4. Experience match (0–1)
                    job_exp_level = safe_float(j[18]) or 0
                    cand_exp_level = safe_float(f[6]) or 0
                    exp_diff = abs(cand_exp_level - job_exp_level)
                    experience_score = max(1 - exp_diff * 0.25, 0)

                    # 5. Location score (0–1)
                    if distance <= 10:
                        location_score = 1.0
                    elif distance <= 100:
                        location_score = 0.7
                    elif distance <= 300:
                        location_score = 0.3
                    else:
                        location_score = 0.05

                    # 6. GNN graph score (0–1)
                    gnn_score = 0.0
                    user_emb_gnn = fetch_gnn_embedding(f[0], 'candidate', cursor)
                    job_emb_gnn = fetch_gnn_embedding(j[0], 'job', cursor)
                    if user_emb_gnn is not None and job_emb_gnn is not None:
                        gnn_score = max(cosine(user_emb_gnn, job_emb_gnn), 0)

                    # 7. Recency score (0–1) - ưu tiên job mới
                    recency_score = 0.0
                    if j[10]:  # creationdate
                        post_date = j[10]
                        # nếu j[10] naive, assume UTC
                        if post_date.tzinfo is None:
                            post_date = post_date.replace(tzinfo=timezone.utc)
                        days_since_post = (datetime.now(timezone.utc) - post_date).days
                        if days_since_post <= 1:
                            recency_score = 1.0
                        elif days_since_post <= 7:
                            recency_score = 0.7
                        elif days_since_post <= 30:
                            recency_score = 0.4
                        else:
                            recency_score = 0.1

                    # ==========================
                    # Multi-factor final score
                    # ==========================
                    final_score = (
                        skill_score * 0.45 +         # giảm 5% để nhường cho recency
                        behavior_score * 0.20 +
                        experience_score * 0.10 +
                        location_score * 0.10 +
                        gnn_score * 0.10 +
                        recency_score * 0.05         # thêm recency
                    )

                    job_dict = convert_job_full(j[:-2], distance, final_score)
                    results.append(job_dict)

                except Exception as job_err:
                    print(f"Debug: Error processing job {j[0]} for candidate {f[0]}: {str(job_err)}")
                    continue


        # Giữ duy nhất job với score cao nhất nếu trùng
        unique_results = {}
        for r in results:
            job_id = r["id"]
            if job_id not in unique_results or r["score"] > unique_results[job_id]["score"]:
                unique_results[job_id] = r

        final_results = list(unique_results.values())
        final_results.sort(key=lambda x: x.get("score", 0), reverse=True)

        return final_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


class RecruiterRequest(BaseModel):
    recruiter_id: int
    page: int = 1
    size: int = 30
@app.post("/recommend_candidates_for_recruiter")
def recommend_candidates_for_recruiter(req: RecruiterRequest):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        recruiter_id = req.recruiter_id
        page = req.page
        size = req.size

        # ================================
        # 1. Lấy Job embedding + vị trí
        # ================================
        cursor.execute("""
            SELECT id, embedding, lat, lon 
            FROM job 
            WHERE userid = %s 
              AND active = 1 
              AND expdate >= CURRENT_DATE 
              AND embedding IS NOT NULL
        """, (recruiter_id,))
        
        jobs = cursor.fetchall()

        if not jobs:
            return {
                "status": "NOT_FOUND",
                "code": 404,
                "message": "Recruiter chưa đăng job nào",
                "totalCount": 0,
                "currentCount": 0,
                "totalPage": 0,
                "data": []
            }

        job_embs, job_ids, lats, lngs = [], [], [], []

        for j in jobs:
            if j[2] is None or j[3] is None or j[2] == 0 or j[3] == 0:
                continue
            try:
                emb_list = parse_embedding(j[1])
                job_embs.append(np.array(emb_list))
                job_ids.append(j[0])
                lats.append(j[2])
                lngs.append(j[3])
            except:
                continue

        if not job_embs:
            return {"status": "ERROR", "message": "Không có job embeddings hợp lệ"}

        avg_emb = np.mean(job_embs, axis=0)
        avg_emb_pg = to_pgvector(avg_emb.tolist())
        center_lat = float(np.mean(lats))
        center_lon = float(np.mean(lngs))

        # ======================================
        # 2. Lấy cached GNN embedding của job
        # ======================================
        job_gnn_embs = {}
        for job_id in job_ids:
            emb = fetch_gnn_embedding(job_id, 'job', cursor)
            if emb is not None:
                job_gnn_embs[job_id] = emb

        valid_gnn = list(job_gnn_embs.values())
        avg_job_gnn = np.mean(valid_gnn, axis=0) if valid_gnn else None

        # ======================================
        # 3. Lấy candidates – có thêm cv_embedding
        # ======================================
        cursor.execute("""
            SELECT DISTINCT ON (f.userid)
                f.id, f.name, f.job, f.skilldes, f.experiencedes, f.jobtarget,
                f.experiencelevel, f.skilllevel, f.jobdefaultid, f.lat, f.lon, f.address,
                u.province, u.ward, u.avatar, u.dateofbirth,
                f.cv, f.phone, f.email,
                f.embedding, f.cv_embedding,
                1 - (f.embedding <=> %s::vector) AS similarity
            FROM freelancer f
            INNER JOIN usercommon u ON f.userid = u.id
            WHERE f.embedding IS NOT NULL
            AND f.active = 1
            AND f.lat IS NOT NULL AND f.lon IS NOT NULL
            AND f.lat != 0 AND f.lon != 0
            ORDER BY f.userid ASC, similarity DESC  -- userid ASC trước để DISTINCT lấy sim cao nhất/user
            LIMIT %s OFFSET %s
        """, (avg_emb_pg, size, (page - 1) * size))

        candidates = cursor.fetchall()
        print(f"[DEBUG] Top candidates fetched: {len(candidates)}")  # Debug: In số lượng
        if candidates:
            sample = candidates[:3]
            debug_list = [(c[0], c[1], c[2] if len(c) > 2 else None, round(c[21], 3)) for c in sample]  # ID, name, job, sim (index 21)
            print(f"[DEBUG] Sample candidates: {debug_list}")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM freelancer f
            WHERE f.embedding IS NOT NULL
              AND f.active = 1
              AND f.lat IS NOT NULL AND f.lon IS NOT NULL
              AND f.lat != 0 AND f.lon != 0
        """)
        total_count = cursor.fetchone()[0]

        results = []

        # ======================================
        # 4. Process từng candidate
        # ======================================
        for c in candidates:
            try:
                cand_id = c[0]

                # ------------------------------
                # Position filter
                # ------------------------------
                clat = safe_float(c[9])
                clon = safe_float(c[10])
                distance = haversine(center_lat, center_lon, clat, clon)

                if distance > 500:
                    continue

                # ------------------------------
                # Parse main embedding
                # ------------------------------
                emb_list = parse_embedding(c[19])
                f_emb = np.array(emb_list)
                emb_norm = np.linalg.norm(f_emb)

                if emb_norm < 0.1:
                    continue

                # ------------------------------
                # Parse cv_embedding (JSONB)
                # ------------------------------
                cv_emb_list = parse_cv_embedding(c[20])
                cv_emb = None
                cv_sim = 0

                if cv_emb_list is not None:
                    try:
                        cv_emb = np.array(cv_emb_list, dtype=float)
                        cv_sim = max(cosine(cv_emb, avg_emb), 0)
                    except:
                        cv_sim = 0

                # Similarity từ embedding chính
                emb_sim = max(cosine(f_emb, avg_emb), 0)

                # ------------------------------
                # Final SKILL SCORE  
                # 60% profile embedding, 40% CV embedding
                # ------------------------------
                final_skill_score = emb_sim * 0.80 + cv_sim * 0.20

                # ------------------------------
                # Behavior boost
                # ------------------------------
                behavior_score = min(
                    sum(get_behavior_boost(cand_id, job_id, cursor) for job_id in job_ids),
                    1.0
                )

                # ------------------------------
                # Experience match
                # ------------------------------
                cursor.execute("""
                    SELECT AVG(requiredexperiencelevel) 
                    FROM job 
                    WHERE id = ANY(%s)
                """, (job_ids,))

                avg_job_exp = safe_float(cursor.fetchone()[0]) or 0
                cand_exp = safe_float(c[6]) or 0

                exp_diff = abs(cand_exp - avg_job_exp)
                experience_score = max(1 - exp_diff * 0.25, 0)

                # ------------------------------
                # Location score
                # ------------------------------
                if distance <= 10:
                    location_score = 1.0
                elif distance <= 100:
                    location_score = 0.7
                elif distance <= 300:
                    location_score = 0.3
                else:
                    location_score = 0.05

                # ------------------------------
                # GNN score
                # ------------------------------
                gnn_score = 0
                cand_gnn = fetch_gnn_embedding(cand_id, 'candidate', cursor)

                if cand_gnn is not None and avg_job_gnn is not None:
                    gnn_score = max(cosine(cand_gnn, avg_job_gnn), 0)

                # ------------------------------
                # Recency score
                # ------------------------------
                job_post_date = get_job_post_date(job_ids, cursor)

                if job_post_date is None:
                    recency_score = 0
                else:
                    days = (datetime.now(timezone.utc) - job_post_date).days
                    if days <= 1:
                        recency_score = 1
                    elif days <= 7:
                        recency_score = 0.7
                    elif days <= 30:
                        recency_score = 0.4
                    else:
                        recency_score = 0.1

                # ------------------------------
                # FINAL RANKING SCORE
                # ------------------------------
                final_score = (
                    final_skill_score * 0.70 +
                    behavior_score    * 0.0 +
                    experience_score  * 0.05 +
                    location_score    * 0.10 +
                    gnn_score         * 0.10 +
                    recency_score     * 0.05
                )

                # Convert output
                candidate_dict = convert_candidate_full(c[:19], final_score)
                candidate_dict["distance_km"] = round(distance, 2)
                candidate_dict["emb_norm"] = round(emb_norm, 3)
                candidate_dict["skill_score"] = final_skill_score
                candidate_dict["cv_similarity"] = cv_sim
                candidate_dict["emb_similarity"] = emb_sim

                results.append(candidate_dict)

            except Exception as err:
                print(f"[Error] Candidate {c[0]}: {err}")
                continue

        # Sort theo final score giảm dần
        results.sort(key=lambda x: x["score"], reverse=True)

        cursor.close()
        conn.close()

        total_page = math.ceil(total_count / size)

        return {
            "status": "SUCCESS",
            "code": 200,
            "message": "Found candidates",
            "totalCount": total_count,
            "currentCount": len(results),
            "totalPage": total_page,
            "page": page,
            "data": results
        }

    except Exception as e:
        print(f"[Global Error]: {e}")
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

def parse_cv_embedding(cv_json):
    if cv_json is None:
        return None
    if isinstance(cv_json, list):
        return cv_json
    try:
        return json.loads(cv_json)
    except:
        return None

def get_job_post_date(job_ids, cursor):
    """
    Lấy ngày đăng bài gần nhất của danh sách job_ids.
    Trả về datetime object timezone-aware (UTC) hoặc None nếu không có.
    """
    if not job_ids:
        return None

    # Giả sử cột creationdate là timestamptz hoặc timestamp
    cursor.execute(
        """
        SELECT MAX(creationdate)
        FROM job
        WHERE id = ANY(%s)
        """,
        (job_ids,)
    )
    row = cursor.fetchone()
    if row is None or row[0] is None:
        return None

    post_date = row[0]  # có thể là datetime hoặc string từ DB

    # Nếu là string, parse sang datetime
    if isinstance(post_date, str):
        try:
            post_date = datetime.fromisoformat(post_date)
        except ValueError:
            # fallback: parse với format phổ biến
            from dateutil import parser
            post_date = parser.parse(post_date)

    # Chuyển sang timezone-aware UTC nếu naive
    if post_date.tzinfo is None:
        post_date = post_date.replace(tzinfo=timezone.utc)
    else:
        # Chuyển về UTC nếu có timezone khác
        post_date = post_date.astimezone(timezone.utc)

    return post_date


class FreelancerText(BaseModel):
    freelancerId: int
    name: Optional[str] = ""
    job: Optional[str] = ""
    skillDes: Optional[str] = ""
    experienceDes: Optional[str] = ""
    jobTarget: Optional[str] = ""
    experienceLevel: Optional[int] = 0
    skillLevel: Optional[int] = 0
@app.post("/encode-freelancer")
def encode_freelancer(f: FreelancerText):
    try:
        # Build text an toàn: Thay None/rỗng bằng ''
        skill_des = f.skillDes or ''
        experience_des = f.experienceDes or ''
        job_target = f.jobTarget or ''
        experience_level = f.experienceLevel or 0
        skill_level = f.skillLevel or 0
        
        f_text = f"""
        {skill_des},
        {experience_des},
        {job_target},
        {experience_level},{skill_level}.
        """.strip() 
        if len(f_text) < 10:
            return {
                "status": "skipped",
                "freelancerId": f.freelancerId,
                "embedding": None,  # Không encode
                "message": "Text too short or empty, skipped encoding"
            }
        
        emb = model.encode([f_text])[0].tolist()
        emb_pg = to_pgvector(emb)  # Chuyển thành chuỗi pgvector
        return {
            "status": "ok",
            "freelancerId": f.freelancerId,
            "embedding": emb_pg,  # Trả về embedding dưới dạng chuỗi
            "message": "Encoded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

class JobText(BaseModel):
    jobId: int
    name: Optional[str] = ""
    des: Optional[str] = ""
    requiredExperienceLevel: Optional[int] = 0
    requiredSkillLevel: Optional[int] = 0
    requiredSkill: Optional[str] = ""
    workingType: Optional[int] = 0
    salary: Optional[float] = 0.0
    province: Optional[str] = ""
    district: Optional[str] = ""
@app.post("/encode-job")
def encode_job(job: JobText):
    try:
        # Build text an toàn: Thay None/rỗng bằng ''
        des = job.des or ''
        required_experience_level = job.requiredExperienceLevel or 0
        required_skill_level = job.requiredSkillLevel or 0
        required_skill = job.requiredSkill or ''
        
        job_text = f"""
        {des}.
        {required_experience_level}.
        {required_skill_level}.
        {required_skill}.
        """.strip()  # Strip để loại space thừa
        
        # Check nếu text rỗng hoặc quá ngắn (không encode)
        if len(job_text) < 10:
            return {
                "status": "skipped",
                "jobId": job.jobId,
                "embedding": None,  # Không encode
                "message": "Text too short or empty, skipped encoding"
            }
        
        emb = model.encode([job_text])[0].tolist()
        emb_pg = to_pgvector(emb)  # Chuyển thành chuỗi pgvector
        return {
            "status": "ok",
            "jobId": job.jobId,
            "embedding": emb_pg,  # Trả về embedding dưới dạng chuỗi
            "message": "Encoded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")





######################################

class JobItem:
    def __init__(self, requiredExperienceLevel: int, requiredSkill: str, requiredSkillLevel: int, jobDesc: str = ""):
        self.requiredExperienceLevel = requiredExperienceLevel
        self.requiredSkill = requiredSkill
        self.requiredSkillLevel = requiredSkillLevel
        self.jobDesc = jobDesc  # thêm trường jobDesc
def extract_text_from_file(cv_file: UploadFile) -> str:
    try:
        filename = cv_file.filename.lower()

        file_bytes = cv_file.file.read()  # ⚠️ QUAN TRỌNG
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file")

        # ===== PDF =====
        if filename.endswith(".pdf"):
            reader = PdfReader(BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="PDF không có text (scan image hoặc lỗi encoding)"
                )

            return text

        # ===== DOCX =====
        elif filename.endswith(".docx"):
            import docx
            doc = docx.Document(BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)

        # ===== EXCEL =====
        elif filename.endswith(".xlsx"):
            import pandas as pd
            df = pd.read_excel(BytesIO(file_bytes))
            return df.to_string()

        else:
            raise HTTPException(
                status_code=400,
                detail="Định dạng file không được hỗ trợ"
            )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi đọc file CV: {str(e)}"
        )
def parse_cv_with_model(text: str) -> Dict[str, Any]:
    """
    Trích xuất thông tin CV:
    - skills
    - experience (years)
    - job target
    - skill level
    - experience level
    """
    text_lower = text.lower()

    # ------------------- Job target -------------------
    job_target_match = re.search(r'(Job target):\s*(.*)', text, re.I)
    job_target = job_target_match.group(2).strip() if job_target_match else ""

    # ------------------- Skills -------------------
    skills = []
    skills_section = re.search(r'Skills:\s*(.*?)(?:\n\n|$)', text, re.S | re.I)
    if skills_section:
        lines = skills_section.group(1).split("\n")
        for line in lines:
            line = line.strip("-* ").strip()
            if line:
                skills.append(line)
    skills_str = ", ".join(skills)

    # ------------------- Experience -------------------
    experience_years = 0
    exp_section = re.search(r'Experience:\s*(.*?)(?:\n\n|$)', text, re.S | re.I)
    if exp_section:
        exp_text = exp_section.group(1)
        # Tìm tất cả năm/tháng
        exp_matches = re.findall(r'(\d{4})', exp_text)
        if exp_matches:
            years = [int(y) for y in exp_matches]
            if len(years) >= 2:
                experience_years = max(years) - min(years)
            else:
                experience_years = 1  # nếu chỉ có 1 năm, coi là ít nhất 1 năm
    experience_des = f"{experience_years} years"

    # ------------------- Education -------------------
    educations = []
    edu_section = re.search(r'Education:\s*(.*?)(?:\n\n|$)', text, re.S | re.I)
    if edu_section:
        lines = edu_section.group(1).split("\n")
        for line in lines:
            line = line.strip("-* ").strip()
            if line:
                educations.append(line)

    # ------------------- Skill & Experience level -------------------
    level_map = {"junior":3, "intern":1, "mid":5, "senior":8, "lead":10, "expert":10, "fresher":2, "thực tập":1}
    skill_level = 0
    experience_level = experience_years
    for key, val in level_map.items():
        if key in text_lower:
            skill_level = max(skill_level, val)
    skill_level = max(1, min(skill_level, 10))

    # ------------------- Embedding -------------------
    embed_text = f"{skills_str}. {experience_des}. {job_target}. {experience_level}, {skill_level}"
    embedding = model.encode(embed_text).tolist()

    return {
        "skill_des": skills_str,
        "experience_des": experience_des,
        "job_target": job_target,
        "skill_level": skill_level,
        "experience_level": experience_level,
        "embedding": embedding,
        "educations": educations
    }
def calculate_match_score(cv_data, job_item: dict):
    required_skill = job_item.get("requiredSkill", "")
    required_level = job_item.get("requiredSkillLevel", 0)

    score = 0
    reasons = []

    if required_skill and required_skill.lower() in cv_data.get("skills", "").lower():
        score += 50
        reasons.append("Có kỹ năng phù hợp")

    if cv_data.get("experience_years", 0) >= job_item.get("requiredExperienceLevel", 0):
        score += 50
        reasons.append("Đủ kinh nghiệm")

    return {
        "score": score,
        "reasons": reasons
    }

def extract_text_from_file_bytes(filename: str, content: bytes) -> str:
    """
    ✅ Bạn phải hiện thực hàm này theo logic đang có của bạn.
    Quan trọng: đầu vào là bytes + filename (không phải UploadFile thô).
    """
    # TODO: implement real extraction (pdf/docx/xlsx)
    # raise HTTPException(status_code=400, detail="Unsupported file type")
    return content.decode("utf-8", errors="ignore")  # placeholder


# ------------------- Endpoint -------------------
@app.post("/parse-cv-and-match")
async def parse_cv_and_match(
    cv_file: UploadFile = File(...),
    job_item_json: str = Form(...)
):
    try:
        data = json.loads(job_item_json)

        job_item = {
            "jobDesc": data.get("jobDesc", ""),
            "requiredExperienceLevel": int(data.get("requiredExperienceLevel", 0)),
            "requiredSkill": data.get("requiredSkill", ""),
            "requiredSkillLevel": int(data.get("requiredSkillLevel", 0)),
        }

        text = extract_text_from_file(cv_file)
        cv_data = parse_cv_with_model(text)

        match_result = calculate_match_score(cv_data, job_item)

        return {
            "is_valid_cv": True,
            "cv_data": cv_data,
            "match_score": match_result["score"],
            "reasons": match_result["reasons"],
            "job_item": job_item
        }

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

# Thêm DTO này vào file recommend_service.py của bạn (hoặc thay thế CandidateResult cũ)
class CandidateResult(BaseModel):
    # Thông tin cơ bản của ứng viên (tương tự convert_candidate_full)
    id: int
    name: str
    job: str
    skillDes: str
    experienceDes: str
    jobTarget: str
    experienceLevel: int
    skillLevel: int
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    
    # Điểm số chính
    score: float # Final Score (tổng hợp)
    
    # Các trường bổ sung theo yêu cầu
    similarityScore: float      # Điểm Similarity thô (Text Embedding)
    gnnScore: float             # Điểm GNN (Node Embedding)
    behaviorBoost: float        # Điểm Boost từ Hành vi
    cvMatchScore: Optional[int] # mathScore của CV (lấy từ cột freelancer.match_score)
    
    model_config = ConfigDict(populate_by_name=True)    
# Thêm DTO này vào file Python của bạn (gần các DTO khác)

class RecruiterJobRequest(BaseModel):
    jobId: int
    recruiterId: int 
    topK: int = 50
@app.post("/recommend_candidates_for_job", response_model=List[CandidateResult])
def recommend_candidates_for_job(req: RecruiterJobRequest):
    conn = None
    cursor = None
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        job_id = req.jobId

        # ===========================================================
        # 1) Lấy JOB EMBEDDING
        # ===========================================================
        cursor.execute("""
            SELECT id, embedding, lat, lon
            FROM job 
            WHERE id = %s 
              AND userid = %s 
              AND active = 1 
              AND expdate >= CURRENT_DATE 
              AND embedding IS NOT NULL
        """, (job_id, req.recruiterId))

        job = cursor.fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job không tồn tại hoặc không có embedding.")

        job_id_db, job_emb_raw, job_lat, job_lon = job
        job_emb = np.array(parse_embedding(job_emb_raw))
        center_lat = float(job_lat) if job_lat else 0
        center_lon = float(job_lon) if job_lon else 0

        # Lấy embedding GNN của job
        job_gnn_emb = fetch_gnn_embedding(job_id_db, 'job', cursor)

        # ===========================================================
        # 2) Lấy danh sách candidates
        # ===========================================================
        cursor.execute("""
            SELECT f.id, f.name, f.job, f.skilldes, f.experiencedes, f.jobtarget,
                   f.experiencelevel, f.skilllevel, f.jobdefaultid, f.lat, f.lon, f.address,
                   u.province, u.ward, u.avatar, u.dateofbirth, f.cv, f.phone, f.email,
                   f.embedding, f.cv_embedding
            FROM freelancer f
            INNER JOIN usercommon u ON f.userid = u.id
            WHERE f.active = 1 AND f.embedding IS NOT NULL
            LIMIT %s
        """, (req.topK,))
        candidates = cursor.fetchall()

        results = []

        # ===========================================================
        # 3) Tính score cho từng candidate
        # ===========================================================
        for c in candidates:
            try:
                candidate_id = c[0]
                f_lat = safe_float(c[9])
                f_lon = safe_float(c[10])
                distance = haversine(center_lat, center_lon, f_lat, f_lon)

                # Lọc theo khoảng cách
                if distance > 500:
                    continue

                # Parse profile embedding
                f_emb = np.array(parse_embedding(c[19]))
                if np.linalg.norm(f_emb) < 0.1:
                    continue

                # ============================================
                # 🎯 CV embedding score (THÊM MỚI)
                # ============================================
                cv_emb_raw = c[20]
                cv_emb = None
                cv_sim = 0.0

                if cv_emb_raw:
                    try:
                        if isinstance(cv_emb_raw, list):
                            cv_emb = np.array(cv_emb_raw, dtype=float)
                        else:
                            cv_emb = np.array(json.loads(cv_emb_raw), dtype=float)

                        cv_sim = max(cosine(cv_emb, job_emb), 0)
                    except:
                        cv_sim = 0.0

                # Similarity profile–job
                profile_sim = max(cosine(f_emb, job_emb), 0)

                # Hợp nhất similarity (profile + CV)
                # profile 60% + CV 40%
                unified_similarity = profile_sim * 0.60 + cv_sim * 0.40

                # Skill level score
                skill_score = min(c[7] / 10, 1)

                # Behavior score
                behavior_score = min(get_behavior_boost(candidate_id, job_id, cursor), 1.0)

                # Experience score
                job_exp_level = 0
                cand_exp_level = float(c[6]) if c[6] is not None else 0
                exp_diff = abs(cand_exp_level - job_exp_level)
                experience_score = max(1 - exp_diff * 0.25, 0)

                # Location score
                if distance <= 10:
                    location_score = 1
                elif distance <= 100:
                    location_score = 0.7
                elif distance <= 300:
                    location_score = 0.3
                else:
                    location_score = 0.05

                # GNN score
                gnn_score = 0.0
                cand_gnn_emb = fetch_gnn_embedding(candidate_id, 'candidate', cursor)
                if cand_gnn_emb is not None and job_gnn_emb is not None:
                    gnn_score = max(cosine(cand_gnn_emb, job_gnn_emb), 0)

                # ===========================================================
                # 🎯 FINAL SCORE (KHÔNG ĐỤNG REQUEST/RESPONSE)
                # ===========================================================
                final_score = (
                    unified_similarity * 0.45 +     # dùng similarity mới (profile + CV)
                    behavior_score * 0.20 +
                    experience_score * 0.10 +
                    location_score * 0.10 +
                    gnn_score * 0.10 +
                    0.05                             # recency score = 0.05 nếu muốn
                )

                results.append(CandidateResult(
                    id=c[0],
                    name=safe_str(c[1]),
                    job=safe_str(c[2]),
                    skillDes=safe_str(c[3]),
                    experienceDes=safe_str(c[4]),
                    jobTarget=safe_str(c[5]),
                    experienceLevel=int(c[6]) if c[6] is not None else 0,
                    skillLevel=int(c[7]) if c[7] is not None else 0,
                    phone=safe_str(c[17]),
                    email=safe_str(c[18]),
                    avatar=safe_str(c[14]),

                    # === giữ nguyên schema response ===
                    score=round(final_score, 4),
                    similarityScore=round(unified_similarity, 4),
                    gnnScore=round(gnn_score, 4),
                    behaviorBoost=round(behavior_score, 4),
                    cvMatchScore=0.0   # giữ nguyên response nhưng không dùng
                ))

            except Exception as e:
                print("Error ", c[0], e)
                continue

        # ===========================================================
        # Sort theo điểm
        # ===========================================================
        results.sort(key=lambda x: x.score, reverse=True)
        return results

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


############################

class CandidateResult(BaseModel):
    id: int
    name: str
    job: str
    skillDes: Optional[str]
    experienceDes: Optional[str]
    jobTarget: Optional[str]
    experienceLevel: int
    skillLevel: int
    avatar: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    score: float
    similarityScore: float
    gnnScore: float
    behaviorBoost: float
    cvMatchScore: float

# Hàm Utility để xử lý chuỗi (giả định)
def safe_str(s):
    return s if s is not None else ""

# Hàm tính khoảng cách cosine (1 - similarity)
def cosine_distance(vec1, vec2):
    """Trả về 1 - cosine similarity, giống PostgreSQL <=> operator"""
    if vec1 is None or vec2 is None:
        return 1.0
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 1.0
    # Đảm bảo đầu vào là List[float] hoặc numpy array
    return 1 - np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


# Pydantic Model cho Request, chứa tất cả dữ liệu Freelancer
class JobFreelancerRequest(BaseModel):
    jobId: int
    freelancerId: int
    # Dữ liệu tính toán
    freelancerEmbedding: List[float]
    matchScore: float # Đây là f.math_score ban đầu (CV match score)
    
    # Dữ liệu dùng để tạo CandidateResult
    name: str
    job: str
    skillDes: Optional[str] = None
    experienceDes: Optional[str] = None
    jobTarget: Optional[str] = None
    experienceLevel: Optional[int] = 0
    skillLevel: Optional[int] = 0
    avatar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


@app.post("/calculate_candidate_score", response_model=CandidateResult)
def calculate_candidate_score(req: JobFreelancerRequest):
    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. Lấy Job embedding (VẪN PHẢI TRUY VẤN DB)
        cursor.execute("""
            SELECT id, embedding 
            FROM job 
            WHERE id = %s AND active = 1 AND expdate >= CURRENT_DATE AND embedding IS NOT NULL
        """, (req.jobId,))
        job = cursor.fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job không tồn tại hoặc không có embedding.")

        job_id_db, job_emb_raw = job
        job_emb_vec = parse_embedding(job_emb_raw) # Chuyển từ DB string sang array

        # 2. Lấy Freelancer data (LẤY TỪ REQUEST BODY)
        freelancer_id = req.freelancerId
        math_score = req.matchScore # CV match score
        freelancer_emb_vec = req.freelancerEmbedding

        # 3. Tính similarity
        distance = cosine_distance(freelancer_emb_vec, job_emb_vec)
        similarity = 1 - distance
        similarity = max(0.0, min(1.0, similarity)) 

        # 4. Lấy GNN embedding (VẪN PHẢI TRUY VẤN DB)
        gnn_candidate = fetch_gnn_embedding(freelancer_id, 'candidate', cursor)
        gnn_job = fetch_gnn_embedding(job_id_db, 'job', cursor)
        gnn_score = 0.0
        if gnn_candidate is not None and gnn_job is not None:
            # Giả định hàm 'cosine' trả về similarity
            raw = cosine(gnn_candidate, gnn_job)
            if math.isnan(raw):
                 raw = 0
            gnn_score = max(raw, 0)



        # 6. Final Score
        final_score = similarity * 0.15 + gnn_score * 0.1 + math_score * 0.75

        # 7. Trả về kết quả (Sử dụng dữ liệu từ Request)
        result = CandidateResult(
            id=freelancer_id,
            name=safe_str(req.name),
            job=safe_str(req.job),
            skillDes=safe_str(req.skillDes),
            experienceDes=safe_str(req.experienceDes),
            jobTarget=safe_str(req.jobTarget),
            experienceLevel=req.experienceLevel if req.experienceLevel is not None else 0,
            skillLevel=req.skillLevel if req.skillLevel is not None else 0,
            avatar=safe_str(req.avatar),
            phone=safe_str(req.phone),
            email=safe_str(req.email),
            score=round(final_score, 4),
            similarityScore=round(similarity, 4),
            gnnScore=round(gnn_score, 4),
            behaviorBoost=0.0, 
            cvMatchScore=round(math_score, 2),
        )
        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
        
# try:
#     from run_model import main_gnn_process
# except ImportError:
#     print("LỖI: Không tìm thấy file gnn_core.py hoặc hàm main_gnn_process. Vui lòng kiểm tra lại tên file.")
#     exit(1)

# --- Cấu trúc Pydantic Models Mới (Chi tiết hơn) ---
class RunInfo(BaseModel):
    # Sử dụng None để có thể khởi tạo dễ dàng
    nodes_count: int | None = 0
    edges_count: int | None = 0
    candidates_count: int | None = 0
    jobs_count: int | None = 0
    model_name: str | None = None
    
class StatusResponse(BaseModel):
    is_running: bool
    last_run_time: str | None
    last_end_time: str | None # THÊM
    last_duration: float | None # THÊM
    last_success: bool | None # THÊM
    last_result_message: str # Đổi tên cho rõ ràng
    info: RunInfo # THÊM

class TrainResponse(BaseModel):
    message: str
    status: StatusResponse
class HistoryEntry(BaseModel):
    id: int
    start_time: str
    end_time: str
    duration_sec: float
    success: bool
    message: str
    nodes_count: int
    edges_count: int
    candidates_count: int
    jobs_count: int
    model_name: str

# --- Global state Mới (Phòng trường hợp không có lần chạy nào) ---
# Dùng cấu trúc chi tiết hơn để lưu trữ kết quả lần cuối
training_status = {
    "is_running": False,
    "last_run_time": None,
    "last_end_time": None,
    "last_duration": None,
    "last_success": None,
    "last_result_message": "Chưa có lần chạy nào.",
    "info": RunInfo().model_dump() # Khởi tạo thông tin chi tiết rỗng
}
# app.py (Hàm run_gnn_in_background được Sửa đổi)

def run_gnn_in_background():
    """Hàm wrapper chạy GNN và cập nhật trạng thái global với thông tin chi tiết."""
    global training_status
    
    if training_status["is_running"]:
        return

    training_status["is_running"] = True
    training_status["last_result_message"] = "Đang chạy..."
    
    # Reset các trường khác khi bắt đầu
    training_status["last_success"] = None
    training_status["last_duration"] = None
    training_status["last_run_time"] = datetime.now().isoformat()
    
    success = False
    message = "Quá trình thất bại trước khi hoàn thành."
    info_dict = training_status["info"] # Dùng info hiện tại làm default

    try:
        # Gọi hàm chính (NHẬN 3 GIÁ TRỊ TRẢ VỀ)
        # Lưu ý: gnn_core.main_gnn_process phải được sửa để trả về (success, message, info_dict)
        success, message, info_dict = main_gnn_process() 
        
    except Exception as e:
        import traceback
        message = f"Lỗi nghiêm trọng trong quá trình GNN: {e}. Traceback: {traceback.format_exc()}"
    
    finally:
        # Cập nhật trạng thái Global
        training_status["is_running"] = False
        training_status["last_success"] = success
        training_status["last_result_message"] = message
        training_status["info"] = info_dict

        # Cập nhật thời gian và duration
        if "start_time" in info_dict and "end_time" in info_dict:
            training_status["last_run_time"] = info_dict["start_time"]
            training_status["last_end_time"] = info_dict["end_time"]
            
            try:
                start_time_obj = datetime.fromisoformat(info_dict["start_time"])
                end_time_obj = datetime.fromisoformat(info_dict["end_time"])
                training_status["last_duration"] = (end_time_obj - start_time_obj).total_seconds()
            except ValueError:
                 print("Lỗi chuyển đổi thời gian ISO")
  
  # app.py (Hàm mới để tương tác DB)

def fetch_history_from_db(limit: int = 10) -> List[HistoryEntry]:
    """Kết nối DB và lấy N lần chạy lịch sử gần nhất."""
    conn = None
    history_data = []
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Truy vấn lịch sử, sắp xếp theo thời gian mới nhất
        cur.execute(f"""
            SELECT id, start_time, end_time, duration_sec, success, message, 
                   nodes_count, edges_count, candidates_count, jobs_count, model_name 
            FROM gnn_run_history 
            ORDER BY start_time DESC LIMIT %s
        """, (limit,))
        
        for row in cur.fetchall():
            row_list = list(row)
            
            # Chuyển đổi đối tượng datetime sang chuỗi ISO 8601 để phù hợp với Pydantic model
            row_list[1] = row_list[1].isoformat() # start_time
            row_list[2] = row_list[2].isoformat() # end_time
            
            # Khởi tạo Pydantic model
            history_data.append(HistoryEntry(
                id=row_list[0],
                start_time=row_list[1],
                end_time=row_list[2],
                duration_sec=row_list[3],
                success=row_list[4],
                message=row_list[5],
                nodes_count=row_list[6],
                edges_count=row_list[7],
                candidates_count=row_list[8],
                jobs_count=row_list[9],
                model_name=row_list[10]
            ))
        
        return history_data
        
    except Exception as e:
        # Nếu có lỗi DB (ví dụ: không kết nối được, bảng không tồn tại), trả về list rỗng
        print(f"Lỗi khi tải lịch sử từ database: {e}")
        return []
    finally:
        if conn: conn.close()        

# --- Endpoint để kích hoạt Training ---
@app.post("/train-gnn", response_model=TrainResponse)
def train_gnn_endpoint(background_tasks: BackgroundTasks):
    """Kích hoạt quá trình huấn luyện mô hình GNN và export embeddings."""
    global training_status

    if training_status["is_running"]:
        raise HTTPException(
            status_code=429, 
            detail="Quá trình huấn luyện đang chạy. Vui lòng thử lại sau."
        )

    # Thêm hàm chạy GNN vào BackgroundTasks
    background_tasks.add_task(run_gnn_in_background)

    # Lấy trạng thái hiện tại (Đang chạy...) để trả về
    return TrainResponse(
        message="Bắt đầu quá trình huấn luyện GNN trong nền. Kiểm tra trạng thái sau một lát.",
        status=training_status
    )

# --- Endpoint để kiểm tra trạng thái ---
@app.get("/status", response_model=StatusResponse)
def get_status():
    """Kiểm tra trạng thái của lần chạy huấn luyện GNN gần nhất với thông tin chi tiết."""
    return training_status                 
# app.py (Thêm Endpoint)

@app.get("/history", response_model=List[HistoryEntry])
def get_history_endpoint(limit: int = 10):
    """
    Lấy lịch sử các lần chạy GNN từ database.
    Mặc định trả về 10 lần chạy gần nhất.
    """
    return fetch_history_from_db(limit)