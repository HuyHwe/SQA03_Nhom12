import { useState } from "react";

function useCourseInfo() {
  const [course, setCourse] = useState({
    id: "",
    title: "",
    categoryId: "",
    categoryName: "",
    level: "",
    description: "",
    price: "",
    discount: "",
    thumbnail: "",
  });

  const updateCourse = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setAllCourse = (data) => {
    setCourse((prev) => ({
      ...prev,
      ...data,
    }));
  };

  return { course, updateCourse, setAllCourse };
}

export { useCourseInfo };
