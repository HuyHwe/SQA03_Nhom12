import { CheckCircle2, FolderGit2, Lock, Unlock } from "lucide-react";

function ChipsInHeader({exam}){
    if (!exam) return [];
    const items = [];

    items.push({
      icon: exam.isOpened ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
      text: exam.isOpened ? "Đang mở" : "Đã khóa",
      bg: "bg-green-100",
      fg: "text-green-700",
    });

    items.push({
      icon: <FolderGit2 className="w-4 h-4" />,
      text: exam.lessonId
        ? "Nguồn: Bài học"
        : exam.courseContentId
        ? "Nguồn: Nội dung khóa"
        : "Nguồn: Khác",
      bg: "bg-indigo-100",
      fg: "text-indigo-700",
    });

    if (typeof exam.totalCompleted === "number") {
      items.push({
        icon: <CheckCircle2 className="w-4 h-4" />,
        text: `Đã làm: ${exam.totalCompleted}`,
        bg: "bg-slate-100",
        fg: "text-slate-700",
      });
    }
    return (
    <div className="flex gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded ${item.bg} ${item.fg}`}
        >
          {item.icon}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export default ChipsInHeader;