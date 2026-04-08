import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Hero from "./Components/Hero";
import ExamInformation from "./Components/ExamInformation/ExamInformation";
import ListQuestion from "./Components/ListQuestion/ListQuestion";

import { useCreateExam } from "./Components/CustomCreateExamHook/useCreateExam";
import { fetchCourseContentOverview } from "../../../api/courseContent.api";

function CreateExam(){
    var { courseId } = useParams();
    useEffect(() => window.scrollTo(0,0), []);
    const createExamState = useCreateExam();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [courseContentInfor, setCourseContentInfor] = useState(null);

    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleOptions, setShuffleOptions] = useState(true);

    const loadCourseContentInfor = async (courseId) => {
        try{
            const response = await fetchCourseContentOverview(courseId);
            if(response.status === "success"){
                const courseContentData = response.data;
                setCourseContentInfor(courseContentData);
            }
        } catch (e) {
            setError("Lỗi khi tải thông tin khoá học: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(courseId){
            loadCourseContentInfor(courseId);
        }
    }, [courseId]);

    // const onImportCSV = (e) => {
    //   const file = e.target.files?.[0];
    //   if (!file) return;
    //   alert(`Đã chọn file: ${file.name}\n(Demo) Bạn sẽ parse CSV ở backend/worker để tạo batch câu hỏi.`);
    //   e.target.value = "";
    // };

    if(loading){
        return (
            <div className="min-h-screen w-screen max-w-none bg-white flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        (!loading && !error) && (
            <div className="min-h-screen w-screen max-w-none bg-white">
                <Hero />

                <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8">
                    <ExamInformation 
                        courseId={courseId}
                        courseContentInfor={courseContentInfor}
                        shuffleQuestions={shuffleQuestions} setShuffleQuestions={setShuffleQuestions}
                        shuffleOptions={shuffleOptions} setShuffleOptions={setShuffleOptions}
                        {...createExamState}
                    />

                    <ListQuestion
                        {...createExamState}
                    />
                </main>
            </div>
        )
    )
}

export default CreateExam;