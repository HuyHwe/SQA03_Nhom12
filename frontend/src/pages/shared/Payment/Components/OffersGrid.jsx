// src/pages/shared/Payment/Components/OffersGrid.jsx
import { Link } from "react-router-dom";

export default function OffersGrid({ offers }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((o) => (
                <article key={o.id} className="relative rounded-2xl border bg-white p-6">
                    <span className="absolute -top-3 right-4 text-xs rounded-full bg-[#2563eb] text-white px-3 py-1">
                        {o.badge}
                    </span>
                    <h4 className="font-semibold text-slate-900">{o.title}</h4>
                    <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
                        {o.lines.map((L, i) => <li key={i}>{L}</li>)}
                    </ul>
                </article>
            ))}
        </div>
    );
}
