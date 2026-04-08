// src/pages/instructor/LessonUpload.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Upload, FileText, PlayCircle, ArrowLeft, Trash2, CheckCircle2, Loader2
} from "lucide-react";

const API_BASE = "http://localhost:5102/api";

export default function LessonUpload() {
  const { id, lessonId } = useParams(); // id = courseContentId
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`${API_BASE}/course-content/${id}/lessons/${lessonId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLesson(data);
        setResources(data.resources || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải bài học.");
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [id, lessonId]);

  const uploadFile = async (file, type = "video") => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      setProgress(0);

      // demo giả lập upload — thay bằng real API POST /api/files/upload
      await new Promise((r) => {
        const t = setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              clearInterval(t);
              r();
            }
            return Math.min(p + 10, 100);
          });
        }, 100);
      });

      const fakeUrl = `${API_BASE}/uploads/${file.name}`;
      if (type === "video") {
        setLesson((l) => ({ ...l, videoUrl: fakeUrl }));
      } else {
        setResources((r) => [...r, { name: file.name, url: fakeUrl }]);
      }
      setUploading(false);
      setProgress(0);
      return fakeUrl;
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert("Lỗi upload file.");
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...lesson, resources };
      const res = await fetch(`${API_BASE}/course-content/${id}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      alert("Đã lưu liên kết file thành công!");
    } catch {
      alert("Không thể lưu thông tin upload.");
    }
  };

  const removeResource = (name) => {
    setResources((r) => r.filter((f) => f.name !== name));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center p-10 text-gray-600">Đang tải dữ liệu bài học...</div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center p-10 text-rose-600">{error}</div>
        <Footer />
      </div>
    );

  if (!lesson)
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center p-10 text-gray-600">Không có dữ liệu bài học.</div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" /> Upload tài nguyên bài học
            </h1>
            <p className="text-gray-600">📘 {lesson.title}</p>
          </div>
          <Link
            to={`/i/courses/${id}/lessons`}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* VIDEO */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600" /> Video bài học
          </h2>
          {lesson.videoUrl ? (
            <div className="rounded-xl overflow-hidden border">
              <video controls src={lesson.videoUrl} className="w-full aspect-video" />
            </div>
          ) : (
            <div className="text-sm text-gray-600">Chưa có video được upload.</div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <button
              disabled={!videoFile || uploading}
              onClick={() => uploadFile(videoFile, "video")}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload video
            </button>
          </div>

          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>

        {/* RESOURCES */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Tài nguyên đính kèm
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                files.forEach((f) => uploadFile(f, "resource"));
              }}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>

          {resources.length > 0 ? (
            <ul className="divide-y">
              {resources.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> {r.name}
                  </a>
                  <button
                    onClick={() => removeResource(r.name)}
                    className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Xoá
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">Chưa có tài nguyên nào được tải lên.</div>
          )}
        </div>

        {/* SAVE */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
