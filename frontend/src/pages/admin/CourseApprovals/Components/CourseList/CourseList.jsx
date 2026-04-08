import { useState, useEffect } from "react";

import { Check, X } from "lucide-react";
import CourseItem from "./CourseItem";
import CourseItemReview from "./CourseItemReview";

function CourseList({ courses, statusFilter, actionLoading, onRejectClick, onApproveClick }) {
    const [course, setCourse] = useState(null);
    const [courseList, setCourseList] = useState(courses);

    useEffect(() => {
        setCourseList(courses);
        if (courses && courses.length > 0) {
            const currentCourse = courses.find(c => c.id === course?.id);
            if (currentCourse) {
                setCourse(currentCourse);
            } else {
                setCourse(courses[0]);
            }
        } else {
            setCourse(null);
        }
    }, [courses]);

    const setCourseReview = (course) => {
        setCourse(course);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:col-span-1 space-y-4">
                {courseList.map((courseItem) => (
                    <CourseItem
                        key={courseItem.id}
                        course={courseItem}
                        statusFilter={statusFilter}
                        actionLoading={actionLoading}
                        setCourseReview={setCourseReview}
                    />
                ))}
            </div>
            <div className="lg:col-span-1">
                <div className="sticky top-24">
                    <CourseItemReview
                        course={course}
                        statusFilter={statusFilter}
                        onApproveClick={onApproveClick}
                        onRejectClick={onRejectClick}
                    />
                </div>
            </div>
        </div>
    )
}

export default CourseList;