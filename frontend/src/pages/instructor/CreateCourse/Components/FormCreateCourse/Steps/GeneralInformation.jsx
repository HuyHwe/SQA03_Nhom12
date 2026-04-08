import { useState, useEffect } from "react";
import { Star, Trash2, Plus, Info } from "lucide-react";
import { getCategories } from "../../../../../../api/categories.api";

function GeneralInformation( {
    course, 
    updateCourse, 
    outcomes, 
    setOutcomes,
    requirements,
    setRequirements
} ) {
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categories, setCategories] = useState([]);
    const [catError, setCatError] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
          try {
            setLoadingCategories(true);
            setCatError("");
            const res = await getCategories();
            const list = Array.isArray(res?.data) ? res.data : [];
            setCategories(list);
    
          } catch (err) {
            console.error("Load categories failed:", err);
            setCatError("Không tải được danh mục khoá học.");
          } finally {
            setLoadingCategories(false);
          }
        };
        loadCategories();
    }, []);


    return (
        <div className="rounded-2xl border bg-white p-6 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    1) Thông tin cơ bản
                </h2>
                <p className="text-sm text-gray-600">
                    Tiêu đề, mô tả ngắn, danh mục
                </p>
            </div>

            <div className="grid gap-4">
                <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-800">
                        Tiêu đề khoá học *
                    </span>
                    <input
                        value={course.title}
                        onChange={(e) => updateCourse("title", e.target.value)}
                        placeholder="VD: React 18 Pro — Hooks, Router, Performance"
                        className={`rounded-xl border px-4 py-2 outline-none focus:ring-2 ${!course.title
                            ? "border-rose-300 focus:ring-rose-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`} 
                    />
                    {!course.title && (
                        <span className="text-xs text-rose-600">
                            Vui lòng nhập tiêu đề khoá học
                        </span>
                    )}
                </label>

                <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-800">
                        Mô tả ngắn
                    </span>
                    <textarea
                        value={course.description}
                        onChange={(e) =>
                            updateCourse("description", e.target.value)
                        }
                        rows={3}
                        placeholder="Tóm tắt giá trị, kiến thức học viên đạt được..."
                        className="rounded-xl border px-4 py-2 outline-none focus:ring-2 border-gray-300 focus:ring-blue-200"
                    />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-800">
                            Danh mục
                        </span>
                        <select
                            value={course.categoryId}
                            onChange={(e) => {
                                updateCourse("categoryId", e.target.value)
                                updateCourse("categoryName", categories.find(c => c.id === e.target.value)?.name || "")
                            }}
                            disabled={loadingCategories}
                            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        >
                            {loadingCategories && (
                                <option value="">Đang tải...</option>
                            )}
                            {!loadingCategories &&
                                categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))
                            }
                        </select>
                        {!course.categoryId && (
                            <span className="text-xs text-rose-600">
                                Vui lòng chọn danh mục
                            </span>
                        )}
                        {catError && (
                            <span className="text-xs text-rose-600">
                                {catError}
                            </span>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-3">
                    <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-800">
                            Ảnh thumbnail (URL)
                        </span>
                        <input
                            value={course.thumbnail}
                            onChange={(e) => updateCourse("thumbnail", e.target.value)}
                            placeholder="https://..."
                            className="rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </label>
                </div>
            </div>

            {/* Outcomes & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <Star className="w-4 h-4 text-amber-600" /> Mục tiêu đạt được *
                    </div>
                    <ul className="space-y-2">
                        {outcomes.map((o, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <input
                            value={o}
                            onChange={(e) =>
                                setOutcomes((arr) =>
                                    arr.map((x, idx) =>
                                        idx === i ? e.target.value : x
                                    )
                                )
                            }
                            className="flex-1 rounded-lg border px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() =>
                                    setOutcomes((arr) =>
                                        arr.filter((_, idx) => idx !== i)
                                    )
                                }
                                className="rounded-lg border px-2 py-2 bg-transparent hover:bg-gray-50"
                            >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                        </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setOutcomes((arr) => [...arr, ""])}
                        className="mt-2 text-sm rounded-lg border px-3 py-2 bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm mục tiêu
                    </button>
                </div>

                <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <Info className="w-4 h-4 text-blue-600" /> Yêu cầu đầu vào
                    </div>
                    <ul className="space-y-2">
                        {requirements.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <input
                                value={r}
                                onChange={(e) =>
                                    setRequirements((arr) =>
                                    arr.map((x, idx) =>
                                        idx === i ? e.target.value : x
                                    )) 
                                }
                                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() =>
                                    setRequirements((arr) =>
                                    arr.filter((_, idx) => idx !== i)
                                    )
                                }
                                className="rounded-lg border px-2 py-2 bg-transparent hover:bg-gray-50"
                            >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                        </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setRequirements((arr) => [...arr, ""])}
                        className="mt-2 text-sm rounded-lg border px-3 py-2 bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm yêu cầu
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GeneralInformation;