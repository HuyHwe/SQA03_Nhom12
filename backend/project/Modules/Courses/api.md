## Các API dùng trong Module Course

### Course

- GET api/courses - Lấy danh sách tất cả khóa học
- GET api/courses/{id} - Lấy thông tin chi tiết của một khóa học
- GET api/courses/search - Tìm kiếm khóa học theo từ khóa hoặc tiêu chí
- GET api/courses/teacher/my-courses - Lấy các khóa học của giảng viên đăng nhập
- GET api/courses/teacher/{teacherId}/courses - Lấy các khóa học theo Id giảng viên
- GET api/courses/student/enrolled-courses - Lấy ra những khóa học mà học viên đăng ký
- POST api/courses - Tạo mới một khóa học
- POST api/courses/{id}/request-update - Gửi yêu cầu cập nhật khóa học khi đã được public
- PATCH api/courses/{id} ------- Only When Draft - Cập nhật nội dung khóa học (chỉ khi ở trạng thái bản nháp)
- PATCH api/courses/{id}/request-publish ------- When published - Gửi yêu cầu xuất bản khóa học

### CourseContent

- GET api/courses/{courseId}/content - Lấy phần giới thiệu của khóa học
- POST api/course/{courseId}/content - Tạo mới phần giới thiệu cho khóa học
- POST api/course/{courseId}/content/request-update ------- When published - Gửi yêu cầu cập nhật phần giới thiệu khi khóa học đã được public
- PATCH api/course/{courseId}/content ------- Only When Draft - Cập nhật phần giới thiệu

### Lesson

- GET api/course-content/{courseContentId}/lessons - Lấy danh sách bài học
- GET api/course-content/{courseContentId}/lessons/{lessonId} - Xem chi tiết một bài học
- POST api/course-content/{courseContentId}/lessons - Tạo mới bài học
- POST api/course-content/{courseContentId}/lessons/order - Cập nhật thứ tự sắp xếp bài học(khi chưa public)
- POST api/course-content/{courseContentId}/lessons/{lessonId}/request-update ------- When published - Gửi yêu cầu cập nhật bài học khi đã public
- PATCH api/course-content/{courseContentId}/lessons/{lessonId} ------- Only When Draft - Cập nhật bài học(khi chưa public)

### CourseReview

- GET api/{courseId}/reviews - Lấy danh sách đánh giá của người học cho khóa học
- POST api/{courseId}/reviews - Gửi đánh giá mới cho khóa học
- PATCH api/{courseId}/reviews/{reviewId} - Chỉnh sửa nội dung đánh giá đã gửi

### Category

- POST api/categories - Tạo mới danh mục cho các khóa học

### Enrollments

- GET api/courses/{courseId}/enrollments - Lấy danh sách bản ghi người học đã ghi danh trong khóa học
- GET api/courses/{courseId}/enrollments/{enrollmentId} - Xem thông tin về quá trình học của một người học trong khóa học
- GET api/courses/{courseId}/enrollments/is-enrolled
- POST api/courses/{courseId}/enrollments - Người dùng ghi danh tham gia khóa học
- PATCH api/courses/{courseId}/enrollments/{enrollmentId}/progress - Cập nhật tiến độ học tập của người học trong khóa học
- POST api/courses/{courseId}/enrollments/{enrollmentId}/request-cancel

Certificate ???
