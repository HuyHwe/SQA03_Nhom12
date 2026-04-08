// src/pages/shared/Register/Components/RegisterForm.jsx
import { Link } from "react-router-dom";
import TeacherFields from "./TeacherFields";

const BRAND = { primary: "#2563eb", primaryHover: "#1d4ed8", ring: "#bfdbfe" };

export default function RegisterForm({
    register,
    errors,
    isSubmitting,
    showPwd,
    setShowPwd,
    isTeacher,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {"root" in errors && errors.root?.message && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                    {errors.root.message}
                </div>
            )}

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Địa chỉ Email</label>
                <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nhap@email.com"
                    className={`w-full rounded-full border px-5 py-3 outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                        }`}
                    style={!errors.email ? { borderColor: BRAND.primary, boxShadow: `0 0 0 0 ${BRAND.ring}` } : {}}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Tài khoản</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nhập tài khoản của bạn"
                    className={`w-full rounded-full border px-5 py-3 outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                        }`}
                    style={!errors.name ? { borderColor: BRAND.primary } : {}}
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Mật khẩu</label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={`w-full rounded-full border px-5 py-3 pr-12 outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                            }`}
                        style={!errors.password ? { borderColor: BRAND.primary } : {}}
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute bg-transparent right-3 top-1/2 -translate-y-1/2 p-1 rounded-md focus:outline-none focus:ring-2"
                        aria-label={showPwd ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                        style={{ boxShadow: `0 0 0 2px transparent` }}
                    >
                        {showPwd ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3l18 18" /><path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a15.66 15.66 0 0 1-3.24 4.33" />
                                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                                <path d="M6.12 6.12A15.66 15.66 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 3.46-.54" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && <p id="password-error" className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember */}
            <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-blue-600" {...register("remember")} />
                Ghi nhớ đăng nhập
            </label>

            {/* Teacher option */}
            {/* <div className="rounded-xl border p-4">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" className="accent-blue-600" {...register("isTeacher")} />
                    Đăng ký tài khoản giảng viên
                </label>

                {isTeacher && <TeacherFields register={register} />}
            </div> */}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full text-white py-3 transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.primary)}
            >
                {isSubmitting && (
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeOpacity="0.25" strokeWidth="4" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="4" />
                    </svg>
                )}
                {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>

            <p className="text-sm text-gray-600 text-center">
                Đã có tài khoản?{" "}
                <Link to="/login" style={{ color: BRAND.primary }} className="font-medium">Đăng nhập ngay</Link>
            </p>
        </form>
    );
}
