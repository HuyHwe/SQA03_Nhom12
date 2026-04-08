// src/pages/instructor/ExamEdit.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Save, Rocket, Download, Settings2, Timer, Layers3, Tag,
  Search, Filter, Upload, Eye, Plus, Trash2, GripVertical, ArrowUp, ArrowDown,
  History, GitBranch, Pencil, CheckCircle2
} from "lucide-react";

/* =========================
   MOCK SERVICES (demo)
   Thay bằng API thực khi sẵn sàng
========================= */
const MOCK_COURSES = [
  { id: 1, title: "React 18 Pro" },
  { id: 2, title: "Node.js RESTful API" },
  { id: 3, title: "SQL Practical" },
];

const MOCK_BANK = Array.from({ length: 80 }, (_, i) => {
  const types = ["mcq", "truefalse", "fill"];
  const diffs = ["easy", "medium", "hard"];
  const tags = [["JS"], ["React"], ["Node"], ["SQL"], ["CSS"], ["Async","JS"], ["Hooks","React"], ["HTTP","Node"]];
  const t = types[i % types.length];
  const d = diffs[i % diffs.length];
  const tg = tags[i % tags.length];
  return {
    id: 2000 + i,
    type: t,
    difficulty: d,
    tags: tg,
    text:
      t === "mcq" ? `Câu ngân hàng #${i+1}: Chủ đề ${tg[0]} – chọn đáp án đúng`
      : t === "truefalse" ? `Câu ngân hàng #${i+1}: Mệnh đề đúng/sai?`
      : `Câu ngân hàng #${i+1}: Điền cụm từ theo ${tg[0]}`,
    options: t === "mcq" ? ["A", "B", "C", "D"] : null,
    answer: t === "mcq" ? "A" : (t === "truefalse" ? "True" : "___"),
    points: d === "hard" ? 3 : d === "medium" ? 2 : 1,
    estSec: d === "hard" ? 120 : d === "medium" ? 90 : 60,
  };
});

// giả lập fetch draft theo id
const mockFetchExamDraft = async (id) => {
  // payload mẫu đã “tồn tại”
  return {
    id,
    title: "React Hooks – 40 câu",
    courseId: 1,
    description:
      "Đề đánh giá kiến thức React Hooks: useState/useEffect/useMemo/useContext, tối ưu hiệu năng, patterns thường gặp.",
    timeLimitMin: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    visibility: "unlisted", // private | unlisted | public
    versions: [
      { v: 5, at: "2025-11-05 14:22", by: "Lina", note: "Sửa 3 câu phần useEffect" },
      { v: 4, at: "2025-11-03 18:01", by: "Lina", note: "Thêm 5 câu medium" },
      { v: 3, at: "2025-10-31 09:17", by: "Lina", note: "Refactor mô tả & thời lượng" },
    ],
    questions: [
      // Một vài câu đã chọn sẵn
      { ...MOCK_BANK[1], id: 9001, text: "Hook nào để quản lý state?", type: "mcq", difficulty: "easy", tags: ["React","Hooks"], options: ["useState","useMemo","useRef","useId"], answer: "A", points: 1, estSec: 60 },
      { ...MOCK_BANK[2], id: 9002, text: "useEffect chạy sau mỗi lần render (đ/s)?", type: "truefalse", difficulty: "medium", tags: ["React"], options: null, answer: "True", points: 2, estSec: 90 },
      { ...MOCK_BANK[3], id: 9003, text: "Điền tên hook tối ưu memo hoá giá trị: ____", type: "fill", difficulty: "medium", tags: ["React","Hooks"], answer: "useMemo", points: 2, estSec: 90 },
    ],
    meta: { totalPoints: 5, totalSec: 240 },
  };
};

/* =============== UI HELPERS =============== */
const diffBadge = (d) =>
  d === "easy" ? "bg-emerald-100 text-emerald-700"
  : d === "medium" ? "bg-amber-100 text-amber-700"
  : "bg-rose-100 text-rose-700";

const typeBadge = (t) =>
  t === "mcq" ? "bg-indigo-100 text-indigo-700"
  : t === "truefalse" ? "bg-blue-100 text-blue-700"
  : "bg-violet-100 text-violet-700";

const fmtMinSec = (sec) => {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}’${String(s).padStart(2, "0")}”`;
};

/* =============== PAGE =============== */
export default function ExamEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // meta
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(MOCK_COURSES[0].id);
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [visibility, setVisibility] = useState("private");
  const [versions, setVersions] = useState([]);

  // selected questions
  const [selected, setSelected] = useState([]);
  const totalPoints = useMemo(() => selected.reduce((s, q) => s + q.points, 0), [selected]);
  const totalSec = useMemo(() => selected.reduce((s, q) => s + q.estSec, 0), [selected]);

  // bank filters
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fDiff, setFDiff] = useState("all");
  const [fTag, setFTag] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // modal edit question (quick)
  const [editingQ, setEditingQ] = useState(null); // object question | null
  const [editText, setEditText] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editOptions, setEditOptions] = useState(["", "", "", ""]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const draft = await mockFetchExamDraft(id);
      setTitle(draft.title);
      setCourseId(draft.courseId);
      setDescription(draft.description);
      setTimeLimit(draft.timeLimitMin);
      setShuffleQuestions(draft.shuffleQuestions);
      setShuffleOptions(draft.shuffleOptions);
      setVisibility(draft.visibility);
      setVersions(draft.versions || []);
      setSelected(draft.questions || []);
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [id]);

  // bank computed
  const bankTags = useMemo(() => {
    const all = new Set();
    MOCK_BANK.forEach(b => b.tags.forEach(t => all.add(t)));
    return ["all", ...Array.from(all)];
  }, []);

  const filteredBank = useMemo(() => {
    const key = q.trim().toLowerCase();
    return MOCK_BANK.filter(b => {
      const okQ = !key || b.text.toLowerCase().includes(key);
      const okT = fType === "all" || b.type === fType;
      const okD = fDiff === "all" || b.difficulty === fDiff;
      const okG = fTag === "all" || b.tags.includes(fTag);
      return okQ && okT && okD && okG;
    });
  }, [q, fType, fDiff, fTag]);

  const pages = Math.max(1, Math.ceil(filteredBank.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filteredBank.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ====== Actions ====== */
  const addToExam = (item) => {
    if (selected.find(x => x.id === item.id)) return;
    setSelected(arr => [...arr, item]);
  };
  const removeSel = (qid) => setSelected(arr => arr.filter(q => q.id !== qid));
  const moveUp = (idx) => {
    if (idx <= 0) return;
    const next = selected.slice();
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  };
  const moveDown = (idx) => {
    if (idx >= selected.length - 1) return;
    const next = selected.slice();
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    setSelected(next);
  };

  // quick edit modal
  const openEdit = (q) => {
    setEditingQ(q);
    setEditText(q.text);
    setEditAnswer(q.answer || "");
    setEditOptions(q.options ? q.options.slice() : ["", "", "", ""]);
  };
  const saveEditQuestion = () => {
    if (!editingQ) return;
    setSelected(arr =>
      arr.map(item =>
        item.id === editingQ.id
          ? { ...item, text: editText, answer: editAnswer, options: editingQ.type === "mcq" ? editOptions : null }
          : item
      )
    );
    setEditingQ(null);
  };

  const assemblePayload = () => ({
    id,
    title,
    courseId,
    description,
    timeLimitMin: timeLimit,
    shuffleQuestions,
    shuffleOptions,
    visibility,
    questions: selected.map((q, i) => ({
      order: i + 1,
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      tags: q.tags,
      text: q.text,
      options: q.options,
      answer: q.answer,
      points: q.points,
      estSec: q.estSec,
    })),
    meta: { totalPoints, totalSec },
  });

  const saveDraft = () => {
    if (!title.trim()) { alert("Nhập tên đề thi"); return; }
    console.log("SAVE_DRAFT_PAYLOAD", assemblePayload());
    alert("Đã lưu nháp (demo). Xem console payload.");
  };

  const publish = () => {
    if (selected.length === 0) { alert("Vui lòng thêm ít nhất 1 câu hỏi"); return; }
    if (!confirm("Xuất bản bản nháp hiện tại? (demo)")) return;
    console.log("PUBLISH_PAYLOAD", assemblePayload());
    alert("Đã publish (demo). Điều hướng về /i/exams");
    navigate("/i/exams");
  };

  const exportJSON = () => {
    const data = assemblePayload();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `exam_${id}_draft.json`; a.click(); URL.revokeObjectURL(url);
  };

  /* ====== UI ====== */
  if (loading) {
    return (
      <div className="min-h-screen w-screen max-w-none bg-white">
        <Header />
        <main className="w-full px-6 lg:px-12 py-16">
          <div className="animate-pulse text-sm text-gray-600">Đang tải bản nháp #{id}…</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/i/exams" className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Danh sách đề
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">✏️ Chỉnh sửa đề thi #{id}</h1>
              <p className="text-gray-600">Cập nhật meta, sắp xếp câu hỏi, thêm từ ngân hàng, lưu version</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportJSON} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button onClick={saveDraft} className="rounded-xl bg-slate-900 hover:opacity-95 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={publish} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8">
        {/* LEFT: Builder */}
        <section className="space-y-6">
          {/* Meta */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Settings2 className="w-4 h-4" /> Meta đề thi
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Tên đề thi</label>
                <input
                  value={title} onChange={(e)=>setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: React Hooks – 40 câu"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Khoá học</label>
                <select
                  value={courseId} onChange={(e)=>setCourseId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2"
                >
                  {MOCK_COURSES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Thời gian (phút)</label>
                <input
                  type="number" min={5} step={5}
                  value={timeLimit} onChange={(e)=>setTimeLimit(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Chế độ hiển thị</label>
                <select value={visibility} onChange={(e)=>setVisibility(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2">
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Mô tả</label>
                <textarea
                  rows={3}
                  value={description} onChange={(e)=>setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn về nội dung đề thi, đối tượng, lưu ý…"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={shuffleQuestions} onChange={(e)=>setShuffleQuestions(e.target.checked)} />
                Trộn thứ tự câu hỏi
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={shuffleOptions} onChange={(e)=>setShuffleOptions(e.target.checked)} />
                Trộn phương án (MCQ)
              </label>
              <div className="text-sm text-gray-700 inline-flex items-center gap-2">
                <Timer className="w-4 h-4" /> Giới hạn {timeLimit} phút
              </div>
            </div>
          </div>

          {/* Versions / Audit trail */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                <History className="w-4 h-4" /> Lịch sử phiên bản
              </div>
              <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Tạo version mới (demo)
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {versions.map(v => (
                <div key={v.v} className="rounded-xl border px-4 py-2 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-semibold">v{v.v}</span>
                    <span className="text-gray-600">{v.note}</span>
                  </div>
                  <div className="text-xs text-gray-500">{v.at} • {v.by}</div>
                </div>
              ))}
              {versions.length === 0 && <div className="text-sm text-gray-600">Chưa có lịch sử (demo).</div>}
            </div>
          </div>

          {/* Selected questions */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Câu hỏi trong đề</div>
              <div className="text-sm text-gray-600 inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Layers3 className="w-4 h-4" /> {selected.length} câu</span>
                <span className="inline-flex items-center gap-1"><Tag className="w-4 h-4" /> {totalPoints} điểm</span>
                <span className="inline-flex items-center gap-1"><Timer className="w-4 h-4" /> ~{fmtMinSec(totalSec)}</span>
              </div>
            </div>

            {selected.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">Chưa có câu hỏi. Hãy thêm từ ngân hàng ở panel bên phải.</div>
            ) : (
              <div className="divide-y">
                {selected.map((q, idx) => (
                  <div key={q.id} className="px-5 py-4 grid grid-cols-[24px_1fr_auto] items-start gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Câu {idx+1}</div>
                      <div className="font-medium text-gray-900">{q.text}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${diffBadge(q.difficulty)}`}>{q.difficulty}</span>
                        <span className={`px-2 py-0.5 rounded-full ${typeBadge(q.type)}`}>{q.type}</span>
                        {q.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full border">{t}</span>)}
                        <span className="px-2 py-0.5 rounded-full border">+{q.points} điểm</span>
                        <span className="px-2 py-0.5 rounded-full border">~{fmtMinSec(q.estSec)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>openEdit(q)} className="rounded-lg border px-2 py-1.5 hover:bg-gray-50" title="Sửa nhanh">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={()=>moveUp(idx)} className="rounded-lg border px-2 py-1.5 hover:bg-gray-50" title="Lên">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={()=>moveDown(idx)} className="rounded-lg border px-2 py-1.5 hover:bg-gray-50" title="Xuống">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button onClick={()=>removeSel(q.id)} className="rounded-lg border px-2 py-1.5 hover:bg-gray-50 text-rose-700 border-rose-200" title="Xoá">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Preview nhanh</div>
              <span className="text-xs text-gray-500">Mock – chỉ xem layout</span>
            </div>
            <div className="mt-4 border rounded-xl p-4">
              <div className="font-semibold text-gray-900">{title || "Tên đề thi"}</div>
              <div className="text-sm text-gray-600">
                Khoá học: {MOCK_COURSES.find(c=>c.id===courseId)?.title} • Giới hạn: {timeLimit} phút • Điểm: {totalPoints} • Ước tính: {fmtMinSec(totalSec)}
              </div>
              <ol className="mt-4 list-decimal pl-6 grid gap-2">
                {selected.slice(0,5).map((q)=>(
                  <li key={q.id} className="text-sm text-gray-800">{q.text}</li>
                ))}
                {selected.length>5 && <li className="text-xs text-gray-500">… {selected.length-5} câu nữa</li>}
              </ol>
            </div>
          </div>
        </section>

        {/* RIGHT: Question bank */}
        <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
          {/* Toolbar */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-bold text-gray-900 mb-3">Ngân hàng câu hỏi</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
                  placeholder="Tìm nội dung câu hỏi…"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="w-4 h-4" />
                <select value={fType} onChange={(e)=>{setFType(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                  <option value="all">Loại: tất cả</option>
                  <option value="mcq">MCQ</option>
                  <option value="truefalse">True/False</option>
                  <option value="fill">Fill</option>
                </select>
                <select value={fDiff} onChange={(e)=>{setFDiff(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                  <option value="all">Độ khó</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select value={fTag} onChange={(e)=>{setFTag(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                  {bankTags.map(t => <option key={t} value={t}>{t === "all" ? "Tag: tất cả" : t}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Hiển thị {(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE, filteredBank.length)} / {filteredBank.length} câu hỏi
              </div>
              <div className="flex items-center gap-2">
                <label className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> Nhập CSV
                  <input type="file" accept=".csv" onChange={(e)=>{
                    const f = e.target.files?.[0]; if (!f) return;
                    alert(`(Demo) Import ${f.name} – sẽ xử lý ở backend.`);
                    e.target.value = "";
                  }} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-7">Câu hỏi</div>
              <div className="col-span-2 text-center">Điểm</div>
              <div className="col-span-3 text-right">Thêm</div>
            </div>

            {view.map(item => (
              <div key={item.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-start">
                <div className="col-span-7">
                  <div className="font-medium text-gray-900">{item.text}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${diffBadge(item.difficulty)}`}>{item.difficulty}</span>
                    <span className={`px-2 py-0.5 rounded-full ${typeBadge(item.type)}`}>{item.type}</span>
                    {item.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full border">{t}</span>)}
                    <span className="px-2 py-0.5 rounded-full border">~{fmtMinSec(item.estSec)}</span>
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm font-semibold text-gray-800">+{item.points}</div>
                <div className="col-span-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={()=>addToExam(item)}
                      disabled={!!selected.find(x=>x.id===item.id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-2 ${selected.find(x=>x.id===item.id) ? "text-gray-400 border-gray-200 cursor-not-allowed" : "hover:bg-gray-50"}`}
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                    <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2" title="Xem nhanh">
                      <Eye className="w-4 h-4" /> Xem
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="px-5 py-3 flex items-center justify-between">
              <button
                onClick={()=>setPage(p=>Math.max(1,p-1))}
                disabled={safePage===1}
                className={`rounded-lg border px-3 py-1.5 text-sm ${safePage===1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
              >
                ‹ Trước
              </button>
              <div className="text-sm">Trang <b>{safePage}</b> / {pages}</div>
              <button
                onClick={()=>setPage(p=>Math.min(pages,p+1))}
                disabled={safePage===pages}
                className={`rounded-lg border px-3 py-1.5 text-sm ${safePage===pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
              >
                Sau ›
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* QUICK EDIT MODAL */}
      {editingQ && (
        <div className="fixed inset-0 z-40 bg-black/30">
          <div className="absolute inset-x-0 top-[8vh] mx-auto w-[min(880px,94vw)] rounded-2xl border bg-white shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-bold text-gray-900">Sửa câu hỏi</div>
              <button onClick={()=>setEditingQ(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Nội dung</label>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e)=>setEditText(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingQ.type === "mcq" && (
                <>
                  {editOptions.map((o, i) => (
                    <div key={i}>
                      <label className="text-xs text-gray-600">Phương án {String.fromCharCode(65+i)}</label>
                      <input
                        value={o}
                        onChange={(e)=>{
                          const next = editOptions.slice();
                          next[i] = e.target.value;
                          setEditOptions(next);
                        }}
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-600">Đáp án đúng</label>
                    <select value={editAnswer} onChange={(e)=>setEditAnswer(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2">
                      <option value="A">A</option><option value="B">B</option>
                      <option value="C">C</option><option value="D">D</option>
                    </select>
                  </div>
                </>
              )}

              {editingQ.type === "truefalse" && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Đáp án</label>
                  <select value={editAnswer} onChange={(e)=>setEditAnswer(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2">
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {editingQ.type === "fill" && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Đáp án mẫu</label>
                  <input
                    value={editAnswer}
                    onChange={(e)=>setEditAnswer(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    placeholder="Từ/ cụm từ mong đợi…"
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-between">
              <button onClick={()=>setEditingQ(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                Huỷ
              </button>
              <div className="flex items-center gap-2">
                <button onClick={saveEditQuestion} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
