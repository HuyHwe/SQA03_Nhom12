// src/pages/shared/BecomInstructor/components/UpgradeForm.jsx
import {
    AlertTriangle,
    Loader2,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

export default function UpgradeForm({
    employeeCode,
    instruction,
    setInstruction,
    loading,
    canSubmit,
    runFlow,
    resetAll,
    error,
    step,
}) {
    return (
        <div className="rounded-2xl border bg-white p-6 space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    Nhập thông tin xác thực
                </h2>
                <p className="text-sm text-gray-600">
                    Vui lòng điền chính xác theo hướng dẫn của quản trị.
                </p>
            </div>

            <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-800">Mã định danh</span>
                <input
                    value={employeeCode}
                    readOnly
                    className="rounded-xl border border-gray-300 bg-white text-gray-800 px-4 py-2 outline-none"
                    title="Mã này được điền tự động bởi hệ thống và không thể thay đổi."
                />
            </label>

            <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-800">Giới thiệu bản thân</span>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Hãy chia sẻ một chút về kinh nghiệm và mong muốn của bạn khi trở thành giảng viên..."
                    rows="4"
                    className="rounded-xl border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                />
            </label>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 inline-flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={runFlow}
                    disabled={!canSubmit}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ShieldCheck className="w-4 h-4" />
                    )}
                    Nâng cấp thành giảng viên
                </button>

                <button
                    onClick={resetAll}
                    disabled={loading}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* Tiến trình nhỏ */}
            {loading && (
                <div className="text-xs text-gray-600">
                    {step === 1 && "Đang gửi /Auth/register-teacher…"}
                    {step === 2 && "Đang làm mới token /Auth/refresh-token…"}
                </div>
            )}
        </div>
    );
}
