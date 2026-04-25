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

    if (user) {
        if (user.roles && user.roles.length > 0) {
            userRole = user.roles;
        } else if (user.studentId && !user.teacherId) {
            userRole = ["Student"];
        } else if (user.teacherId || user.isTeacher) {
            userRole = ["Teacher", "Student"];
        } else if (user.adminId || user.role === "Admin") {
            userRole = ["Admin"];
        }
    }

    // Check if user role is in allowed roles
    const hasAccess = roles.length === 0 || roles.some(role => userRole.includes(role));

    if (!hasAccess) {
        return <Navigate to="/forbidden" replace />;
    }

    // User has correct role, render child routes
    return <Outlet />;
}
