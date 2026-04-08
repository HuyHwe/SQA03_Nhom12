import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../../../api/admin.api";
import { setTokens } from "../../../../utils/auth";
import { Eye, EyeClosed, CircleX } from "lucide-react";

function AdminLoginForm(){
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        try{
            const data = await adminLogin(email, password);

            const accessToken = data?.accessToken || data?.token || data?.access_token;
            const refreshToken = data?.refreshToken;

            if (!accessToken) {
                setError("Đăng nhập Admin không hợp lệ.");
                setIsSubmitting(false);
                return;
            }

            setTokens({ accessToken, refreshToken });

            try {
                localStorage.setItem(
                    "auth_user",
                    JSON.stringify({
                        token: accessToken,
                        refreshToken,
                        userId: data?.userId || null,
                        adminId: data?.adminId || null,
                        fullName: data?.fullName || null,
                    })
                );
            } catch(err){
                console.error("Lỗi lưu thông tin Admin:", err);
            }

            navigate("/admin/dashboard", { replace: true });
        } catch (error){
            setError("Lỗi đăng nhập Admin: " + error.message);
            console.error("Admin login error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }
 
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your admin account
                    </h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CircleX className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                placeholder="Password"
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute inset-y-0 right-0 pr-3 border-none flex items-center text-sm leading-5 bg-transparent focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <EyeClosed className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminLoginForm;