// src/pages/shared/Payment/Components/CheckoutForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const Primary = ({ children, className = "", ...props }) => (
    <button
        className={
            "rounded-full bg-[#2563eb] text-white px-5 py-3 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
            className
        }
        {...props}
    >
        {children}
    </button>
);

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

export default function CheckoutForm({ onSubmit }) {
    const [method, setMethod] = useState("vnpay");
    const [save, setSave] = useState(true);
    const [form, setForm] = useState({ name: "", number: "", exp: "", cvc: "" });
    const [error, setError] = useState("");

    const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
    const isCard = method === "card";

    const validate = () => {
        if (isCard) {
            if (!/^\d{12,19}$/.test(form.number.replace(/\s|-/g, ""))) return "Số thẻ không hợp lệ.";
            if (!/^\d{2}\/\d{2}$/.test(form.exp)) return "Hạn thẻ (MM/YY) không hợp lệ.";
            if (!/^\d{3,4}$/.test(form.cvc)) return "CVC không hợp lệ.";
            if (form.name.trim().length < 3) return "Vui lòng nhập tên trên thẻ.";
        }
        return "";
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const msg = validate();
                if (msg) {
                    setError(msg);
                    return;
                }
                setError("");
                onSubmit?.({ ...form, method, save });
            }}
            className="rounded-2xl border bg-white p-6 grid gap-5"
        >
            <div>
                <label className="block text-sm font-medium text-slate-900">Phương thức thanh toán</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["vnpay", "momo", "card"].map((m) => (
                        <label key={m} className={`inline-flex items-center gap-2 rounded-xl border p-3 cursor-pointer ${method === m ? "border-[#2563eb] bg-[#2563eb]/5" : "border-slate-200"}`}>
                            <input
                                type="radio"
                                name="paymethod"
                                className="accent-[#2563eb]"
                                checked={method === m}
                                onChange={() => setMethod(m)}
                            />
                            <span>{m === "vnpay" ? "VNPay" : m === "momo" ? "MoMo" : "Thẻ quốc tế (Visa/Master/Amex)"}</span>
                        </label>
                    ))}
                </div>
            </div>

            {isCard ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Tên trên thẻ</label>
                            <input value={form.name} onChange={set("name")} placeholder="VD: NGUYEN VAN A" className="mt-2 w-full rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Số thẻ</label>
                            <input value={form.number} onChange={set("number")} placeholder="#### #### #### ####" inputMode="numeric" className="mt-2 w-full rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900">Hạn thẻ <span className="text-slate-500">(MM/YY)</span></label>
                            <input value={form.exp} onChange={set("exp")} placeholder="MM/YY" className="mt-2 w-full rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900">CVC</label>
                            <input value={form.cvc} onChange={set("cvc")} placeholder="3-4 số" inputMode="numeric" className="mt-2 w-full rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]" />
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border p-4 bg-[#2563eb]/5 text-sm text-slate-700">
                    {method === "vnpay" && <p>Bạn sẽ được chuyển sang cổng <b>VNPay</b> để hoàn tất thanh toán an toàn. Sau khi thanh toán thành công, hệ thống tự động kích hoạt khoá học.</p>}
                    {method === "momo" && <p>Bạn sẽ được chuyển sang <b>MoMo</b> để quét mã/ xác nhận thanh toán. Khoá học sẽ được kích hoạt ngay sau khi thanh toán.</p>}
                </div>
            )}

            <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-[#2563eb]" checked={save} onChange={(e) => setSave(e.target.checked)} />
                <span className="text-sm">Lưu thông tin cho lần thanh toán sau</span>
            </label>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</div>}

            <div className="flex items-center gap-3">
                <Primary type="submit" className="flex-1">Xác nhận thanh toán</Primary>
                <Ghost type="button" className="px-5"><Link to="/courses">Tiếp tục mua sắm</Link></Ghost>
            </div>

            <p className="text-xs text-slate-500">
                Bằng việc thanh toán, bạn đồng ý với <Link to="#" className="text-[#2563eb] underline">Điều khoản sử dụng</Link> và{" "}
                <Link to="#" className="text-[#2563eb] underline">Chính sách bảo mật</Link>.
            </p>
        </form>
    );
}
