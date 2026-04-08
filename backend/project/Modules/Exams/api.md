## Các API dùng trong Module Exam

### Exam

- GET api/exam - Lấy danh sách tất cả bài thi
- GET api/exam/{id} - Lấy thông tin chi tiết của một bài thi cụ thể
- GET api/exams/course/{courseId}
- GET api/exams/lesson/{lessonId}
- GET api/exams/{examId}/history - Lấy các lần làm bài(có kết quả) của 1 học viên của 1 bài kiểm tra
- POST api/exam - Tạo mới một bài thi
- POST api/exam/{id}/order - Sắp xếp thứ tự câu hỏi trong bài thi
- PATCH api/exam/{id} - Cập nhật thông tin bài thi

### QuestionExam

- GET api/{examId}/question-exams/for-exam - Lấy danh sách câu hỏi dùng cho người học khi làm bài thi
- GET api/{examId}/question-exams/for-review - Lấy danh sách câu hỏi và đáp án đúng để xem lại kết quả sau khi làm bài
- GET api/{examId}/question-exams/for-exam/{id} - Lấy chi tiết một câu hỏi cụ thể trong lúc làm bài thi
- GET api/{examId}/question-exams/for-review/{id} - Lấy chi tiết câu hỏi cụ thể trong phần xem lại
- POST api/{examId}/question-exams - Thêm mới câu hỏi vào bài thi
- DELETE api/{examId}/question-exams/{questionExamId}

### Choice

- POST api/{questionExamId}/choices - Thêm các đáp án lựa chọn cho một câu hỏi
- PATCH api/{questionExamId}/choices/{choiceId} - Sửa lại nội dung đáp án(nếu exam chưa public)
- DELETE api/{questionExamId}/choices/{id} - Xóa một đáp án khỏi câu hỏi

### Submit

- POST api/submit/{examId} - Nộp bài thi của người học, hệ thống sẽ chấm điểm và lưu kết quả
