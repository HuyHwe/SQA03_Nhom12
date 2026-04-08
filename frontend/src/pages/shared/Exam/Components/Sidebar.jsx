// src/pages/shared/Exam/Components/Sidebar.jsx
import { PRIMARY, PRIMARY_HOVER } from "../utils/examHelpers";

export default function Sidebar() {
    return (
        <aside className="space-y-4 lg:sticky lg:top-20 h-fit">
            <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">B</span>
                </div>
                <h3 className="font-semibold text-[#1a1a1a] mb-2">bilkecith</h3>
                <p className="text-xs text-[#677788] mb-3">
                    Đã học chưa có mục tiêu đề quá mục luyện tập của bạn. Tạo ngay
                </p>
                <button
                    className="w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: PRIMARY }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    type="button"
                >
                    Thống kê kết quả
                </button>
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
                <img
                    src="/ielts-exam-preparation-banner.jpg"
                    alt="IELTS Banner"
                    className="w-full h-40 object-cover"
                />
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 font-bold">📊</span>
                    </div>
                    <h4 className="font-semibold text-[#1a1a1a] text-sm">SCORE CALCULATOR</h4>
                </div>
                <p className="text-xs text-[#677788] mb-3">Tính điểm thi IELTS</p>
                <button
                    className="w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: PRIMARY }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    type="button"
                >
                    Tính điểm
                </button>
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">🔧</span>
                    </div>
                    <h4 className="font-semibold text-[#1a1a1a] text-sm">P Elearning</h4>
                </div>
                <p className="text-xs text-[#677788] mb-3">Trợ giúp phần facebook</p>
                <button
                    className="w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: PRIMARY }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    type="button"
                >
                    Cài đặt
                </button>
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg p-4">
                <img
                    src="/facebook-page-preview.jpg"
                    alt="Facebook Page"
                    className="w-full h-24 object-cover rounded mb-3"
                />
                <p className="text-xs text-[#677788] text-center">Theo dõi trang Facebook</p>
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
                <img
                    src="/ielts-course-promotion.jpg"
                    alt="Course Promo"
                    className="w-full h-24 object-cover"
                />
                <div className="p-3">
                    <p className="text-xs font-semibold text-[#1a1a1a] mb-2">Cộng đồng</p>
                    <button
                        className="w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: PRIMARY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                        type="button"
                    >
                        Xem khóa học
                    </button>
                </div>
            </div>

            <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
                <img
                    src="/toeic-course-promotion.jpg"
                    alt="TOEIC Course"
                    className="w-full h-24 object-cover"
                />
                <div className="p-3">
                    <p className="text-xs font-semibold text-[#1a1a1a] mb-2">Nhóm chat</p>
                    <button
                        className="w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: PRIMARY }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                        type="button"
                    >
                        Xem khóa học
                    </button>
                </div>
            </div>
        </aside>
    );
}
