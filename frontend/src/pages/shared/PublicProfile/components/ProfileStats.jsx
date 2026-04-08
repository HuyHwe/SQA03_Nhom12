import { Award, BookOpen, MessageCircle, PenTool, Star, Zap } from "lucide-react";

export default function ProfileStats({ stats }) {
    const statItems = [
        {
            label: "Điểm đóng góp",
            value: stats.contributionPoints.toLocaleString(),
            icon: Zap,
            color: "text-yellow-600",
            bg: "bg-yellow-50"
        },
        {
            label: "Uy tín",
            value: stats.reputation.toLocaleString(),
            icon: Star,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Câu hỏi",
            value: stats.questions,
            icon: MessageCircle,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Câu trả lời",
            value: stats.answers,
            icon: MessageCircle,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Bài viết",
            value: stats.blogs,
            icon: PenTool,
            color: "text-pink-600",
            bg: "bg-pink-50"
        },
        {
            label: "Khóa học",
            value: stats.courses,
            icon: BookOpen,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-gray-500" />
                Thống kê hoạt động
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mb-2`}>
                                <Icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{item.value}</span>
                            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
