const Section = ({ id, title, subtitle, action, children, className = "" }) => (
  <section id={id} className={`w-screen overflow-x-hidden py-10 lg:py-14 ${className}`}>
    <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {title && <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">{title}</h2>}
            {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
    </div>
    <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {children}
    </div>
  </section>
);

export default Section;