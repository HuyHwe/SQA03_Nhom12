// eslint-disable-next-line no-unused-vars
import { useState } from "react";
import { useCourseInfo } from "./useCourseInfo";
import { useCourseContent } from "./useCourseContent";

function useCreateCourse() {
  const { course, updateCourse, setAllCourse } = useCourseInfo();
  const {
    courseContent,
    updateCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
    setAllCourseContent,
  } = useCourseContent();

  return {
    course,
    updateCourse,
    setAllCourse,
    courseContent,
    updateCourseContent,
    setAllCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
  };
}

export { useCreateCourse };
