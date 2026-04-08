const checkCourseCreate = (course, courseContent) => {
  if (!course.title || course.title.trim() === "") {
    return { ok: false, reason: "Tiêu đề khóa học không được để trống." };
  }

  if (!course.categoryId) {
    return { ok: false, reason: "Vui lòng chọn danh mục." };
  }

  if (!course.description || course.description.trim().length < 10) {
    return {
      ok: false,
      reason: "Mô tả khóa học phải có ít nhất 10 ký tự.",
    };
  }

  if (!course.price || Number(course.price) <= 0) {
    return { ok: false, reason: "Giá phải lớn hơn 0." };
  }

  if (Number(course.discount) < 0 || Number(course.discount) > 100) {
    return { ok: false, reason: "Giảm giá phải từ 0 đến 100%." };
  }

  if (!courseContent.title || courseContent.title.trim() === "") {
    return { ok: false, reason: "Tên phần nội dung không được bỏ trống." };
  }

  if (courseContent.lessons.length === 0) {
    return { ok: false, reason: "Khóa học phải có ít nhất 1 bài học." };
  }

  for (let i = 0; i < courseContent.lessons.length; i++) {
    const l = courseContent.lessons[i];
    if (!l.title || l.title.trim() === "") {
      return { ok: false, reason: `Bài học thứ ${i + 1} thiếu tiêu đề.` };
    }
    if (!l.duration) {
      return { ok: false, reason: `Bài học thứ ${i + 1} thiếu thời lượng.` };
    }
    if (l.duration <= 0) {
      return {
        ok: false,
        reason: `Thời lượng bài học thứ ${i + 1} phải lớn hơn 0.`,
      };
    }
  }

  return { ok: true };
};

export default checkCourseCreate;
