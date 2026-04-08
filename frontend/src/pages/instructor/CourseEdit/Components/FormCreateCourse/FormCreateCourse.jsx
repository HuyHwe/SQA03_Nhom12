import GeneralInformation from "./Steps/GeneralInformation";
import DetailContentLesson from "./Steps/DetailContentLesson/DetailContentLesson";
import SettingCourse from "./Steps/SettingCourse";
import WizardNavigation from "./WizardNavigation";

function FormCreateCourse( { 
    step, 
    prevStep, 
    nextStep,
    outcomes,
    setOutcomes,
    requirements,
    setRequirements,
    course, updateCourse, courseContent, updateCourseContent, addLesson, removeLesson, updateLesson, moveLesson
} ) {
    return (
        <section className="space-y-8">
            {/* Step 1 */}
            {step === 1 && 
                <GeneralInformation 
                    course={course} 
                    updateCourse={updateCourse} 
                    outcomes={outcomes} 
                    setOutcomes={setOutcomes}
                    requirements={requirements} 
                    setRequirements={setRequirements}
                />}

            {/* Step 2 */}
            {step === 2 && 
                <DetailContentLesson 
                    course={course}
                    updateCourse={updateCourse}
                    courseContent={courseContent}
                    updateCourseContent={updateCourseContent}
                    addLesson={addLesson}
                    removeLesson={removeLesson}
                    updateLesson={updateLesson}
                    moveLesson={moveLesson}
                />}

            {/* Step 3 */}
            {step === 3 && 
                <SettingCourse 
                    course={course}
                    courseContent={courseContent} 
                    outcomes={outcomes}
                    requirements={requirements}
                />}

            {/* Wizard nav */}
            <WizardNavigation 
                step={step}
                prev={prevStep} 
                next={nextStep}
            />
        </section>
    )
}

export default FormCreateCourse;