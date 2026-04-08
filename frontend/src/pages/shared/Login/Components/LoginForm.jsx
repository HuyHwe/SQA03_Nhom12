// src/pages/shared/Login/Components/LoginForm.jsx
import { Link } from "react-router-dom";

const BRAND = { primary: "#2563eb", primaryHover: "#1d4ed8" };

export default function LoginForm({
    register,
    errors,
    isSubmitting,
    showPwd,
    setShowPwd,
    onSubmit
}) {
    return (
        <div className="w-full max-w-[520px] justify-self-start">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
                    Đăng nhập PTIT E-Learning
                </h1>
                <p className="mt-3 text-sm text-gray-600">
                    Đăng nhập để tiếp tục học, xem khoá đã mua và đồng bộ tiến độ.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {"root" in errors && errors.root?.message && (
                    <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                        {errors.root.message}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="nhap@email.com"
                        className={`w-full rounded-full border px-5 py-3 outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                            }`}
                        style={!errors.email ? { borderColor: BRAND.primary } : {}}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">Mật khẩu</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPwd ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={`w-full rounded-full border px-5 py-3 pr-12 outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                                }`}
                            style={!errors.password ? { borderColor: BRAND.primary } : {}}
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                            aria-label={showPwd ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full text-white py-3 transition disabled:opacity-60"
                    style={{ backgroundColor: BRAND.primary }}
                >
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p className="text-sm text-gray-600 text-center">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" style={{ color: BRAND.primary }} className="font-medium">
                        Tạo tài khoản ngay
                    </Link>
                </p>
            </form>
        </div>
    );
}
