// // src/pages/instructor/CourseReviews.jsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";
// import {
//   ArrowLeft, Search, Filter, ArrowUpDown, Download, MessageSquareMore, Eye, EyeOff,
//   CheckCircle2, Ban, Trash2, Star, StarHalf, Sparkles, ShieldAlert, ChevronLeft, ChevronRight,
// } from "lucide-react";

// /* ===================== MOCK DATA (thay bằng API sau) ===================== */
// const NAMES = ["Lê Minh", "Nguyễn Hoa", "Phạm Tuấn", "Trần Dũng", "Vũ Hạnh", "Phan Huy", "Bùi Nga", "Đỗ Lộc"];
// const STATUS = ["visible", "pending", "hidden", "flagged"];

// function makeReview(i) {
//   const rating = [5,5,4,4,3,5,2,1][i % 8];
//   const status = STATUS[i % STATUS.length];
//   return {
//     id: 5000 + i,
//     user: NAMES[i % NAMES.length],
//     email: `user${i+1}@mail.com`,
//     avatar: null,
//     rating,
//     title: rating >= 4 ? "Khoá rất hữu ích cho React!" : rating === 3 ? "Ổn, có thể tốt hơn" : "Chưa như kỳ vọng",
//     content:
//       rating >= 4
//         ? "Nội dung chi tiết, ví dụ rõ ràng. Mong có thêm phần nâng cao về performance."
//         : rating === 3
//         ? "Một số bài hơi nhanh, quiz nên đa dạng hơn."
//         : "Video âm lượng chưa đều, ví dụ chưa sát thực tế.",
//     createdAt: `2025-11-${String((i % 27) + 1).padStart(2,"0")} 1${i%10}:0${i%6}`,
//     helpfulUp: Math.floor(Math.random()*30),
//     helpfulDown: Math.floor(Math.random()*6),
//     status, // visible | pending | hidden | flagged
//     featured: i % 13 === 0,
//   };
// }
// const MOCK_REVIEWS = Array.from({ length: 67 }, (_, i) => makeReview(i));

// /* ===================== SMALL UI HELPERS ===================== */
// const badgeByStatus = {
//   visible: "bg-emerald-100 text-emerald-700",
//   pending: "bg-amber-100 text-amber-700",
//   hidden: "bg-gray-100 text-gray-700",
//   flagged: "bg-rose-100 text-rose-700",
// };

// function Stars({ value }) {
//   const full = Math.floor(value);
//   const half = value - full >= 0.5;
//   return (
//     <span className="inline-flex items-center">
//       {Array.from({ length: full }).map((_, i) => <Star key={`f-${i}`} className="w-4 h-4 text-amber-500 fill-amber-400" />)}
//       {half && <StarHalf className="w-4 h-4 text-amber-500 fill-amber-400" />}
//       {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => <Star key={`e-${i}`} className="w-4 h-4 text-gray-300" />)}
//     </span>
//   );
// }

// function Bar({ pct, label }) {
//   return (
//     <div className="flex items-center gap-3">
//       <span className="w-10 text-xs text-gray-600">{label}</span>
//       <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
//         <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
//       </div>
//       <span className="w-8 text-right text-xs text-gray-600">{pct}%</span>
//     </div>
//   );
// }

// function Spark({ data }) {
//   // vẽ sparkline đơn giản 120x36
//   const W = 120, H = 36;
//   const max = Math.max(...data), min = Math.min(...data);
//   const step = W / (data.length - 1 || 1);
//   const norm = (v) => (max === min ? H/2 : H - ((v - min) / (max - min)) * H);
//   const pts = data.map((v, i) => `${i*step},${norm(v)}`).join(" L ");
//   const tone = data.at(-1) >= data[0] ? "text-emerald-600" : "text-rose-600";
//   return (
//     <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={tone}>
//       <path d={`M ${pts}`} fill="none" stroke="currentColor" strokeWidth="2" />
//     </svg>
//   );
// }

// /* ===================== PAGE ===================== */
// const PAGE_SIZE = 10;

// export default function CourseReviews() {
//   const { id } = useParams();

//   useEffect(() => window.scrollTo(0, 0), []);

//   // --------- state
//   const [q, setQ] = useState("");
//   const [status, setStatus] = useState("all"); // all | visible | pending | hidden | flagged
//   const [ratingMin, setRatingMin] = useState(0); // 0..5
//   const [sortBy, setSortBy] = useState("recent"); // recent | rating | helpful
//   const [selected, setSelected] = useState(new Set());
//   const [page, setPage] = useState(1);

//   // reply modal
//   const [replyFor, setReplyFor] = useState(null);
//   const [replyText, setReplyText] = useState("");

//   // --------- derived
//   const filtered = useMemo(() => {
//     const ql = q.trim().toLowerCase();
//     let arr = MOCK_REVIEWS.filter(r => {
//       const okQ = !ql || r.user.toLowerCase().includes(ql) || r.email.toLowerCase().includes(ql) || r.title.toLowerCase().includes(ql) || r.content.toLowerCase().includes(ql);
//       const okS = status === "all" ? true : r.status === status;
//       const okR = r.rating >= ratingMin;
//       return okQ && okS && okR;
//     });
//     arr = arr.sort((a,b) => {
//       if (sortBy === "rating") return b.rating - a.rating;
//       if (sortBy === "helpful") return (b.helpfulUp - b.helpfulDown) - (a.helpfulUp - a.helpfulDown);
//       // recent (string compare ok cho mock YYYY-MM-DD HH:mm)
//       return b.createdAt.localeCompare(a.createdAt);
//     });
//     return arr;
//   }, [q, status, ratingMin, sortBy]);

//   const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const safePage = Math.min(page, pages);
//   const view = filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);

//   const allSelectedOnPage = view.length > 0 && view.every(r => selected.has(r.id));
//   const toggleAll = () => {
//     const next = new Set(selected);
//     if (allSelectedOnPage) view.forEach(r => next.delete(r.id));
//     else view.forEach(r => next.add(r.id));
//     setSelected(next);
//   };

//   // --------- stats for sidebar
//   const stats = useMemo(() => {
//     const total = filtered.length;
//     const visible = filtered.filter(r => r.status === "visible").length;
//     const pending = filtered.filter(r => r.status === "pending").length;
//     const hidden = filtered.filter(r => r.status === "hidden").length;
//     const flagged = filtered.filter(r => r.status === "flagged").length;
//     const avg = Math.round((filtered.reduce((s,r)=>s+r.rating,0) / (total || 1)) * 10) / 10;
//     const dist = [5,4,3,2,1].map(star => Math.round(100 * filtered.filter(r => r.rating===star).length / (total || 1)));
//     const trend = Array.from({length: 12}, (_,i)=> 3.2 + Math.sin(i/2)*0.6 + (i/12)); // mock
//     return { total, visible, pending, hidden, flagged, avg, dist, trend };
//   }, [filtered]);

//   // --------- bulk actions (demo)
//   const clearSel = () => setSelected(new Set());
//   const bulk = {
//     approve: () => { alert(`Duyệt ${selected.size} review (demo).`); clearSel(); },
//     hide: () => { alert(`Ẩn ${selected.size} review (demo).`); clearSel(); },
//     delete: () => { if (confirm(`Xoá ${selected.size} review?`)) { alert("Đã xoá (demo)."); clearSel(); } },
//   };

//   const exportCSV = () => {
//     const rows = [
//       ["id","user","email","rating","title","content","createdAt","helpfulUp","helpfulDown","status","featured"],
//       ...filtered.map(r => [
//         r.id, r.user, r.email, r.rating, r.title, r.content, r.createdAt, r.helpfulUp, r.helpfulDown, r.status, r.featured ? "yes":"no"
//       ])
//     ].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
//     const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `course_${id}_reviews.csv`; a.click(); URL.revokeObjectURL(url);
//   };

//   const openReply = (rev) => { setReplyFor(rev); setReplyText(""); };
//   const sendReply = () => {
//     if (!replyText.trim()) return;
//     alert(`Đã gửi phản hồi cho #${replyFor.id} (demo):\n"${replyText.trim()}"`);
//     setReplyFor(null); setReplyText("");
//   };

//   // ================== UI ==================
//   return (
//     <div className="min-h-screen w-screen max-w-none bg-white">
//       <Header />

//       {/* HERO */}
//       <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
//         <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Link to={`/i/courses/${id}`} className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
//               <ArrowLeft className="w-4 h-4" /> Quay về khoá
//             </Link>
//             <div>
//               <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">⭐ Đánh giá khoá học #{id}</h1>
//               <p className="text-gray-600">Duyệt/ẩn, trả lời đánh giá, theo dõi chất lượng nội dung</p>
//             </div>
//           </div>
//           <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
//             <Download className="w-4 h-4" /> Export CSV
//           </button>
//         </div>
//       </section>

//       <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-8">
//         {/* LEFT: toolbar + table */}
//         <section className="space-y-6">
//           {/* Toolbar */}
//           <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="relative md:w-[44%]">
//               <input
//                 value={q}
//                 onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
//                 placeholder="Tìm tên/email/tiêu đề/nội dung…"
//                 className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <Filter className="w-4 h-4 text-gray-600" />
//               <select value={status} onChange={(e)=>{ setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
//                 <option value="all">Tất cả trạng thái</option>
//                 <option value="visible">Visible</option>
//                 <option value="pending">Pending</option>
//                 <option value="hidden">Hidden</option>
//                 <option value="flagged">Flagged</option>
//               </select>

//               <span className="text-sm text-gray-600 ml-2">Tối thiểu</span>
//               <select value={ratingMin} onChange={(e)=>{ setRatingMin(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
//                 <option value={0}>0⭐</option>
//                 <option value={1}>1⭐</option>
//                 <option value={2}>2⭐</option>
//                 <option value={3}>3⭐</option>
//                 <option value={4}>4⭐</option>
//                 <option value={5}>5⭐</option>
//               </select>

//               <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
//               <select value={sortBy} onChange={(e)=> setSortBy(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
//                 <option value="recent">Mới nhất</option>
//                 <option value="rating">Điểm cao → thấp</option>
//                 <option value="helpful">Hữu ích cao → thấp</option>
//               </select>
//             </div>
//           </div>

//           {/* Bulk actions */}
//           {selected.size > 0 && (
//             <div className="rounded-xl border bg-indigo-50 border-indigo-200 p-3 flex items-center justify-between">
//               <div className="text-sm text-indigo-900">Đã chọn <b>{selected.size}</b> đánh giá</div>
//               <div className="flex items-center gap-2">
//                 <button onClick={bulk.approve} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2">
//                   <CheckCircle2 className="w-4 h-4" /> Duyệt (visible)
//                 </button>
//                 <button onClick={bulk.hide} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2">
//                   <Ban className="w-4 h-4" /> Ẩn
//                 </button>
//                 <button onClick={bulk.delete} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2 text-rose-700 border-rose-200">
//                   <Trash2 className="w-4 h-4" /> Xoá
//                 </button>
//                 <button onClick={()=>setSelected(new Set())} className="rounded-lg border px-3 py-1.5 text-sm">Bỏ chọn</button>
//               </div>
//             </div>
//           )}

//           {/* Table */}
//           <div className="rounded-2xl border bg-white overflow-hidden">
//             <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
//               <div className="col-span-5 flex items-center gap-3">
//                 <input type="checkbox" checked={allSelectedOnPage} onChange={toggleAll} /> Đánh giá
//               </div>
//               <div className="col-span-2">Điểm</div>
//               <div className="col-span-2">Hữu ích</div>
//               <div className="col-span-1">Ngày</div>
//               <div className="col-span-2 text-right">Thao tác</div>
//             </div>

//             {view.map(r => {
//               const checked = selected.has(r.id);
//               const helpful = r.helpfulUp - r.helpfulDown;
//               return (
//                 <div key={r.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-start">
//                   <div className="col-span-5 flex items-start gap-3">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={(e)=> {
//                         const next = new Set(selected);
//                         e.target.checked ? next.add(r.id) : next.delete(r.id);
//                         setSelected(next);
//                       }}
//                     />
//                     <div className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-bold">
//                       {r.user.slice(0,1)}
//                     </div>
//                     <div className="min-w-0">
//                       <div className="flex items-center gap-2">
//                         <div className="font-medium text-gray-900">{r.user}</div>
//                         {r.featured && (
//                           <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
//                             <Sparkles className="w-3 h-3" /> featured
//                           </span>
//                         )}
//                         {r.status !== "visible" && (
//                           <span className={`text-[11px] px-2 py-0.5 rounded-full ${badgeByStatus[r.status]}`}>{r.status}</span>
//                         )}
//                       </div>
//                       <div className="text-xs text-gray-600 truncate">{r.email}</div>
//                       <div className="mt-1 font-semibold text-gray-900 line-clamp-1">{r.title}</div>
//                       <div className="text-sm text-gray-700 line-clamp-2">{r.content}</div>
//                     </div>
//                   </div>

//                   <div className="col-span-2">
//                     <div className="flex items-center gap-2">
//                       <Stars value={r.rating} />
//                       <span className="text-sm font-semibold text-gray-800">{r.rating}.0</span>
//                     </div>
//                   </div>

//                   <div className="col-span-2 text-sm text-gray-800">
//                     <span className={`${helpful >= 0 ? "text-emerald-700" : "text-rose-700"} font-semibold`}>{helpful >= 0 ? "+" : ""}{helpful}</span>
//                     <div className="text-xs text-gray-500">{r.helpfulUp} up • {r.helpfulDown} down</div>
//                   </div>

//                   <div className="col-span-1 text-sm text-gray-700">{r.createdAt.slice(0,10)}</div>

//                   <div className="col-span-2">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => openReply(r)}
//                         className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
//                         title="Trả lời"
//                       >
//                         <MessageSquareMore className="w-4 h-4" /> Reply
//                       </button>
//                       {r.status === "hidden" ? (
//                         <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1">
//                           <Eye className="w-4 h-4" /> Hiện
//                         </button>
//                       ) : (
//                         <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1">
//                           <EyeOff className="w-4 h-4" /> Ẩn
//                         </button>
//                       )}
//                       {r.status === "flagged" && (
//                         <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
//                           <ShieldAlert className="w-3 h-3" /> flagged
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-600">
//               Hiển thị {(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE, filtered.length)} / {filtered.length} đánh giá
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={()=> setPage(p=>Math.max(1,p-1))}
//                 disabled={safePage===1}
//                 className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage===1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
//               >
//                 <ChevronLeft className="w-4 h-4" /> Trước
//               </button>
//               <span className="text-sm">Trang <b>{safePage}</b> / {pages}</span>
//               <button
//                 onClick={()=> setPage(p=>Math.min(pages,p+1))}
//                 disabled={safePage===pages}
//                 className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage===pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
//               >
//                 Sau <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* RIGHT: insights */}
//         <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
//           <div className="rounded-2xl border bg-white p-5">
//             <div className="text-xs text-gray-600">Điểm trung bình</div>
//             <div className="mt-1 flex items-center gap-3">
//               <div className="text-3xl font-extrabold text-gray-900">{stats.avg.toFixed(1)}</div>
//               <Stars value={stats.avg} />
//             </div>
//             <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
//               <div className="rounded-xl border p-3">
//                 <div className="text-xs text-gray-600">Tổng đánh giá</div>
//                 <div className="text-xl font-extrabold text-blue-700">{stats.total}</div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="text-xs text-gray-600">Đang hiển thị</div>
//                 <div className="text-xl font-extrabold text-emerald-700">{stats.visible}</div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="text-xs text-gray-600">Chờ duyệt</div>
//                 <div className="text-xl font-extrabold text-amber-700">{stats.pending}</div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="text-xs text-gray-600">Bị ẩn/flag</div>
//                 <div className="text-xl font-extrabold text-rose-700">{stats.hidden + stats.flagged}</div>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl border bg-white p-5">
//             <h3 className="text-sm font-bold text-gray-900 mb-3">Phân bố xếp hạng</h3>
//             <div className="grid gap-2">
//               <Bar pct={stats.dist[0]} label="5⭐" />
//               <Bar pct={stats.dist[1]} label="4⭐" />
//               <Bar pct={stats.dist[2]} label="3⭐" />
//               <Bar pct={stats.dist[3]} label="2⭐" />
//               <Bar pct={stats.dist[4]} label="1⭐" />
//             </div>
//           </div>

//           <div className="rounded-2xl border bg-white p-5">
//             <h3 className="text-sm font-bold text-gray-900 mb-3">Xu hướng điểm trung bình</h3>
//             <Spark data={stats.trend} />
//             <div className="mt-2 text-xs text-gray-600">
//               Từ {stats.trend[0].toFixed(1)} → {stats.trend.at(-1).toFixed(1)} trong 12 mốc.
//             </div>
//           </div>
//         </aside>
//       </main>

//       {/* Reply Modal */}
//       {replyFor && (
//         <div className="fixed inset-0 z-40 bg-black/30">
//           <div className="absolute inset-x-0 top-[10vh] mx-auto w-[min(640px,92vw)] rounded-2xl border bg-white shadow-xl">
//             <div className="px-5 py-4 border-b flex items-center justify-between">
//               <div className="font-bold text-gray-900">Trả lời đánh giá #{replyFor.id}</div>
//               <button onClick={()=>setReplyFor(null)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>
//             <div className="p-5 grid gap-3">
//               <div className="text-sm">
//                 <div className="font-semibold text-gray-900">{replyFor.title}</div>
//                 <div className="text-gray-700">{replyFor.content}</div>
//                 <div className="mt-1 text-xs text-gray-500">{replyFor.user} • {replyFor.createdAt}</div>
//               </div>
//               <textarea
//                 rows={5}
//                 value={replyText}
//                 onChange={(e)=> setReplyText(e.target.value)}
//                 placeholder="Nhập phản hồi tới học viên…"
//                 className="rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <div className="flex items-center justify-end gap-2">
//                 <button onClick={()=>setReplyFor(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Huỷ</button>
//                 <button onClick={sendReply} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold">
//                   Gửi phản hồi
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// }
































// src/pages/instructor/CourseReviews.jsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";
// import {
//   Star, StarHalf, StarOff, Search, Filter, ArrowUpDown, Download, Eye, EyeOff,
//   MessageCircle, Pin, PinOff, Trash2, ChevronLeft, ChevronRight, CalendarDays,
//   UserRound, BarChart3
// } from "lucide-react";

// /** ========= Mock (thay bằng API thật) =========
//  * API thật:
//  *  - GET  api/{courseId}/reviews
//  *  - PATCH api/{courseId}/reviews/{reviewId}
//  */
// const MOCK = [
//   {
//     reviewId: "rv-1001",
//     userId: 42,
//     userName: "Lê Minh",
//     userEmail: "le.minh@example.com",
//     rating: 5,
//     content: "Khoá rất thực tế. Mình thích phần Router & tối ưu hiệu năng.",
//     createdAt: "2025-11-04T09:32:11.1200000",
//     updatedAt: "2025-11-04T09:32:11.1200000",
//     status: "visible",      // visible | hidden
//     featured: true,
//     replies: [
//       { id: "rep-1", by: "Instructor", content: "Cảm ơn Minh đã phản hồi!", at: "2025-11-05T10:02:05.0000000" },
//     ],
//   },
//   {
//     reviewId: "rv-1002",
//     userId: 77,
//     userName: "Nguyễn Hoa",
//     userEmail: "ng.hoa@mail.com",
//     rating: 4,
//     content: "Giải thích rõ ràng. Nếu có thêm phần JWT nâng cao thì tốt.",
//     createdAt: "2025-10-30T20:14:00.0000000",
//     updatedAt: "2025-11-02T08:50:00.0000000",
//     status: "visible",
//     featured: false,
//     replies: [],
//   },
//   {
//     reviewId: "rv-1003",
//     userId: 91,
//     userName: "Phạm Tuấn",
//     userEmail: "ptuan@mail.com",
//     rating: 3,
//     content: "Ổn, nhưng một vài video hơi nhanh.",
//     createdAt: "2025-10-22T13:00:00.0000000",
//     updatedAt: "2025-10-22T13:00:00.0000000",
//     status: "hidden",
//     featured: false,
//     replies: [],
//   },
// ];

// const fmtDate = (iso) => {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
// };

// const PAGE_SIZE = 8;

// export default function CourseReviews() {
//   const { id } = useParams();               // courseId
//   const navigate = useNavigate();

//   useEffect(() => window.scrollTo(0, 0), []);

//   // ===== data state
//   const [items, setItems] = useState(MOCK);

//   // ===== ui state
//   const [q, setQ] = useState("");
//   const [ratingFilter, setRatingFilter] = useState("all");  // all | 5..1
//   const [statusFilter, setStatusFilter] = useState("all");  // all | visible | hidden | featured
//   const [sortBy, setSortBy] = useState("recent");           // recent | rating_desc | rating_asc
//   const [page, setPage] = useState(1);

//   // reply/edit state
//   const [replyFor, setReplyFor] = useState(null); // reviewId
//   const [replyText, setReplyText] = useState("");
//   const [editingId, setEditingId] = useState(null); // reviewId
//   const [draft, setDraft] = useState({ content: "", rating: 0 });

//   // ===== derived
//   const dist = useMemo(() => {
//     const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
//     items.forEach(r => { d[r.rating] = (d[r.rating] ?? 0) + 1; });
//     return d;
//   }, [items]);

//   const avg = useMemo(() => {
//     if (!items.length) return 0;
//     const s = items.reduce((a, r) => a + r.rating, 0);
//     return Math.round((s / items.length) * 10) / 10;
//   }, [items]);

//   const visibleCount = items.filter(r => r.status === "visible").length;
//   const hiddenCount = items.filter(r => r.status === "hidden").length;
//   const featuredCount = items.filter(r => r.featured).length;

//   const filtered = useMemo(() => {
//     const k = q.trim().toLowerCase();
//     let arr = items.filter((r) => {
//       const okQ = !k
//         || r.content.toLowerCase().includes(k)
//         || r.userName.toLowerCase().includes(k)
//         || r.userEmail.toLowerCase().includes(k);
//       const okRate = ratingFilter === "all" ? true : r.rating === Number(ratingFilter);
//       const okStatus =
//         statusFilter === "all"
//           ? true
//           : statusFilter === "featured"
//           ? r.featured
//           : r.status === statusFilter;
//       return okQ && okRate && okStatus;
//     });

//     arr = arr.sort((a, b) => {
//       if (sortBy === "rating_desc") return b.rating - a.rating;
//       if (sortBy === "rating_asc") return a.rating - b.rating;
//       // recent by updatedAt/createdAt
//       return (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt);
//     });

//     return arr;
//   }, [items, q, ratingFilter, statusFilter, sortBy]);

//   const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const safePage = Math.min(page, pages);
//   const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

//   useEffect(() => setPage(1), [q, ratingFilter, statusFilter, sortBy]);

//   // ===== actions (mock)
//   const toggleVisibility = (r) => {
//     setItems(arr =>
//       arr.map(x => x.reviewId === r.reviewId ? { ...x, status: x.status === "visible" ? "hidden" : "visible" } : x)
//     );
//     // TODO: PATCH api/{courseId}/reviews/{reviewId} { status }
//   };

//   const toggleFeatured = (r) => {
//     setItems(arr =>
//       arr.map(x => x.reviewId === r.reviewId ? { ...x, featured: !x.featured } : x)
//     );
//     // TODO: PATCH api/{courseId}/reviews/{reviewId} { featured }
//   };

//   const deleteReply = (reviewId, replyId) => {
//     setItems(arr =>
//       arr.map(x =>
//         x.reviewId === reviewId ? { ...x, replies: x.replies.filter(rep => rep.id !== replyId) } : x
//       )
//     );
//   };

//   const sendReply = () => {
//     if (!replyFor || !replyText.trim()) return;
//     setItems(arr =>
//       arr.map(x =>
//         x.reviewId === replyFor
//           ? {
//               ...x,
//               replies: [
//                 ...x.replies,
//                 { id: `rep-${Date.now()}`, by: "Instructor", content: replyText.trim(), at: new Date().toISOString() },
//               ],
//             }
//           : x
//       )
//     );
//     setReplyText("");
//     setReplyFor(null);
//     // TODO: PATCH api/{courseId}/reviews/{reviewId} (append reply) — tuỳ backend
//   };

//   const startEdit = (r) => {
//     setEditingId(r.reviewId);
//     setDraft({ content: r.content, rating: r.rating });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setDraft({ content: "", rating: 0 });
//   };

//   const saveEdit = () => {
//     if (!validate(draft)) return;
//     setItems(arr =>
//       arr.map(x =>
//         x.reviewId === editingId ? { ...x, content: draft.content.trim(), rating: draft.rating, updatedAt: new Date().toISOString() } : x
//       )
//     );
//     cancelEdit();
//     // Lưu ý: theo API, sửa review là quyền của người đã gửi (student). Với trang quản trị,
//     // bạn có thể chỉ cho phép ẩn/hiện/ghim + phản hồi. Giữ saveEdit() làm mock.
//     // TODO: PATCH api/{courseId}/reviews/{reviewId}
//   };

//   const exportCSV = () => {
//     const csv = [
//       ["reviewId","userId","userName","userEmail","rating","content","status","featured","createdAt","updatedAt"],
//       ...filtered.map(r => [r.reviewId, r.userId, r.userName, r.userEmail, r.rating, r.content, r.status, r.featured ? "yes" : "no", r.createdAt, r.updatedAt]),
//     ].map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `course_${id}_reviews.csv`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   // ===== UI
//   return (
//     <div className="min-h-screen w-screen max-w-none bg-white">
//       <Header />

//       {/* HERO */}
//       <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
//         <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">⭐ Đánh giá khóa #{id}</h1>
//             <p className="text-gray-600">Duyệt/ẩn, phản hồi và xem thống kê đánh giá</p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
//               <Download className="w-4 h-4" /> Export CSV
//             </button>
//             <Link to={`/i/courses/${id}/students`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
//               <UsersIcon /> Học viên
//             </Link>
//           </div>
//         </div>
//       </section>

//       <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.5fr_420px] gap-8">
//         {/* LEFT: list & controls */}
//         <section className="space-y-6">
//           {/* Toolbar */}
//           <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="relative md:w-[44%]">
//               <input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="Tìm theo tên, email hoặc nội dung…"
//                 className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter className="w-4 h-4 text-gray-600" />
//               <select
//                 value={ratingFilter}
//                 onChange={(e) => setRatingFilter(e.target.value)}
//                 className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
//               >
//                 <option value="all">Tất cả sao</option>
//                 <option value="5">5 sao</option>
//                 <option value="4">4 sao</option>
//                 <option value="3">3 sao</option>
//                 <option value="2">2 sao</option>
//                 <option value="1">1 sao</option>
//               </select>

//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
//               >
//                 <option value="all">Tất cả trạng thái</option>
//                 <option value="visible">Hiển thị</option>
//                 <option value="hidden">Đã ẩn</option>
//                 <option value="featured">Được ghim</option>
//               </select>

//               <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
//               >
//                 <option value="recent">Mới cập nhật</option>
//                 <option value="rating_desc">Sao ↓</option>
//                 <option value="rating_asc">Sao ↑</option>
//               </select>
//             </div>
//           </div>

//           {/* List */}
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//             {view.length === 0 && (
//               <div className="col-span-full text-center text-gray-600 border rounded-2xl p-10">
//                 Chưa có đánh giá nào khớp bộ lọc.
//               </div>
//             )}

//             {view.map((r) => {
//               const editing = editingId === r.reviewId;
//               return (
//                 <article key={r.reviewId} className={`rounded-2xl border bg-white p-5 ${r.status === "hidden" ? "opacity-75" : ""}`}>
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-full bg-slate-900 text-white grid place-items-center text-[10px] font-bold">
//                           {r.userName.slice(0,1)}
//                         </div>
//                         <div className="min-w-0">
//                           <div className="font-semibold text-gray-900 truncate">{r.userName}</div>
//                           <div className="text-[11px] text-gray-500 truncate">{r.userEmail}</div>
//                         </div>
//                       </div>
//                       <div className="text-xs text-gray-600 mt-1 inline-flex items-center gap-2">
//                         <CalendarDays className="w-4 h-4" /> {fmtDate(r.createdAt)}
//                         {r.updatedAt && <span>• Cập nhật: {fmtDate(r.updatedAt)}</span>}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 shrink-0">
//                       <button
//                         onClick={() => toggleFeatured(r)}
//                         className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50"
//                         title={r.featured ? "Bỏ ghim" : "Ghim (featured)"}
//                       >
//                         {r.featured ? <Pin className="w-4 h-4 text-indigo-600" /> : <PinOff className="w-4 h-4" />}
//                       </button>
//                       <button
//                         onClick={() => toggleVisibility(r)}
//                         className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50"
//                         title={r.status === "visible" ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
//                       >
//                         {r.status === "visible" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </button>
//                     </div>
//                   </div>

//                   {/* rating + content */}
//                   {!editing ? (
//                     <>
//                       <div className="mt-3"><StarStatic value={r.rating} /></div>
//                       <p className="mt-2 text-gray-800 text-sm whitespace-pre-wrap">{r.content}</p>

//                       {/* replies */}
//                       {r.replies?.length ? (
//                         <div className="mt-3 rounded-lg border bg-gray-50 p-3">
//                           <div className="text-xs font-semibold text-gray-700 mb-2">Phản hồi</div>
//                           <div className="grid gap-2">
//                             {r.replies.map(rep => (
//                               <div key={rep.id} className="rounded border bg-white p-2 text-sm">
//                                 <div className="text-[11px] text-gray-500">{rep.by} • {fmtDate(rep.at)}</div>
//                                 <div className="text-gray-800">{rep.content}</div>
//                                 <div className="mt-1 text-right">
//                                   <button
//                                     onClick={() => deleteReply(r.reviewId, rep.id)}
//                                     className="text-[11px] text-gray-500 rounded border px-2 py-0.5 hover:bg-gray-50 inline-flex items-center gap-1"
//                                   >
//                                     <Trash2 className="w-3.5 h-3.5" /> Xoá
//                                   </button>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : null}

//                       {/* actions */}
//                       <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => { setReplyFor(r.reviewId); setReplyText(""); }}
//                             className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
//                           >
//                             <MessageCircle className="w-4 h-4" /> Phản hồi
//                           </button>
//                           {/* Chỉ để demo — thực tế instructor thường không sửa nội dung review của học viên */}
//                           <button
//                             onClick={() => startEdit(r)}
//                             className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
//                           >
//                             Sửa nội dung
//                           </button>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <Link
//                             to={`/i/courses/${id}/students/${r.userId}`}
//                             className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
//                           >
//                             <BarChart3 className="w-4 h-4" /> Xem tiến độ
//                           </Link>
//                           <Link
//                             to={`/s/profile/${r.userId}`}
//                             className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
//                           >
//                             <UserRound className="w-4 h-4" /> Hồ sơ
//                           </Link>
//                         </div>
//                       </div>

//                       {/* reply editor */}
//                       {replyFor === r.reviewId && (
//                         <div className="mt-3 rounded-xl border p-3 bg-gray-50">
//                           <textarea
//                             value={replyText}
//                             onChange={(e) => setReplyText(e.target.value)}
//                             rows={3}
//                             className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                             placeholder="Viết phản hồi của giảng viên… (tối thiểu 5 ký tự)"
//                           />
//                           <div className="mt-2 flex items-center justify-end gap-2">
//                             <button
//                               onClick={() => { setReplyFor(null); setReplyText(""); }}
//                               className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white"
//                             >
//                               Huỷ
//                             </button>
//                             <button
//                               onClick={sendReply}
//                               disabled={replyText.trim().length < 5}
//                               className={`rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-1 ${
//                                 replyText.trim().length < 5 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white hover:bg-gray-100"
//                               }`}
//                             >
//                               Gửi
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <div className="mt-3 grid gap-3">
//                       <StarInput value={draft.rating} onChange={(v) => setDraft(d => ({ ...d, rating: v }))} />
//                       <textarea
//                         value={draft.content}
//                         onChange={(e) => setDraft(d => ({ ...d, content: e.target.value }))}
//                         rows={5}
//                         className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                         placeholder="Chỉnh sửa nội dung review (demo)…"
//                       />
//                       <div className="flex items-center justify-end gap-2 text-sm">
//                         <button onClick={saveEdit} className="rounded-lg border px-3 py-1.5 bg-white hover:bg-gray-100">
//                           Lưu
//                         </button>
//                         <button onClick={cancelEdit} className="rounded-lg border px-3 py-1.5 hover:bg-white">
//                           Huỷ
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </article>
//               );
//             })}
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-600">
//               Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đánh giá
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={safePage === 1}
//                 className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
//                   safePage === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
//                 }`}
//               >
//                 <ChevronLeft className="w-4 h-4" /> Trước
//               </button>
//               <span className="text-sm">
//                 Trang <b>{safePage}</b> / {pages}
//               </span>
//               <button
//                 onClick={() => setPage((p) => Math.min(pages, p + 1))}
//                 disabled={safePage === pages}
//                 className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
//                   safePage === pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
//                 }`}
//               >
//                 Sau <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* RIGHT: insights */}
//         <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
//           <div className="rounded-2xl border bg-white p-5">
//             <div className="text-xs text-gray-600">Điểm trung bình</div>
//             <div className="mt-1 text-3xl font-extrabold text-gray-900">{avg || "0"}</div>
//             <div className="text-xs text-gray-500">{items.length} đánh giá (hiển thị {visibleCount}, ẩn {hiddenCount}, ghim {featuredCount})</div>
//           </div>

//           {/* Distribution */}
//           <div className="rounded-2xl border bg-white p-5">
//             <div className="text-sm font-bold text-gray-900 mb-3">Phân phối số sao</div>
//             <div className="grid gap-2">
//               {[5,4,3,2,1].map(star => {
//                 const cnt = dist[star] || 0;
//                 const pct = Math.round((cnt / (items.length || 1)) * 100);
//                 return (
//                   <div key={star} className="grid grid-cols-[44px_1fr_48px] items-center gap-2">
//                     <div className="text-xs text-gray-600 inline-flex items-center gap-1">
//                       {star} <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
//                     </div>
//                     <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                       <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
//                     </div>
//                     <div className="text-xs text-gray-600 text-right">{cnt}</div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Quick actions */}
//           <div className="rounded-2xl border bg-white p-5">
//             <div className="text-sm font-bold text-gray-900 mb-2">Liên kết nhanh</div>
//             <div className="grid gap-2">
//               <button
//                 onClick={() => navigate(`/i/courses/${id}/students`)}
//                 className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
//               >
//                 <UsersIcon /> Quản lý học viên
//               </button>
//               <button
//                 onClick={() => navigate(`/courses/${id}`)}
//                 className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
//               >
//                 <Eye className="w-4 h-4" /> Xem trang public
//               </button>
//             </div>
//           </div>
//         </aside>
//       </main>

//       <Footer />
//     </div>
//   );
// }

// /* ===== Small UI ===== */
// function UsersIcon() {
//   return <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-.7.18-1.37.5-2H0c.22-1.03 2.94-2 8-2zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.9 1.97 3.45V19h6v-2c0-2.66-5.33-4-8-4z"/></svg>;
// }

// function StarStatic({ value = 0 }) {
//   return (
//     <div className="inline-flex items-center gap-1">
//       {Array.from({ length: 5 }, (_, i) => {
//         const n = i + 1;
//         if (value >= n) return <Star key={n} className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
//         if (value > n - 1 && value < n) return <StarHalf key={n} className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
//         return <StarOff key={n} className="w-4 h-4 text-gray-300" />;
//       })}
//       <span className="text-xs text-gray-700 ml-1">{value}/5</span>
//     </div>
//   );
// }

// function StarInput({ value, onChange }) {
//   return (
//     <div className="inline-flex items-center gap-1">
//       {Array.from({ length: 5 }, (_, i) => {
//         const n = i + 1;
//         return (
//           <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5" title={`${n} sao`}>
//             {value >= n ? (
//               <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
//             ) : (
//               <StarOff className="w-5 h-5 text-gray-300 hover:text-yellow-500" />
//             )}
//           </button>
//         );
//       })}
//       <span className="text-xs text-gray-600 ml-1">{value ? `${value}/5` : "Chọn số sao"}</span>
//     </div>
//   );
// }

// function validate({ rating, content }) {
//   if (!rating || rating < 1 || rating > 5) {
//     alert("Vui lòng chọn số sao (1–5).");
//     return false;
//   }
//   const t = (content || "").trim();
//   if (t.length < 5) {
//     alert("Nội dung tối thiểu 5 ký tự.");
//     return false;
//   }
//   if (t.length > 2000) {
//     alert("Nội dung tối đa 2000 ký tự.");
//     return false;
//   }
//   return true;
// }

































// src/pages/instructor/CourseReviews.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Star, Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight,
  Download, Reply, Edit3, Save, X, MessageSquare, CalendarDays
} from "lucide-react";

/**
 * Trang quản trị đánh giá khóa (Giảng viên)
 * - Mock dữ liệu theo format API: GET api/{courseId}/reviews
 * - Bộ lọc: theo số sao, có/không nội dung, có/không phản hồi GV
 * - Sắp xếp: mới nhất, cũ nhất, sao cao → thấp, thấp → cao
 * - Tìm kiếm theo tên/email nội dung
 * - Phân trang
 * - Trả lời (ghi chú/phản hồi của GV) — lưu local (demo)
 * - Export CSV
 *
 * Khi nối API:
 *  - Thay MOCK_REVIEWS bằng fetch GET api/{courseId}/reviews
 *  - Gửi PATCH api/{courseId}/reviews/{reviewId} khi người học chỉnh sửa (nếu có UI riêng)
 *  - Phản hồi của GV: nếu backend chưa có, tạm lưu local hoặc bổ sung endpoint riêng
 */

// ===== Mock reviews (ISO datetime) =====
const MOCK_REVIEWS = [
  {
    id: "r-1001",
    userId: "u-11",
    userName: "Lê Minh",
    userEmail: "le.minh@example.com",
    rating: 5,
    comment: "Khoá rất thực tế, ví dụ rõ ràng. Recommend!",
    createdAt: "2025-11-08T13:42:10.0000000",
    updatedAt: "2025-11-08T13:42:10.0000000",
    courseId: "react-18-pro",
  },
  {
    id: "r-1002",
    userId: "u-12",
    userName: "Nguyễn Hoa",
    userEmail: "hoa.nguyen@example.com",
    rating: 4,
    comment: "Nội dung chắc, thêm bài tập nâng cao nữa thì tuyệt.",
    createdAt: "2025-11-07T19:01:00.0000000",
    updatedAt: "2025-11-07T19:01:00.0000000",
    courseId: "react-18-pro",
  },
  {
    id: "r-1003",
    userId: "u-13",
    userName: "Phạm Tuấn",
    userEmail: "tuan.pham@example.com",
    rating: 3,
    comment: "",
    createdAt: "2025-11-05T08:15:30.0000000",
    updatedAt: "2025-11-05T08:15:30.0000000",
    courseId: "react-18-pro",
  },
  {
    id: "r-1004",
    userId: "u-14",
    userName: "Trần Dũng",
    userEmail: "dung.tran@example.com",
    rating: 2,
    comment: "Phần router hơi nhanh, cần chậm lại và có thêm ví dụ.",
    createdAt: "2025-11-04T21:25:00.0000000",
    updatedAt: "2025-11-04T21:25:00.0000000",
    courseId: "react-18-pro",
  },
];

const PAGE_SIZE = 10;

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

export default function CourseReviews() {
  const { id } = useParams(); // courseId
  const [q, setQ] = useState("");
  const [star, setStar] = useState("all"); // all | 5 | 4 | 3 | 2 | 1
  const [withText, setWithText] = useState("all"); // all | yes | no
  const [withReply, setWithReply] = useState("all"); // all | yes | no
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | star_desc | star_asc
  const [page, setPage] = useState(1);

  // phản hồi của GV (demo) — lưu localStorage theo reviewId
  const [replies, setReplies] = useState(() => {
    try {
      const v = localStorage.getItem(`course_${id}_review_replies`);
      return v ? JSON.parse(v) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(`course_${id}_review_replies`, JSON.stringify(replies));
    } catch {}
  }, [id, replies]);

  // in-place reply editor
  const [editing, setEditing] = useState(null); // reviewId
  const [draft, setDraft] = useState("");

  useEffect(() => window.scrollTo(0, 0), []);

  // Normally: const [data, setData] = useState([]); useEffect(fetch ...)
  const data = MOCK_REVIEWS.filter(r => r.courseId === id || id === "react-18-pro");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    let arr = [...data];

    if (star !== "all") arr = arr.filter(r => r.rating === Number(star));
    if (withText !== "all") {
      arr = arr.filter(r => (withText === "yes" ? r.comment?.trim() : !r.comment?.trim()));
    }
    if (withReply !== "all") {
      arr = arr.filter(r => {
        const has = !!replies[r.id]?.trim();
        return withReply === "yes" ? has : !has;
      });
    }
    if (key) {
      arr = arr.filter(r =>
        r.userName.toLowerCase().includes(key) ||
        r.userEmail.toLowerCase().includes(key) ||
        r.comment.toLowerCase().includes(key)
      );
    }

    arr.sort((a, b) => {
      if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === "star_desc") return b.rating - a.rating;
      if (sortBy === "star_asc") return a.rating - b.rating;
      // newest
      return b.createdAt.localeCompare(a.createdAt);
    });

    return arr;
  }, [data, q, star, withText, withReply, sortBy, replies]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ["reviewId", "userName", "userEmail", "rating", "comment", "createdAt", "updatedAt", "replyTeacher"],
      ...filtered.map(r => [
        r.id, r.userName, r.userEmail, r.rating, r.comment, r.createdAt, r.updatedAt, replies[r.id] ?? ""
      ])
    ].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `course_${id}_reviews.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const beginReply = (rid) => {
    setEditing(rid);
    setDraft(replies[rid] ?? "");
  };
  const cancelReply = () => {
    setEditing(null);
    setDraft("");
  };
  const saveReply = () => {
    if (!editing) return;
    setReplies(prev => ({ ...prev, [editing]: draft.trim() }));
    setEditing(null);
    setDraft("");
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">⭐ Đánh giá khoá #{id}</h1>
            <p className="text-gray-600">Xem, lọc, sắp xếp và phản hồi đánh giá của người học.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link to={`/i/courses/${id}`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
              Quay lại trang khoá
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-6">
        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên, email hoặc nội dung…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={star}
              onChange={(e) => { setStar(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Số sao: Tất cả</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
            </select>
          </div>

          <select
            value={withText}
            onChange={(e) => { setWithText(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            title="Lọc theo có/không comment text"
          >
            <option value="all">Nội dung: Tất cả</option>
            <option value="yes">Có nội dung</option>
            <option value="no">Không có</option>
          </select>

          <select
            value={withReply}
            onChange={(e) => { setWithReply(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            title="Lọc theo phản hồi GV"
          >
            <option value="all">Phản hồi: Tất cả</option>
            <option value="yes">Đã phản hồi</option>
            <option value="no">Chưa phản hồi</option>
          </select>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="star_desc">Sao cao → thấp</option>
              <option value="star_asc">Sao thấp → cao</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
            <div className="col-span-4">Người học</div>
            <div className="col-span-5">Nội dung</div>
            <div className="col-span-1 text-center">Sao</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {view.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-600">
              Không có đánh giá nào khớp bộ lọc hiện tại.
            </div>
          )}

          {view.map((r) => {
            const reply = replies[r.id] ?? "";
            const isEditing = editing === r.id;
            return (
              <div key={r.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 gap-3">
                {/* User */}
                <div className="col-span-4">
                  <div className="font-medium text-gray-900">{r.userName}</div>
                  <div className="text-xs text-gray-600">{r.userEmail}</div>
                  <div className="mt-1 text-[11px] text-gray-500 inline-flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {fmt(r.createdAt)}
                  </div>
                </div>

                {/* Comment & reply */}
                <div className="col-span-5 min-w-0">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {r.comment?.trim() ? r.comment : <span className="text-gray-500 italic">— Không có nội dung —</span>}
                  </div>

                  {/* Reply section */}
                  <div className="mt-3 rounded-lg border bg-gray-50 p-3">
                    <div className="text-xs text-gray-600 inline-flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Phản hồi của giảng viên
                    </div>

                    {!isEditing ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {reply ? reply : <span className="text-gray-500 italic">Chưa có phản hồi.</span>}
                        </div>
                        <button
                          onClick={() => beginReply(r.id)}
                          className="shrink-0 rounded-lg border px-3 py-1.5 text-sm hover:bg-white inline-flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> {reply ? "Sửa" : "Viết phản hồi"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={3}
                          placeholder="Nhập phản hồi của bạn…"
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={saveReply}
                            className="rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-2 text-emerald-700 border-emerald-200 hover:bg-white"
                          >
                            <Save className="w-4 h-4" /> Lưu
                          </button>
                          <button
                            onClick={cancelReply}
                            className="rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-2"
                          >
                            <X className="w-4 h-4" /> Huỷ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-1 text-center">
                  <div className="inline-flex items-center gap-1 text-amber-600">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Actions (optional expansion) */}
                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/courses/${id}`}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                      title="Xem trang public"
                    >
                      Xem public
                    </Link>
                    <button
                      onClick={() => beginReply(r.id)}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                      title="Trả lời"
                    >
                      <Reply className="w-4 h-4" /> Trả lời
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đánh giá
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm">Trang <b>{safePage}</b> / {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={safePage === pages}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage === pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
