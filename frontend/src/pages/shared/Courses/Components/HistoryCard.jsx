import { Eye } from "../../../../assets/Icons";
import { Link } from "react-router-dom";

function HistoryCard({ item }) {
  return (
    <Link
      to="#"
      className="rounded-xl border bg-white p-4 min-w-[260px] hover:shadow-md transition"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-blue-50 grid place-items-center shrink-0 text-[#2563eb]">
          <Eye />
        </div>
        <div>
          <div className="font-medium leading-tight line-clamp-1 text-slate-900">
            {item.title}
          </div>
          <div className="text-xs text-slate-600">
            {item.teacher} • {item.progress}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default HistoryCard;