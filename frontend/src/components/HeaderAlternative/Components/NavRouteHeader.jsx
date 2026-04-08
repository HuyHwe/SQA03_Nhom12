/* eslint-disable no-unused-vars */
import ActiveLink from "./ActiveLink";

function NavRouteHeader({ baseRoutes, logged, user, headerMode }) {
    
    const finalRoutes = [
        ...baseRoutes,
        ...(logged && headerMode === "student"
            ? [{ to: "/s/enrollments", label: "Khóa học của tôi" }]
            : headerMode === "teacher" 
            ? [{ to: "/i/dashboard", label: "Dashboard giảng viên" },
                { to: "/i/courses", label: "Quản lý khóa học" },
            ]
            : []),
    ];

    return (
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2">
            {finalRoutes.map((r) => (
                <ActiveLink key={r.to} to={r.to} end={!!r.end}>
                    {r.label}
                </ActiveLink>
            ))}
        </nav>
    );
}

export default NavRouteHeader;
