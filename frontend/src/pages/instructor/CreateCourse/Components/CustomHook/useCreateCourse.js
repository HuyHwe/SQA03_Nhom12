// eslint-disable-next-line no-unused-vars
import { useState } from "react";
import { useCourseInfo } from "./useCourseInfo";
import { useCourseContent } from "./useCourseContent";

function useCreateCourse() {
  const { course, updateCourse } = useCourseInfo();
  const {
    courseContent,
    updateCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
  } = useCourseContent();

  return {
    course,
    updateCourse,
    courseContent,
    updateCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
  };
}

export { useCreateCourse };
