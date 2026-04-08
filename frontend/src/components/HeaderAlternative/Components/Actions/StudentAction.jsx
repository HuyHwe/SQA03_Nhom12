import { useState, useMemo } from "react";
import { clearAllAuth, getHeaderMode, setHeaderMode } from "../../../../utils/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import avatarFallback from "../../../../assets/logo-ptit-logo-1.png";

const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  ring: "#93c5fd",
};

function StudentAction( {user} ) {

    const [openUser, setOpenUser] = useState(false);
    const navigate = useNavigate();
    const hasTeacherRole = !!user?.teacherId || user?.isTeacher === true;
    
    const menuItems = useMemo(() => {
        const base = [
            { to: "/s/profile", label: "Hồ sơ cá nhân" },
            // { to: "/s/dashboard", label: "Dashboard học sinh" },
            // { to: "/s/payment-history", label: "Lịch sử thanh toán" }
        ];

        if (!hasTeacherRole) {
            base.push({
                to: "/i/become-instructor",
                label: "Đăng ký làm giảng viên",
                className: "text-blue-600 font-medium"
            });
        }
        return base;
    }, [hasTeacherRole]);

    const headerMode = getHeaderMode();

    const handleLogout = () => {
        clearAllAuth();
        try {
            localStorage.removeItem("app_user");
        } catch {
            // Ignore
            }
        setOpenUser(false);
    
        const redirect = encodeURIComponent(
            location.pathname + location.search
        );
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
                onClick={() => setOpenUser((s) => !s)}
                className="flex items-center gap-1 bg-transparent text-[15px] font-medium focus:outline-none focus:ring-2 rounded-md px-1"
                style={{ color: "#000000ff", outlineColor: BRAND.ring }}
                aria-haspopup="menu"
                aria-expanded={openUser}
                type="button"
            >
                {user?.fullName || user?.email || "Tài khoản"}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
            </button>   


            {openUser && (
                <div
                    className="absolute right-0 top-12 w-64 rounded-xl border bg-white shadow-md overflow-hidden z-[200] pointer-events-auto"
                    role="menu"
                >
                    {menuItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`block px-4 py-2 hover:bg-slate-50 ${item.className || ""}`}
                            role="menuitem"
                            onClick={() => setOpenUser(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {hasTeacherRole && headerMode !== "teacher" && (
                        <button
                            onClick={() => {
                                setHeaderMode("teacher");
                                setOpenUser(false);
                                navigate("/");
                            }}
                            className={`w-full text-left px-4 py-2 bg-transparent hover:bg-slate-50 text-blue-600 font-medium`}
                            type="button"
                            role="menuitem"
                        >
                            Trang chủ giảng viên
                        </button>
                    )}
                    <Link
                        to="/settings"
                        className="block px-4 py-2 hover:bg-slate-50"
                        role="menuitem"
                        onClick={() => setOpenUser(false)}
                    >
                        Cài đặt
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 bg-transparent hover:bg-slate-50"
                        type="button"
                        role="menuitem"
                        aria-label="Đăng xuất"
                    >
                        Đăng xuất
                    </button>
                </div>
            )}                             
        </>
    )

}

export default StudentAction;