// src/pages/shared/About/Components/MissionSection.jsx
export default function MissionSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-white p-6">
                <h4 className="font-semibold text-slate-900">Lấy người học làm trung tâm</h4>
                <p className="mt-2 text-slate-700">Tối ưu trải nghiệm học tập, giảm ma sát, tăng động lực.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6">
                <h4 className="font-semibold text-slate-900">Đo lường & cải tiến liên tục</h4>
                <p className="mt-2 text-slate-700">Ra quyết định dựa trên dữ liệu & phản hồi thực tế.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6">
                <h4 className="font-semibold text-slate-900">Công nghệ vì hiệu quả</h4>
                <p className="mt-2 text-slate-700">AI/automation để học nhanh, nhớ lâu, đạt mục tiêu.</p>
            </div>
        </div>
    );
}
