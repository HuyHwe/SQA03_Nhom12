1. BACKEND (.NET 8.0)
Mục tiêu: Bao phủ toàn bộ logic xử lý dữ liệu và các quy tắc nghiệp vụ.

Nhóm file	Cần test (%)	Lý do
Modules/.../Services/	100%	Đây là nơi chứa logic quan trọng nhất (ví dụ: PaymentService.cs, CourseService.cs). Phải test tất cả các trường hợp If/Else, Try/Catch tại đây.
Modules/.../Validators/	100%	Các file kiểm tra dữ liệu đầu vào (ví dụ: CreateCourseRequestValidator.cs). Đảm bảo dữ liệu rác không vào được hệ thống.
Controllers/	60-70%	Chỉ cần test các Controller có logic điều hướng phức tạp. Nếu controller chỉ gọi Service rồi trả về kết quả, có thể bỏ qua để tiết kiệm thời gian.
Helper/	100%	Các hàm xử lý chuỗi, mã hóa, xử lý ngày tháng. Các file này nhỏ nhưng được dùng ở khắp nơi, lỗi ở đây sẽ làm hỏng cả hệ thống.
Data/ (Mapping logic)	50%	Nếu bạn có các hàm convert từ Entity sang DTO thủ công, hãy test chúng để tránh mất dữ liệu khi chuyển đổi.
Nhóm có thể bỏ qua (0%):

Migrations/: Code tự động sinh ra.
Models/ (DTOs/Entities): Chỉ là các thuộc tính Get/Set.
Program.cs & appsettings.json: File cấu hình.
2. FRONTEND (React 19)
Mục tiêu: Đảm bảo các hàm xử lý dữ liệu (Unit) và tương tác người dùng (Component) hoạt động đúng.

Nhóm file	Cần test (%)	Lý do
src/utils/	100%	Các hàm tính toán, định dạng (currency, date, string). Đây là phần dễ đạt 100% coverage nhất.
src/store/ (Zustand/Redux)	90%	Test các actions và reducers. Đảm bảo khi gọi hàm "UpdateCart" thì state của Cart thực sự thay đổi đúng.
src/hooks/ (Custom Hooks)	80%	Nếu bạn có logic fetch data hoặc xử lý form phức tạp trong hook (ví dụ useAuth, usePayment), đây là nơi dễ xảy ra lỗi logic.
src/components/ (Complex)	70%	Chỉ tập trung vào các Component có tương tác (Input, Button, Modal). Ví dụ: PaymentForm.jsx, SearchFilter.jsx.
src/api/	50%	Test các interceptors hoặc các xử lý lỗi chung khi gọi API.
Nhóm có thể bỏ qua (0%):

src/assets/: Hình ảnh, icon.
src/pages/: Nếu page chỉ là nơi chứa các component con, hãy test ở component.
App.jsx & main.jsx: File khởi tạo và Routing.