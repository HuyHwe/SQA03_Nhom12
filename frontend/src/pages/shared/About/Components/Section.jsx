// src/pages/shared/About/Components/Section.jsx
export default function Section({ id, title, subtitle, action, children, className = "" }) {
    return (
        <section id={id} className={`w-screen overflow-x-hidden py-12 lg:py-16 ${className}`}>
            <div className="w-screen px-6 lg:px-12">
                {(title || subtitle || action) && (
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            {title && <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{title}</h2>}
                            {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
                        </div>
                        {action}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}
