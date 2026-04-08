import { NavLink } from "react-router-dom";

const baseLinkCls = "px-4 py-2 text-[15px] font-medium transition";

const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  ring: "#93c5fd",
};

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

export default ActiveLink;