import Pagination from "./Pagination";
import { Link } from "react-router-dom";

export default function RankingsTable({
    contributors,
    startRank,
    currentPage,
    totalPages,
    onPageChange
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-16">#</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Người đóng góp</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Điểm đóng góp</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Câu hỏi được chấp nhận</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Câu hỏi công khai</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Nội dung đóng góp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {contributors.map((contributor, index) => (
                            <tr
                                key={contributor.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                    {startRank + index}
                                </td>
                                <td className="px-6 py-4">
                                    <Link to={`/u/${contributor.id}`} className="flex items-center gap-3 group">
                                        <img
                                            src={contributor.avatar}
                                            alt={contributor.username}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:ring-2 ring-blue-500 transition-all"
                                        />
                                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{contributor.username}</span>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-blue-600">
                                        {contributor.contributionPoints.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-700">
                                    {contributor.acceptedQuestions}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-700">
                                    {contributor.publicQuestions.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-700">
                                    {contributor.totalContributions.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
