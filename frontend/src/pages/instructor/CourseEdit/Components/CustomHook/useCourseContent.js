import { useState } from "react";

function useCourseContent() {
  const [courseContent, setCourseContent] = useState({
    id: "",
    title: "",
    description: "",
    introduce: "",
    lessons: [],
  });

  const updateCourseContent = (field, value) => {
    setCourseContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLesson = () => {
    setCourseContent((prev) => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: "",
          title: "",
          videoUrl: "",
          duration: 0,
          textContent: "",
          order: prev.lessons.length + 1,
        },
      ],
    }));
  };

  const updateLesson = (lessonIndex, field, value) => {
    setCourseContent((prev) => {
      const updatedLessons = [...prev.lessons];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        [field]: value,
      };
      // const updatedLessons = prev.lessons.map((l) =>
      //   l.id === lessonId ? { ...l, [field]: value } : l
      // );

      return {
        ...prev,
        lessons: updatedLessons,
      };
    });
  };

  const setAllCourseContent = (data) => {
    setCourseContent((prev) => ({
      ...prev,
      ...data,
      lessons: data.lessons ?? [],
    }));
  };

  const removeLesson = (lessonIndex) => {
    setCourseContent((prev) => {
      const filtered = prev.lessons.filter((_, idx) => idx !== lessonIndex);
      const updatedLessons = filtered.map((l, idx) => ({
        ...l,
        order: idx + 1,
      }));
      return {
        ...prev,
        lessons: updatedLessons,
      };
    });
  };

  const moveLesson = (oldIndex, newIndex) => {
    setCourseContent((prev) => {
      const lessonsCopy = [...prev.lessons];

      // remove item
      const [movedItem] = lessonsCopy.splice(oldIndex, 1);

      // insert at new index
      lessonsCopy.splice(newIndex, 0, movedItem);
      const updatedLessons = lessonsCopy.map((l, idx) => ({
        ...l,
        order: idx + 1,
      }));

      return {
        ...prev,
        lessons: updatedLessons,
      };
    });
  };

  return {
    courseContent,
    updateCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
    setAllCourseContent,
  };
}

export { useCourseContent };
