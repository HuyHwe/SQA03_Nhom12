// src/pages/shared/Forum/components/AnswerList.jsx
import { BORDER } from "../utils/constants";
import AnswerItem from "./AnswerItem";

export default function AnswerList({ answers, currentUser, onAnswerUpdated }) {
    if (!answers || answers.length === 0) {
        return (
            <div className="text-slate-500 italic mt-4">
                Chưa có câu trả lời nào.
            </div>
        );
    }

    return (
        <div
            className="mt-6 rounded-2xl border bg-white"
            style={{ borderColor: BORDER }}
        >
            <div className="bg-slate-50 px-5 py-3 border-b font-semibold text-slate-700">
                {answers.length} Câu trả lời
            </div>
            {answers.map((a) => (
                <AnswerItem key={a.id} a={a} currentUser={currentUser} onAnswerUpdated={onAnswerUpdated} />
            ))}
        </div>
    );
}
