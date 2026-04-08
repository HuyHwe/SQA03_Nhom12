// src/pages/shared/About/Components/ContactInfo.jsx
export default function ContactInfo() {
    return (
        <div id="contact" className="bg-white p-6 rounded-2xl border">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Liên hệ với chúng tôi</h3>
            <div className="space-y-2 text-slate-700">
                <p><span className="font-medium text-slate-900">Hotline:</span> 096 369 5525</p>
                <p><span className="font-medium text-slate-900">Email:</span> study4.team@gmail.com</p>
                <p className="text-sm text-slate-500 mt-3">Vui lòng liên hệ khi bạn cần hỗ trợ hoặc góp ý.</p>
            </div>
        </div>
    );
}
