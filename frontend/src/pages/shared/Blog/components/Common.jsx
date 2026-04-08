// src/pages/shared/Blog/components/Common.jsx
import { PRIMARY, PRIMARY_HOVER } from "../utils/constants";

export const Section = ({ id, title, subtitle, action, children }) => (
    <section id={id} className="w-screen overflow-x-hidden py-10 lg:py-14">
        <div className="w-screen px-6 lg:px-12">
            {(title || subtitle || action) && (
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        {title && (
                            <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">
                                {title}
                            </h2>
                        )}
                        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}
            {children}
        </div>
    </section>
);

export const Tag = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition border ${active
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
    >
        {children}
    </button>
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
