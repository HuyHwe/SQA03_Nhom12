import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setHeaderMode, clearAllAuth } from "../../../../utils/auth";
import avatarFallback from "../../../../assets/logo-ptit-logo-1.png";

function TeacherAction({ user }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleSwitchBack = () => {
        setHeaderMode("student");
        setOpen(false);
    };

    const handleLogout = () => {
        clearAllAuth();
        try {
            localStorage.removeItem("app_user");
        } catch {
            // Ignore
        }
        setOpen(false);

        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${redirect}`, { replace: true });
    };

    return (
        <>
            <img
                src={user?.avatar || avatarFallback}
                alt={user?.name || "user"}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
            />

            <button
                onClick={() => setOpen((s) => !s)}
                className="flex items-center gap-1 bg-transparent text-[15px] font-medium focus:outline-none focus:ring-2 rounded-md px-1"
                type="button"
            >
                {user?.fullName || user?.email || "Giảng viên"}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-52 rounded-xl border bg-white shadow-md overflow-hidden z-[200] pointer-events-auto" role="menu">
                    <Link
                        to="/s/profile"
                        className="block px-4 py-2 hover:bg-slate-50"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                    >
                        Hồ sơ cá nhân
                    </Link>
                    <button
                        onClick={() => {
                            handleSwitchBack();
                            navigate("/");
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent hover:bg-slate-50"
                        type="button"
                        role="menuitem"
                    >
                        Trang chủ của tôi
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 bg-transparent hover:bg-slate-50"
                        type="button"
                        role="menuitem"
                    >
                        Đăng xuất
                    </button>
                </div>
            )}
        </>
    );
}

export default TeacherAction;