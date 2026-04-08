import NavigationLesson from "./NavigationLesson";
import LessonContent from "./LessonContent";
import OutlineCourse from "./OutlineCourse/OutlineCourse";

function LessonBody({ courseContentId, lesson, siblings, exams, idx, prev, next, navigate }) {
    return (
        <main className="w-full px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* LEFT: Content */}
            <section className="space-y-6">
                <LessonContent lesson={lesson} />

                <NavigationLesson prev={prev} next={next} lesson={lesson} navigate={navigate} />
            </section>

            {/* RIGHT: Outline */}
            <OutlineCourse 
              siblings={siblings} 
              lesson={lesson} 
              idx={idx} 
              exams={exams}
              courseContentId={courseContentId}
            />
        </div>
      </main>
    )
}

export default LessonBody;