// src/pages/shared/About/Components/BusinessInfo.jsx
export default function BusinessInfo() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl border">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Công ty chủ quản</h3>
                <div className="space-y-3 text-slate-700">
                    <p><span className="font-medium text-slate-900">Tên công ty:</span> Công ty TNHH Công Nghệ A Plus</p>
                    <p><span className="font-medium text-slate-900">Giấy ĐKKD:</span> 0109675459</p>
                    <p><span className="font-medium text-slate-900">Ngày cấp phép:</span> 17/06/2021</p>
                    <p>
                        <span className="font-medium text-slate-900">Địa chỉ:</span> Số 15, Ngõ 208 Giải Phóng, Phường Phương Liệt,
                        Quận Thanh Xuân, Thành phố Hà Nội, Việt Nam
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Trung tâm đào tạo</h3>
                <div className="space-y-3 text-slate-700">
                    <p><span className="font-medium text-slate-900">Tên trung tâm:</span> Trung tâm ngoại ngữ STUDY4</p>
                    <p><span className="font-medium text-slate-900">Giấy chứng nhận:</span> 2654/QĐ-SGDĐT</p>
                    <p><span className="font-medium text-slate-900">Cấp bởi:</span> Sở Giáo dục & Đào tạo Hà Nội</p>
                    <p>
                        <span className="font-medium text-slate-900">Địa chỉ:</span> Số 17, Ngõ 208 Giải Phóng, Phường Phương Liệt,
                        Quận Thanh Xuân, Thành phố Hà Nội, Việt Nam
                    </p>
                </div>
            </div>
        </div>
    );
}
