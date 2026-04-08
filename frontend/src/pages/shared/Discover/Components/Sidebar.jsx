// src/pages/shared/Discover/Components/Sidebar.jsx
export default function Sidebar() {
    return (
        <aside className="space-y-6">
            {/* Quick tips */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h4 className="font-bold text-gray-900 mb-3">Mẹo chọn lộ trình</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Bắt đầu từ nền tảng (JS/Python) nếu bạn mới.</li>
                    <li>• Chọn 1 hướng chính (Frontend/Backend/Data/DevOps).</li>
                    <li>• Gắn mục tiêu theo tuần và đều đặn 60–90 phút/ngày.</li>
                </ul>
            </div>

            {/* Promo 1 */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                    <p className="text-sm text-slate-300 mb-1">Cộng đồng</p>
                    <h4 className="text-white font-bold mb-2">Discord lập trình Study4</h4>
                    <p className="text-slate-300 text-sm mb-4">
                        Chia sẻ code, review CV, mock interview mỗi tuần.
                    </p>
                    <button className="bg-white text-slate-900 rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90">
                        Tham gia ngay
                    </button>
                </div>
            </div>

            {/* Promo 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h4 className="font-bold text-gray-900 mb-2">Github Template Dự án</h4>
                <p className="text-sm text-gray-700 mb-4">
                    Boilerplate React/Node/SQL/CI-CD để bạn khởi tạo sản phẩm nhanh.
                </p>
                <button className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
                    Xem template
                </button>
            </div>
        </aside>
    );
}
