// src/pages/shared/Payment/Components/PriceSummary.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Ghost = ({ children, className = "", ...props }) => (
    <button
        className={
            "rounded-full border border-[#2563eb] text-[#2563eb] px-5 py-3 hover:bg-[#2563eb]/10 focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
            className
        }
        {...props}
    >
        {children}
    </button>
);

export default function PriceSummary({ items, initialCoupon = "", vatPct = 10 }) {
    const [coupon, setCoupon] = useState(initialCoupon);
    const [applied, setApplied] = useState(0);

    const fmtVND = (v) => v.toLocaleString("vi-VN") + " đ";

    const { subtotal, discount, vat, total } = useMemo(() => {
        const subtotal = items.reduce((s, it) => s + it.price, 0);
        const discount = Math.round((subtotal * applied) / 100);
        const taxedBase = Math.max(0, subtotal - discount);
        const vat = Math.round((taxedBase * vatPct) / 100);
        const total = taxedBase + vat;
        return { subtotal, discount, vat, total };
    }, [items, applied, vatPct]);

    const applyCoupon = (e) => {
        e.preventDefault();
        const code = coupon.trim().toUpperCase();
        if (code === "HSSV10") setApplied(10);
        else if (code === "WELCOME5") setApplied(5);
        else setApplied(0);
    };

    return (
        <aside className="lg:sticky lg:top-20 h-fit rounded-2xl border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Tóm tắt đơn hàng</h3>

            <div className="space-y-4">
                {items.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-3">
                        <div>
                            <div className="font-medium leading-tight">{it.title}</div>
                            {it.note && <div className="text-xs text-slate-500">{it.note}</div>}
                        </div>
                        <div className="font-semibold">{fmtVND(it.price)}</div>
                    </div>
                ))}
            </div>

            <form onSubmit={applyCoupon} className="mt-4 flex items-center gap-2">
                <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Nhập mã giảm giá (VD: HSSV10)"
                    className="flex-1 rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-[#93c5fd]"
                />
                <Ghost type="submit" className="px-4 py-2">Áp dụng</Ghost>
            </form>

            <div className="h-px bg-slate-200 my-4" />

            <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt>Tạm tính</dt><dd>{fmtVND(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Giảm giá</dt><dd>- {applied}% {applied ? `(${fmtVND(discount)})` : ""}</dd></div>
                <div className="flex justify-between"><dt>VAT</dt><dd>{vatPct}% ({fmtVND(vat)})</dd></div>
            </dl>

            <div className="mt-3 flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span>{fmtVND(total)}</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
                Giá đã bao gồm VAT nếu có. Mọi khoá học đều kèm hoá đơn điện tử khi yêu cầu.
            </p>
        </aside>
    );
}
