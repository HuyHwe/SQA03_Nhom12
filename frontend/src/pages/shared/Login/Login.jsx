// src/pages/shared/Login/Login.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import hero from "../../../assets/image-1-Jbf5HJr8.png";
import {
    isLoggedIn,
    setTokens,
    redirectBackAfterLogin,
    consumePendingNext,
} from "../../../utils/auth";
import { http } from "../../../utils/http";
import { getRoleBasedDashboard } from "../../../utils/userRole";

import LoginHero from "./Components/LoginHero";
import LoginForm from "./Components/LoginForm";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5102";

const schema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

function Login() {
    const [showPwd, setShowPwd] = useState(false);
    const nav = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const redirectQS = params.get("redirect");
    const returnToQS = params.get("returnTo");
    const fallbackAfterLogin = "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur",
    });

    // If already logged in, redirect
    useEffect(() => {
        if (!isLoggedIn()) return;
        const target = decodeURIComponent(redirectQS || returnToQS || "") || null;
        if (target) nav(target, { replace: true });
        else redirectBackAfterLogin(nav, fallbackAfterLogin);
    }, [redirectQS, returnToQS, nav]);

    const onSubmit = async (form) => {
        try {
            const res = await http(`${API_BASE}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", accept: "*/*" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                const msg = errJson?.message || "Email hoặc mật khẩu không đúng.";
                setError("root", { message: msg });
                return;
            }

            const data = await res.json();
            const accessToken = data?.accessToken || data?.token || data?.access_token;
            const refreshToken = data?.refreshToken || data?.refresh_token;

            if (!accessToken) {
                setError("root", { message: "Phản hồi đăng nhập không hợp lệ (thiếu accessToken)." });
                return;
            }

            // Save tokens
            setTokens({ accessToken, refreshToken });

            // Save auth_user for Blog pages
            try {
                localStorage.setItem(
                    "auth_user",
                    JSON.stringify({
                        token: accessToken,
                        refreshToken,
                        userId: data?.userId || null,
                        studentId: data?.studentId || null,
                        teacherId: data?.teacherId || null,
                        fullName: data?.fullName || null,
                    })
                );
            } catch { }

            // Navigate
            const targetQS = decodeURIComponent(redirectQS || returnToQS || "") || null;
            if (targetQS) {
                nav(targetQS, { replace: true });
                return;
            }

            const pending = consumePendingNext();
            if (pending) {
                nav(pending, { replace: true });
                return;
            }

            // Role-based redirect
            const userRole = data?.studentId && !data?.teacherId ? "Student"
                : data?.teacherId ? "Teacher"
                    : null;
            const roleDashboard = getRoleBasedDashboard(userRole);

            nav(roleDashboard, { replace: true });
        } catch (e) {
            setError("root", { message: "Không thể kết nối máy chủ. Vui lòng thử lại." });
        }
    };

    return (
        <section className="w-screen min-h-[calc(100vh-64px)] bg-white overflow-x-hidden grid place-items-center">
            <div className="w-screen grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-10 px-6 lg:px-12 py-8">
                <LoginHero image={hero} />
                <LoginForm
                    register={register}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    showPwd={showPwd}
                    setShowPwd={setShowPwd}
                    onSubmit={handleSubmit(onSubmit)}
                />
            </div>
        </section>
    );
}

export default Login;
