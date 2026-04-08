const Ghost = ({ children, className = "", ...props }) => (
  <button
    className={`rounded-full border border-[#2563eb] text-[#2563eb] px-5 py-3 hover:bg-[#2563eb]/10 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Primary = ({ children, className = "", ...props }) => (
    <button
        className={
        "rounded-full bg-[#2563eb] text-white px-5 py-3 hover:bg-[#1d4ed8] transition " + className
        }
        {...props}
        type="button"
    >
        {children}
    </button>
);

export { Ghost, Primary };