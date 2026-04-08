import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

import logo from "../../assets/logo-ptit-logo-1.png";
import ActionHeader from "./Components/ActionHeader";
import NavRouteHeader from "./Components/NavRouteHeader";
import { getHeaderMode } from "../../utils/auth";

const baseRoutes = [
    { to: "/", label: "Trang chủ", end: true },
    { to: "/courses", label: "Khóa học" },
    { to: "/forum", label: "Hỏi đáp" },
    { to: "/rankings", label: "Xếp hạng" },
    { to: "/blog", label: "Blog" },
];

function HeaderAlternative({
    className = "",
    brand = { name: "Elearning", abbr: "P", href: "/" },
    logged, user
}) {
    const menuRef = useRef(null);
    const [headerMode, setHeaderMode] = useState(getHeaderMode());

    useEffect(() => {
        const handler = (e) => setHeaderMode((e && e.detail && e.detail.mode) || getHeaderMode());
        window.addEventListener("headerModeChanged", handler);
        return () => window.removeEventListener("headerModeChanged", handler);
    }, []);

    return (
        <header
            className={`w-full bg-white border-b relative z-[100] isolate ${className}`}
            style={{ borderColor: "#e5e7eb" }}
        >
            <div className="w-full h-16 px-6 lg:px-12 flex items-center gap-4">
                <Link
                    to={brand.href || "/"}
                    className="flex items-center gap-2 shrink-0 focus:outline-none"
                    aria-label="Trang chủ"
                >
                    <img
                        src={logo}
                        alt={brand.name || "Logo"}
                        className="h-10 w-auto object-contain"
                    />
                </Link>

                <NavRouteHeader baseRoutes={baseRoutes} logged={logged} user={user} headerMode={headerMode} />

                <div className="hidden md:flex items-center gap-3 relative" ref={menuRef}>
                    <ActionHeader logged={logged} user={user} headerMode={headerMode} />
                </div>
            </div>

        </header>
    );
}

export default HeaderAlternative;