// src/utils/userRole.js
/**
 * Utility functions for determining user role and providing role-based navigation
 */

/**
 * Get the current user's role based on localStorage data
 * @returns {"Student" | "Teacher" | "Admin" | null}
 */
export function getUserRole() {
    try {
        const userStr = localStorage.getItem("app_user");
        if (!userStr) return null;

        const user = JSON.parse(userStr);

        // Check for admin first (if you have admin detection logic)
        if (user.adminId || user.role === "Admin") {
            return "Admin";
        }

        // Check for teacher
        if (user.teacherId || user.isTeacher === true) {
            return "Teacher";
        }

        // Check for student
        if (user.studentId) {
            return "Student";
        }

        return null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
}

/**
 * Get the dashboard URL appropriate for the user's role
 * @param {string|null} role - Optional role override, otherwise uses current user role
 * @returns {string} Dashboard URL
 */
export function getRoleBasedDashboard(role = null) {
    const userRole = role || getUserRole();

    switch (userRole) {
        case "Student":
            return "/s/dashboard";
        case "Teacher":
            return "/i/dashboard";
        case "Admin":
            return "/admin/dashboard";
        default:
            return "/";
    }
}

/**
 * Get navigation items specific to a role
 * @param {string|null} role - User role
 * @returns {Array<{to: string, label: string, end?: boolean}>}
 */
export function getNavigationForRole(role) {
    if (!role) return [];

    switch (role) {
        case "Student":
            return [
                { to: "/s/dashboard", label: "Dashboard" },
                { to: "/s/enrollments", label: "Khóa học của tôi" },
            ];

        case "Teacher":
            return [
                { to: "/i/dashboard", label: "Dashboard" },
                { to: "/i/courses", label: "Khóa học của tôi" },
                { to: "/i/exams", label: "Đề thi" },
            ];

        case "Admin":
            return [
                { to: "/admin/dashboard", label: "Quản trị" },
            ];

        default:
            return [];
    }
}

/**
 * Get user dropdown menu items based on role
 * @param {string|null} role - User role
 * @param {boolean} hasTeacherRole - Whether user already has teacher role
 * @returns {Array<{to: string, label: string, className?: string}>}
 */
export function getUserDropdownItems(role, hasTeacherRole) {
    const baseItems = [
        { to: "/s/profile", label: "Hồ sơ cá nhân" },
    ];

    const roleSpecificItems = [];

    switch (role) {
        case "Student":
            roleSpecificItems.push(
                { to: "/s/dashboard", label: "Dashboard học sinh" },
                { to: "/s/enrollments", label: "Khóa học của tôi" },
                { to: "/s/payment-history", label: "Lịch sử thanh toán" }
            );

            // Show "Become Instructor" if not already a teacher
            if (!hasTeacherRole) {
                roleSpecificItems.push({
                    to: "/i/become-instructor",
                    label: "Đăng ký làm giảng viên",
                    className: "text-blue-600 font-medium"
                });
            }
            break;

        case "Teacher":
            roleSpecificItems.push(
                { to: "/i/dashboard", label: "Dashboard giảng viên" },
                { to: "/i/courses", label: "Quản lý khóa học" },
                { to: "/i/exams", label: "Quản lý đề thi" }
            );
            break;

        case "Admin":
            roleSpecificItems.push(
                { to: "/admin/dashboard", label: "Quản trị hệ thống" }
            );
            break;
    }

    return [...baseItems, ...roleSpecificItems];
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isUserLoggedIn() {
    try {
        const token = localStorage.getItem("app_access_token") || localStorage.getItem("access_token");
        return !!token;
    } catch {
        return false;
    }
}
