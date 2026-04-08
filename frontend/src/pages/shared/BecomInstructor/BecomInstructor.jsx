// src/pages/shared/BecomInstructor/BecomInstructor.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react"; 
import {
    isLoggedIn,
    authHeader,
    clearAllAuth, 
    getRefreshToken,
    setTokens,
} from "../../../utils/auth";
import { API_BASE_URL, checkTeacherEligibility as checkEligibilityApi } from "../Rankings/forumService";
import { safeErr } from "./utils/helpers";
import { HeroSection, UpgradeForm, UpgradeResult } from "./components";

/**
 * Lấy thông tin người dùng đã đăng nhập từ localStorage.
 * @returns {object|null} Đối tượng người dùng hoặc null nếu không có.
 */
const getLoggedInUser = () => {
    try {
        const user = JSON.parse(localStorage.getItem("app_user") || "null");
        console.log("Thông tin người dùng đã đăng nhập:", user); // Thêm dòng này để ghi vào console
        return user;
    } catch {
        return null;
    }
};

/**
 * Tạo một mã định danh ngẫu nhiên.
 * @param {number} length Độ dài của mã.
 * @returns {string} Mã ngẫu nhiên.
 */
const generateRandomCode = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `GV-${result}`;
};

export default function BecomInstructor() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isEligible, setIsEligible] = useState(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(true);

    // ===== Guard: chỉ cho phép truy cập khi đã đăng nhập & đủ điều kiện =====
    useEffect(() => {
        getLoggedInUser();
        if (!isLoggedIn()) {
            const redirect = encodeURIComponent(location.pathname + location.search);
            navigate(`/login?redirect=${redirect}`, { replace: true });
            return;
        }

        const checkEligibility = async () => {
            try {
                const isEligible = await checkEligibilityApi();
                setIsEligible(isEligible);
            } catch (error) {
                console.error("Failed to check eligibility:", error);
                setIsEligible(false); // Giả sử không đủ điều kiện nếu có lỗi
            } finally {
                setEligibilityLoading(false);
            }
        };

        checkEligibility();
    }, [navigate, location.pathname, location.search]);

    // Tự động điền employeeCode bằng một mã ngẫu nhiên
    const [employeeCode, setEmployeeCode] = useState(() => generateRandomCode());

    const [instruction, setInstruction] = useState("");

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0 idle, 1 register, 2 refresh
    const [error, setError] = useState("");

    const [result, setResult] = useState(null); // dữ liệu sau refresh-token
    const [completedAt, setCompletedAt] = useState(null);
    const [loginData, setLoginData] = useState(null); // Added missing state

    const canSubmit = useMemo(
        () => !!instruction.trim() && !loading,
        [employeeCode, instruction, loading]
    );

    const resetAll = () => {
        setEmployeeCode(generateRandomCode());
        setInstruction("");
        setLoading(false);
        setStep(0);
        setError("");
        setResult(null);
        setCompletedAt(null);
        setLoginData(null);
    };

    const handleUnauthorized = () => {
        clearAllAuth?.();
        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${redirect}`, { replace: true });
    };

    const runFlow = async () => {
        setError("");
        setResult(null);
        setCompletedAt(null);
        setLoginData(null);
        setLoading(true);

        try {
            // ===== B1: register-teacher (cần Authorization) =====
            setStep(1);
            const regRes = await fetch(`${API_BASE_URL}/api/Auth/register-teacher`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeader(),
                },
                body: JSON.stringify({
                    employeeCode: employeeCode.trim(),
                    instruction: instruction.trim(),
                }),
                mode: "cors",
            });

            if (regRes.status === 401) return handleUnauthorized();
            if (!regRes.ok)
                throw new Error(
                    (await safeErr(regRes)) ||
                    `Register teacher failed (HTTP ${regRes.status})`
                );

            // ===== B2: refresh-token bằng refreshToken đang lưu =====
            const storedRefresh = getRefreshToken();
            if (!storedRefresh) {
                throw new Error(
                    "Không tìm thấy refreshToken trong trình duyệt. Vui lòng đăng nhập lại rồi thử nâng cấp."
                );
            }

            setStep(2);
            const refRes = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: storedRefresh }),
                mode: "cors",
            });
            if (refRes.status === 401) return handleUnauthorized();
            if (!refRes.ok)
                throw new Error(
                    (await safeErr(refRes)) ||
                    `Refresh token failed (HTTP ${refRes.status})`
                );

            const refJson = await refRes.json();

            // Ghi lại token mới vào localStorage để phiên FE cập nhật ngay
            setTokens({
                accessToken: refJson?.token,
                refreshToken: refJson?.refreshToken,
            });

            setResult(refJson);
            setCompletedAt(new Date());

            // Cập nhật app_user để Header thấy ngay teacherId
            try {
                const cur = JSON.parse(localStorage.getItem("app_user") || "null") || {};
                const next = {
                    ...cur,
                    userId: refJson.userId ?? cur.userId ?? null,
                    fullName: refJson.fullName ?? cur.fullName ?? cur.name ?? "User",
                    name: refJson.fullName ?? cur.name ?? "User",
                    studentId: refJson.studentId ?? cur.studentId ?? null,
                    teacherId: refJson.teacherId ?? cur.teacherId ?? null,
                    roles: Array.isArray(cur.roles) ? cur.roles : [],
                };
                localStorage.setItem("app_user", JSON.stringify(next));
                window.dispatchEvent(new Event("app_user_updated"));
            } catch { }
        } catch (e) {
            const msg = String(e?.message || e || "");
            if (msg.toLowerCase().includes("cors")) {
                setError(
                    "CORS bị chặn. Hãy bật CORS trên API (AllowOrigin http://localhost:5173) và chắc chắn endpoint tồn tại (/api/Auth/register-teacher)."
                );
            } else {
                setError(msg || "Đã có lỗi xảy ra trong quá trình nâng cấp.");
            }
        } finally {
            setLoading(false);
            setStep(0);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <main className="w-full max-w-3xl mx-auto px-6 lg:px-0 py-8 space-y-8">
                {eligibilityLoading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600 p-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang kiểm tra điều kiện...</span>
                    </div>
                ) : isEligible ? (
                    <>
                        <UpgradeForm
                            employeeCode={employeeCode}
                            instruction={instruction}
                            setInstruction={setInstruction}
                            loading={loading}
                            canSubmit={canSubmit}
                            runFlow={runFlow}
                            resetAll={resetAll}
                            error={error}
                            step={step}
                        />
                        <UpgradeResult
                            result={result}
                            completedAt={completedAt}
                            loginData={loginData}
                        />
                    </>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">
                                🎓 Điều kiện nâng cấp lên Giảng viên
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Bạn sẽ đủ điều kiện đăng ký trở thành Giảng viên khi đáp ứng ít nhất một trong các tiêu chí sau:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-3">
                                <li>Tổng số điểm tích lũy của bạn vượt quá <strong>200 điểm</strong>, hoặc</li>
                                <li>Số điểm bạn đạt được trong tháng trước hoặc tháng hiện tại từ <strong>50 điểm</strong> trở lên.</li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-3">
                                Khi đáp ứng điều kiện trên, hệ thống sẽ cho phép bạn truy cập chức năng này để nâng cấp vai trò, tạo khóa học, chia sẻ kiến thức và đồng hành cùng cộng đồng học tập.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
