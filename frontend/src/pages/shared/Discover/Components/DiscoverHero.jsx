// src/pages/shared/Discover/Components/DiscoverHero.jsx
import { Clock } from "lucide-react";

export default function DiscoverHero({ activeTab, setActiveTab }) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-8">
                <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-gray-800" />
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        Khám phá lộ trình học lập trình
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-300">
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`pb-3 font-medium transition ${activeTab === "my" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Lịch học của tôi
                    </button>
                    <button
                        onClick={() => setActiveTab("explore")}
                        className={`pb-3 font-medium transition ${activeTab === "explore"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Khám phá
                    </button>
                </div>
            </div>
        </section>
    );
}
