// src/pages/shared/BecomInstructor/components/UpgradeResult.jsx
import { CheckCircle2 } from "lucide-react";
import { InfoRow, TokenRow } from "./Common";

export default function UpgradeResult({ result, completedAt, loginData }) {
    if (!result) {
        return (
            <div className="rounded-2xl border bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Kết quả nâng cấp</h3>
                <p className="text-sm text-gray-600">
                    Chưa có dữ liệu. Hãy bấm <b>Nâng cấp thành giảng viên</b> để chạy luồng
                    API.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Kết quả nâng cấp</h3>
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã nâng cấp thành công{" "}
                    {completedAt ? `• ${completedAt.toLocaleTimeString()}` : ""}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="userId" value={result.userId || "—"} />
                    <InfoRow label="fullName" value={result.fullName || "—"} />
                    <InfoRow label="studentId" value={result.studentId || "—"} />
                    <InfoRow
                        label="teacherId"
                        value={result.teacherId || "—"}
                        highlight={Boolean(result.teacherId)}
                    />
                </div>

                <TokenRow label="token (mới)" value={result.token} />
                <TokenRow label="refreshToken" value={result.refreshToken} />

                {loginData && (
                    <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-700">
                            Chi tiết dữ liệu bước Login
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
                            {JSON.stringify(loginData, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}
