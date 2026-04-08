// src/pages/shared/Exam/Components/FilterTabs.jsx
import { EXAM_FILTERS, PRIMARY } from "../utils/examHelpers";

export default function FilterTabs({ selectedTab, setSelectedTab }) {
    return (
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#e0e0e0]">
            {EXAM_FILTERS.map((type) => (
                <button
                    key={type}
                    onClick={() => setSelectedTab(type)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${selectedTab === type
                            ? "text-white"
                            : "bg-[#f8f9fa] text-[#677788] hover:bg-[#efefef]"
                        }`}
                    style={selectedTab === type ? { backgroundColor: PRIMARY } : {}}
                    type="button"
                >
                    {type}
                </button>
            ))}
        </div>
    );
}
