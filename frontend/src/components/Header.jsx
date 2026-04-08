
// src/components/Header.jsx
"use client";

import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "../store/auth";

import logo from "../assets/logo-ptit-logo-1.png";
import avatarFallback from "../assets/logo-ptit-logo-1.png";

import {
  isLoggedIn,
  clearAllAuth,
  authHeader,
} from "../utils/auth";

import {
  getUserRole,
  getNavigationForRole,
  getUserDropdownItems,
} from "../utils/userRole";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5102";

// ===== Theme =====
const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  ring: "#93c5fd",
};

const baseLinkCls = "px-4 py-2 text-[15px] font-medium transition";

function ActiveLink({ to, end, children, className = "" }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${baseLinkCls} ${className} ${isActive
          ? "underline underline-offset-4 decoration-2"
          : "hover:opacity-90"
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? BRAND.primary : "#111827",
      })}
    >
      {children}
    </NavLink>
  );
}

export default function Header({
  className = "",
  brand = { name: "Elearning", abbr: "P", href: "/" },
  routes, // Remove default routes - we'll build them dynamically
}) {
  const { hydrate } = useAuth();

  const [auth, setAuth] = useState(() => isLoggedIn());

  // displayUser sẽ chứa: name, email, avatar, studentId, teacherId, isTeacher
  const [displayUser, setDisplayUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("app_user") || "null");
    } catch {
      return null;
    }
  });

  const [openUser, setOpenUser] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user role
  const userRole = useMemo(() => {
    if (!auth || !displayUser) return null;
    return getUserRole();
  }, [auth, displayUser]);

  // Build navigation items based on role
  const navItems = useMemo(() => {
    // Base public routes shown to everyone
    const baseRoutes = [
      { to: "/", label: "Trang chủ", end: true },
      { to: "/courses", label: "Khóa học" },
      { to: "/forum", label: "Hỏi đáp" },
      { to: "/blog", label: "Blog" },
      // { to: "/study4test", label: "Exam" },
      { to: "/exam", label: "Exam" },
    ];

    // If custom routes provided, use them
    if (routes) return routes;

    // Add role-specific routes
    const roleRoutes = getNavigationForRole(userRole);
    return [...baseRoutes, ...roleRoutes];
  }, [routes, userRole]);

  // ---- helper: đã là giảng viên chưa?
  const hasTeacherRole =
    !!displayUser?.teacherId || displayUser?.isTeacher === true;

  // Get dropdown menu items based on role
  const dropdownItems = useMemo(() => {
    return getUserDropdownItems(userRole, hasTeacherRole);
  }, [userRole, hasTeacherRole]);

  // ===== Đồng bộ state + kéo claims =====
  useEffect(() => {
    hydrate?.();
    const logged = isLoggedIn();
    setAuth(logged);

    if (!logged) {
      setDisplayUser(null);
      return;
    }

    // Nếu đã có app_user trong localStorage (ví dụ lúc login đã set)
    // thì set trước cho nhanh, rồi vẫn gọi claims để cập nhật teacherId/isTeacher mới.
    let fromStorage = null;
    try {
      fromStorage = JSON.parse(localStorage.getItem("app_user") || "null");
    } catch {
      fromStorage = null;
    }
    if (fromStorage) {
      setDisplayUser(fromStorage);
    }

    // Gọi API /api/Auth/claims để luôn lấy dữ liệu mới nhất
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/Auth/claims`, {
          headers: { accept: "*/*", ...authHeader() },
        });
        if (!res.ok) return; // nếu 401 thì để nguyên state cũ

        const data = await res.json();

        // Parse mọi kiểu trả về: mảng claims hoặc object
        let name = fromStorage?.name || "";
        let email = fromStorage?.email || "";
        let avatar = fromStorage?.avatar || null;
        let studentId = fromStorage?.studentId ?? null;
        let teacherId = fromStorage?.teacherId ?? null;
        let isTeacher = fromStorage?.isTeacher ?? false;

        if (Array.isArray(data)) {
          // API kiểu: [{ type, value }, ...] hoặc { Type, Value }
          for (const c of data) {
            const type = (c.type || c.Type || "").toString();
            const value = (c.value || c.Value || "").toString();

            const tLower = type.toLowerCase();

            // name
            if (
              tLower.endsWith("claims/name") ||
              type === "name" ||
              type === "FullName"
            ) {
              name = value;
            }

            // email
            if (
              tLower.endsWith("claims/emailaddress") ||
              type === "email" ||
              type === "Email"
            ) {
              email = value;
            }

            // avatar (nếu có claim)
            if (tLower.includes("avatar")) {
              avatar = value;
            }

            // studentId
            if (tLower.includes("studentid")) {
              studentId = value;
            }

            // teacherId
            if (tLower.includes("teacherid")) {
              teacherId = value;
            }

            // role Teacher
            if (tLower.endsWith("/role") && value === "Teacher") {
              isTeacher = true;
            }
          }
        } else if (data && typeof data === "object") {
          // API kiểu: { name, email, avatarUrl, studentId, teacherId, roles: ["Teacher"] ... }
          name =
            data.name || data.fullName || data.username || name || "User";
          email = data.email || email || "";
          avatar = data.avatarUrl || avatar || null;
          studentId = data.studentId ?? studentId ?? null;
          teacherId = data.teacherId ?? teacherId ?? null;

          if (Array.isArray(data.roles)) {
            isTeacher =
              isTeacher || data.roles.includes("Teacher") ? true : false;
          }
        }

        const userObj = {
          name,
          email,
          avatar,
          studentId,
          teacherId,
          isTeacher,
        };

        setDisplayUser(userObj);
        try {
          localStorage.setItem("app_user", JSON.stringify(userObj));
        } catch { }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrate]);

  // Lắng nghe thay đổi token / localStorage từ tab khác
  useEffect(() => {
    const onStorage = () => {
      const logged = isLoggedIn();
      setAuth(logged);
      try {
        setDisplayUser(
          JSON.parse(localStorage.getItem("app_user") || "null")
        );
      } catch {
        setDisplayUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // click-outside + ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      // @ts-ignore
      if (!menuRef.current.contains(e.target)) setOpenUser(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenUser(false);
        setOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    clearAllAuth();
    try {
      localStorage.removeItem("app_user");
    } catch { }
    setAuth(false);
    setDisplayUser(null);
    setOpenUser(false);
    setOpenMobile(false);

    const redirect = encodeURIComponent(
      location.pathname + location.search
    );
    navigate(`/login?redirect=${redirect}`, { replace: true });
  };

  return (
    <header
      className={`w-full bg-white border-b relative z-[100] isolate ${className}`}
      style={{ borderColor: "#e5e7eb" }}
    >
      <div className="w-full h-16 px-6 lg:px-12 flex items-center gap-4">
        {/* Logo trái */}
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

        {/* Menu giữa (ẩn mobile) */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2">
          {navItems.map((r) => (
            <ActiveLink key={r.to} to={r.to} end={!!r.end}>
              {r.label}
            </ActiveLink>
          ))}
        </nav>

        {/* User bên phải (desktop) */}
        <div
          className="hidden md:flex items-center gap-3 relative"
          ref={menuRef}
        >
          {auth ? (
            <>
              <img
                src={displayUser?.avatar || avatarFallback}
                alt={displayUser?.name || "user"}
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
                {displayUser?.name || displayUser?.email || "Tài khoản"}
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
                  {dropdownItems.map((item) => (
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
                    className="w-full text-left px-4 py-2 hover:bg-slate-50"
                    type="button"
                    role="menuitem"
                    aria-label="Đăng xuất"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={`${baseLinkCls} px-4 py-2 text-[15px]`}
                style={{ color: BRAND.primary }}
              >
                Đăng nhập
              </NavLink>
              <Link
                to="/register"
                className="rounded-full text-white px-4 py-2 text-[15px] transition focus:outline-none focus:ring-2"
                style={{ backgroundColor: BRAND.primary }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  BRAND.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND.primary)
                }
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg focus:outline-none focus:ring-2"
          onClick={() => setOpenMobile((s) => !s)}
          aria-label="Mở menu"
          aria-expanded={openMobile}
          type="button"
          style={{ outlineColor: BRAND.ring }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {openMobile && (
        <div className="md:hidden w-full border-t bg-white z-[150] relative">
          <nav className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((r) => (
              <NavLink
                key={r.to}
                to={r.to}
                end={!!r.end}
                className="px-4 py-2 text-[15px] font-medium rounded-md transition"
                style={({ isActive }) => ({
                  color: isActive ? BRAND.primary : "#111827",
                  backgroundColor: isActive ? "#dbeafe" : "transparent",
                })}
                onClick={() => setOpenMobile(false)}
              >
                {r.label}
              </NavLink>
            ))}

            <div className="h-px bg-slate-200 my-2" />

            {auth ? (
              <>
                {dropdownItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 text-[15px] rounded-md hover:bg-slate-50 ${item.className || ""}`}
                    style={{ color: item.className ? undefined : "#111827" }}
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 text-[15px] rounded-md hover:bg-slate-50"
                  type="button"
                  style={{ color: BRAND.primary }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-[15px] rounded-md hover:bg-slate-50"
                  style={{ color: BRAND.primary }}
                  onClick={() => setOpenMobile(false)}
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 text-[15px] rounded-md text-white text-center"
                  style={{ backgroundColor: BRAND.primary }}
                  onClick={() => setOpenMobile(false)}
                >
                  Đăng ký
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
