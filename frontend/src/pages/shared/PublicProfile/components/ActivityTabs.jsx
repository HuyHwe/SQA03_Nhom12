import { useState } from "react";
import { Clock, MessageSquare, FileText, Book } from "lucide-react";

export default function ActivityTabs({ activity, skills }) {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Tổng quan", icon: Clock },
        { id: "questions", label: "Câu hỏi", icon: MessageSquare },
        { id: "blogs", label: "Bài viết", icon: FileText },
        { id: "courses", label: "Khóa học", icon: Book },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Skills Section */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Kỹ năng & Sở thích</h4>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Hoạt động gần đây</h4>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {activity.map((item) => (
                                    <div key={item.id} className="relative flex items-start group">
                                        <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors shadow-sm"></div>
                                        <div className="pl-8 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 sm:mb-0">
                                                    {item.type === 'question' ? 'Hỏi đáp' :
                                                        item.type === 'answer' ? 'Trả lời' :
                                                            item.type === 'blog' ? 'Blog' : 'Học tập'}
                                                </span>
                                                <span className="text-xs text-gray-400">{item.time}</span>
                                            </div>
                                            <h5 className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                                                {item.title}
                                            </h5>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {item.desc}
                                            </p>
                                            {item.tags && (
                                                <div className="flex gap-2 mt-2">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== "overview" && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Chưa có nội dung</h3>
                        <p className="text-gray-500 mt-1">Người dùng chưa có hoạt động nào trong mục này.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
