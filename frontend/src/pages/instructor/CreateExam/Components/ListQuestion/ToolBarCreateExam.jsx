import * as XLSX from "xlsx";
import { useRef } from "react";
import { useState } from "react";
import { Plus, Upload } from "lucide-react";

import checkFormatExcel from "./CheckFormatExcel.js";
import PopupAlertConfirm from "../../../../../components/PopupAlertConfirm.jsx";

function ToolBarCreateExam({ addQuestionExam, setAllQuestions }) {
    const fileInputRef = useRef(null);
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const handleUploadExcel = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        const fileName = file.name.toLowerCase();

        if (!validTypes.includes(file.type) && 
            !fileName.endsWith(".xlsx") && 
            !fileName.endsWith(".xls")) 
        {
            alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

            const resultCheck = checkFormatExcel({ sheet: workbook.Sheets[firstSheet], event: e });

            if (!resultCheck.ok) {
                event.target.value = "";
                setPopupMessage(resultCheck.reason);
                setPopupOpen(true);
                return;
            }

            const questions = [];
            let currentQuestion = null;

            jsonData.forEach(row => {
                if (row["Index"]) {
                    if (currentQuestion) {
                        questions.push(currentQuestion);
                    }
                    currentQuestion = {
                        content: row["Content"],
                        imageUrl: row["Image Url"],
                        type: row["Type"],
                        explanation: row["Explanation"],
                        score: row["Point"],
                        isRequired: !!row["Is Required"],
                        order: row["Order"],
                        answers: [],
                    };
                }
                if (currentQuestion && row["Choices"]) {
                    currentQuestion.answers.push({
                        content: row["Choices"],
                        isCorrect: !!row["Is Correct"],
                    });
                }
            });
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            
            setAllQuestions(prevQuestions => [...prevQuestions, ...questions]);
            event.target.value = "";
        }
    }
    return (
        <div className="rounded-2xl border bg-white p-4">
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => addQuestionExam()} 
                        className="rounded-lg border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Tạo câu hỏi
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="rounded-lg border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" /> Upload file excel
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        hidden
                        onChange={handleUploadExcel}
                    />
                </div>
            </div>

            <PopupAlertConfirm
                open={popupOpen}
                title="Lỗi File Excel"
                message={popupMessage}
                confirmText="OK"
                cancelText="Đóng"
                onConfirm={() => setPopupOpen(false)}
                onCancel={() => setPopupOpen(false)}
            />
        </div>
    )
}

export default ToolBarCreateExam;