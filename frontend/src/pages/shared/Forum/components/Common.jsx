// src/pages/shared/Forum/components/Common.jsx
import { PRIMARY, PRIMARY_HOVER } from "../utils/constants";

export const Section = ({ id, title, subtitle, action, children }) => (
    <section id={id} className="w-screen px-6 lg:px-12 py-8">
        {(title || subtitle || action) && (
            <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                    {title && (
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                            {title}
                        </h1>
                    )}
                    {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        {children}
    </section>
);

export const Primary = ({ children, className = "", ...props }) => (
    <button
        type="button"
        className={
            "rounded-full text-white px-5 py-3 transition focus:outline-none focus:ring-2 focus:ring-[#93c5fd] " +
            className
        }
        style={{ backgroundColor: PRIMARY }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
        {...props}
    >
        {children}
    </button>
);
