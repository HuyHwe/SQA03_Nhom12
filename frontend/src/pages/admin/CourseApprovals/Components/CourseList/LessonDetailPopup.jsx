import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { adminGetLessonById } from '../../../../../api/admin.api';
import { toast } from 'react-hot-toast';

const LessonDetailPopup = ({ courseId, lessonId, onClose }) => {
    const [lesson, setLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lessonId) {
            setLesson(null);
            setError(null);
            return;
        }

        const fetchLesson = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await adminGetLessonById(courseId, lessonId);
                setLesson(result.data);
            } catch (err) {
                const errorMessage = err?.message || "Không thể tải chi tiết bài học.";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLesson();
    }, [courseId, lessonId]);

    if (!lessonId) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    {isLoading ? (
                        <h2 className="text-2xl font-bold text-gray-500">Đang tải bài học...</h2>
                    ) : error ? (
                        <h2 className="text-2xl font-bold text-red-600">ERROR</h2>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-900">{lesson?.title}</h2>
                    )}
                    <button onClick={onClose} className="text-gray-500 bg-transparent border-none focus:outline-none hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center p-10">
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-10 text-red-600 flex flex-col items-center gap-4">
                        <AlertTriangle size={48} />
                        <p className="font-semibold text-lg">ERROR ACCUR</p>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson?.textContent }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonDetailPopup;
