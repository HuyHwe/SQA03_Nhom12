// src/pages/instructor/CourseNew.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Components/Hero";
import WizardHeader from "./Components/WizardHeader";
import { requireAuth } from "../../../utils/auth";
import PreviewSection from "./Components/PreviewSection";
import FormCreateCourse from "./Components/FormCreateCourse/FormCreateCourse";
import { useCreateCourse } from "./Components/CustomHook/useCreateCourse";

export default function CourseNew() {
  const navigate = useNavigate();

  // yêu cầu phải đăng nhập
  useEffect(() => {
    requireAuth(navigate);
  }, [navigate]);

  // wizard steps
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const [outcomes, setOutcomes] = useState([
    "Nắm được mục tiêu khoá",
    "Thiết lập môi trường",
  ]);
  const [requirements, setRequirements] = useState([
    "Máy tính kết nối internet",
  ]);

  const createCourseState = useCreateCourse();
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