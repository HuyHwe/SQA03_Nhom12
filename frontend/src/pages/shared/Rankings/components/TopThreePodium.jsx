import { Crown, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopThreePodium({ topThree }) {
    if (!topThree || topThree.length < 3) {
        return null;
    }

    // Reorder for podium display: [2nd, 1st, 3rd]
    const podiumOrder = [topThree[1], topThree[0], topThree[2]];

    const rankConfig = {
        0: { // 2nd place
            position: "2nd",
            bgGradient: "from-gray-300 via-gray-200 to-gray-300",
            borderColor: "border-gray-400",
            badgeBg: "bg-gradient-to-br from-gray-400 to-gray-500",
            accentColor: "text-gray-600",
            height: "h-48",
            icon: Award,
            iconColor: "text-gray-500"
        },
        1: { // 1st place
            position: "1st",
            bgGradient: "from-yellow-300 via-yellow-200 to-yellow-300",
            borderColor: "border-yellow-500",
            badgeBg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
            accentColor: "text-yellow-700",
            height: "h-56",
            icon: Crown,
            iconColor: "text-yellow-600"
        },
        2: { // 3rd place
            position: "3rd",
            bgGradient: "from-orange-300 via-orange-200 to-orange-300",
            borderColor: "border-orange-400",
            badgeBg: "bg-gradient-to-br from-orange-400 to-orange-500",
            accentColor: "text-orange-600",
            height: "h-44",
            icon: Award,
            iconColor: "text-orange-500"
        }
    };

    return (
        <div className="mb-12">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    NGƯỜI ĐÓNG GÓP HÀNG ĐẦU
                </h2>
                <Crown className="w-8 h-8 text-yellow-500" />
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-6 max-w-5xl mx-auto">
                {podiumOrder.map((contributor, index) => {
                    const config = rankConfig[index];
                    const Icon = config.icon;
                    const actualRank = index === 1 ? 1 : index === 0 ? 2 : 3;

                    return (
                        <div
                            key={contributor.studentId}
                            className={`flex flex-col items-center transition-all duration-300 hover:scale-105 ${index === 1 ? 'w-80' : 'w-72'
                                }`}
                        >
                            {/* Badge */}
                            <Link to={`/u/${contributor.id}`} className={`relative mb-4 ${index === 1 ? 'scale-110' : ''} group cursor-pointer`}>
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.bgGradient} p-1 shadow-xl group-hover:ring-4 ring-white/50 transition-all`}>
                                    <div className="w-full h-full rounded-full bg-white p-1">
                                        <img
                                            src={contributor.avatar || `https://ui-avatars.com/api/?name=${contributor.fullName}&background=random`}
                                            alt={contributor.fullName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className={`absolute -top-2 -right-2 w-10 h-10 ${config.badgeBg} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}>
                                    {actualRank}
                                </div>
                                {index === 1 && (
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                        <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
                                    </div>
                                )}
                            </Link>

                            {/* Username Badge */}
                            <Link to={`/u/${contributor.id}`} className={`px-4 py-1.5 rounded-full ${config.badgeBg} text-white text-sm font-semibold mb-4 shadow-md flex items-center gap-2 hover:scale-105 transition-transform`}>
                                <Icon className={`w-4 h-4 ${config.iconColor === 'text-yellow-600' ? 'text-yellow-200' : 'text-white'}`} />
                                <span>{contributor.fullName}</span>
                                <Icon className={`w-4 h-4 ${config.iconColor === 'text-yellow-600' ? 'text-yellow-200' : 'text-white'}`} />
                            </Link>

                            {/* Stats Card */}
                            <div className={`w-full bg-gradient-to-br ${config.bgGradient} rounded-2xl p-6 shadow-xl border-2 ${config.borderColor}`}>
                                <div className="bg-white rounded-xl p-4 space-y-3">
                                    <div className="text-center">
                                        <div className={`text-sm font-medium ${config.accentColor} mb-1`}>Điểm đóng góp:</div>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" title="1 bài viết = 20, 1 câu hỏi = 5, 1 bình luận = 1">
                                            {contributor.contributionScore.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Tổng bài viết:</span>
                                            <span className="font-semibold text-gray-900">{contributor.totalPosts}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Tổng câu hỏi:</span>
                                            <span className="font-semibold text-gray-900">{contributor.totalForumQuestions}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Tổng bình luận:</span>
                                            <span className="font-semibold text-gray-900">{contributor.totalDiscussions}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
