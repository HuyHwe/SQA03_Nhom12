import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Hero from "./Components/Hero";
import WizardHeader from "./Components/WizardHeader";
import PreviewSection from "./Components/PreviewSection";
import FormCreateCourse from "./Components/FormCreateCourse/FormCreateCourse";

import { requireAuth } from "../../../utils/auth";
import { useCreateCourse } from "./Components/CustomHook/useCreateCourse";
import { fetchCourseDataAPI } from "../../../api/courses.api";
import { parseCourseDescription } from "./Components/ParseCourseDescription";

function CourseEdit(){
    const {id} = useParams();
    const createCourseState = useCreateCourse();
    const { setAllCourse, setAllCourseContent } = createCourseState;

    const navigate = useNavigate();

    // yêu cầu phải đăng nhập
    useEffect(() => {
        requireAuth(navigate);
    }, [navigate]);

    // wizard steps
    const [step, setStep] = useState(1);
    const next = () => setStep((s) => Math.min(3, s + 1));
    const prev = () => setStep((s) => Math.max(1, s - 1));

    const [outcomes, setOutcomes] = useState([]);
    const [requirements, setRequirements] = useState([]);

    useEffect(() => {
        async function fetchCourseData(){
            const res = await fetchCourseDataAPI(id);
            const parsed = parseCourseDescription(res.description);

            setAllCourse({
                id: res.id,
                title: res.title,
                description: parsed.description || res.description,
                categoryId: res.categoryId,
                price: res.price,
                discount: res.discount,
                thumbnail: res.thumbnail,
            });

            if (parsed.outcomes && parsed.outcomes.length > 0) setOutcomes(parsed.outcomes);
            if (parsed.requirements && parsed.requirements.length > 0) setRequirements(parsed.requirements);

            setAllCourseContent(res.courseContent);
        }
        fetchCourseData();
    }, [id, setAllCourse, setAllCourseContent]);

    return (
        <div className="min-h-screen w-screen max-w-none bg-white">
            <Hero />

            <main className="w-full px-6 lg:px-12 py-8">
                <WizardHeader step={step} setStep={setStep} />

                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
                <FormCreateCourse
                    step={step}
                    nextStep={next}
                    prevStep={prev}
                    outcomes={outcomes}
                    setOutcomes={setOutcomes}
                    requirements={requirements}
                    setRequirements={setRequirements}
                    {...createCourseState}
                />

                <PreviewSection 
                    outcomes={outcomes}
                    requirements={requirements}
                    {...createCourseState}
                />
                </div>
            </main>
        </div>
    );
}

export default CourseEdit;