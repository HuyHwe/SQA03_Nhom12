import { Link, NavLink } from "react-router-dom";

const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  ring: "#93c5fd",
};

const baseLinkCls = "px-4 py-2 text-[15px] font-medium transition";

function GuestAction(){
    return (
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
    )
}

export default GuestAction;