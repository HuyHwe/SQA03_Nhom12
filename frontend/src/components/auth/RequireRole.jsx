import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequireRole({ roles = [] }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read from localStorage.
        const userStr = localStorage.getItem("auth_user");

        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
            } catch (e) {
                console.error("Failed to parse app_user:", e);
            }
        }
        setLoading(false);
    }, []);

    // Wait for loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Must be logged in first
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Determine user role from user object. Initialize to empty array
    // so checks below are safe even if no role is detected.
    let userRole = [];

    // DEBUG: Log user object to see what we have
    // console.log("🔍 [RequireRole] User object:", user);

    if (user) {
        // console.log("🔍 [RequireRole] studentId:", user.studentId);
        // console.log("🔍 [RequireRole] teacherId:", user.teacherId);
        // console.log("🔍 [RequireRole] isTeacher:", user.isTeacher);

        if (user.studentId && !user.teacherId) {
            userRole = ["Student"];
        } else if (user.teacherId || user.isTeacher) {
            userRole = ["Teacher", "Student"];
        } else if (user.adminId || user.role === "Admin") {
            userRole = ["Admin"];
        }
    }

    // console.log("🔍 [RequireRole] Detected role:", userRole);
    // console.log("🔍 [RequireRole] Required roles:", roles);

    // Check if user role is in allowed roles
    const hasAccess = roles.length === 0 || roles.some(role => userRole.includes(role));

    // console.log("🔍 [RequireRole] Has access:", hasAccess);

    if (!hasAccess) {
        return <Navigate to="/forbidden" replace />;
    }

    // User has correct role, render child routes
    return <Outlet />;
}
