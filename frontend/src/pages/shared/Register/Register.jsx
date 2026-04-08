// src/pages/shared/Register/Register.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../store/auth";
import hero from "../../../assets/image-1-Jbf5HJr8.png";

import RegisterHero from "./Components/RegisterHero";
import RegisterHeader from "./Components/RegisterHeader";
import RegisterForm from "./Components/RegisterForm";

const schema = z.object({
    email: z.string().email("Email không hợp lệ"),
    name: z.string().min(2, "Tài khoản phải từ 2 ký tự"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    isTeacher: z.boolean().optional(),
    employeeCode: z.string().optional(),
    instruction: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    remember: z.boolean().optional(),
});

function Register() {
    const [showPwd, setShowPwd] = useState(false);
    const { user, register: signup, hydrate } = useAuth();
    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            name: "",
            password: "",
            remember: true,
            isTeacher: false,
            employeeCode: "",
            instruction: "",
            dateOfBirth: "",
            gender: "",
        },
        mode: "onBlur",
    });

    const isTeacher = watch("isTeacher");

    useEffect(() => { hydrate(); }, [hydrate]);
    useEffect(() => { if (user) nav("/"); }, [user, nav]);

    const onSubmit = async (data) => {
        try {
            await signup({
                email: data.email,
                password: data.password,
                fullName: data.name,
                dateOfBirth: data.dateOfBirth || null,
                gender: data.gender || null,
                remember: !!data.remember,
                isTeacher: !!data.isTeacher,
                employeeCode: data.employeeCode?.trim(),
                instruction: data.instruction?.trim(),
            });

            nav("/login", {
                replace: true,
                state: { justRegistered: true, email: data.email },
            });
        } catch (e) {
            setError("root", {
                message: e?.message || "Đăng ký không thành công. Vui lòng thử lại.",
            });
        }
    };

    return (
        <section className="w-screen min-h-[calc(100vh-64px)] bg-white overflow-x-hidden grid place-items-center">
            <div className="w-screen grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-10 px-6 lg:px-12 py-8">
                <RegisterHero image={hero} />
                <div className="w-full max-w-[520px] justify-self-start">
                    <RegisterHeader />
                    <RegisterForm
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        showPwd={showPwd}
                        setShowPwd={setShowPwd}
                        isTeacher={isTeacher}
                        onSubmit={handleSubmit(onSubmit)}
                    />
                </div>
            </div>
        </section>
    );
}

export default Register;
