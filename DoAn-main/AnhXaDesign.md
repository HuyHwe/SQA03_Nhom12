# Mapping Code Folder & File theo Use Case (Chi tiết kỹ thuật)

Tài liệu này ánh xạ chi tiết các Use Case tới Controller, API Endpoint, Service Interface và Service Implementation tương ứng.

## 1. Quản lý tài khoản (Account Management)
*Hình 2.2*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.UserCommonCtrl`
    - `POST /bs-user/login`: Đăng nhập -> `UserCommonService.login`
    - `POST /bs-user/user_common/_create`: Đăng ký -> `UserCommonService.createUser`
    - `POST /bs-user/user_common/_update`: Cập nhật -> `UserCommonService.saveUser`
    - `GET /bs-user/user_common/user-info`: Lấy thông tin -> `UserCommonService.getUserInfo`
- **Service Interface:** `com.resourceservice.service.UserCommonService`
- **Service Implementation:** `com.resourceservice.service.impl.UserCommonServiceImpl`

**Frontend:**
- `src/app/pages/login`
- `src/app/pages/profile`

---

## 2. Quản lý bài đăng (Post Management) & Tuyển dụng (Recruitment)
*Hình 2.3, 2.11*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.JobCtrl`
    - `POST /bs-user/bs-job/_save`: Tạo/Sửa bài đăng -> `JobService.saveJob`
    - `POST /bs-user/bs-job/_delete`: Xóa bài đăng -> `JobService.deleteJobs`
    - `GET /bs-user/bs-job/list_posted`: List bài đã đăng -> `JobService.jobsHadPostByRecruiter`
- **Controller:** `com.resourceservice.controller.RecruiterController` (Cho chức năng tuyển dụng)
    - `POST /bs-user/recruiter/posts`: Quản lý bài đăng của recruiter -> `RecruiterService.listPost`
- **Service Interface:**
    - `com.resourceservice.service.JobService`
    - `com.resourceservice.service.RecruiterService`
- **Service Implementation:**
    - `com.resourceservice.service.impl.JobServiceImpl`
    - `com.resourceservice.service.impl.RecruiterServiceImpl`

**Frontend:**
- `src/app/pages/recruiter/posts`
- `src/app/pages/candidate/listjob`

---

## 3. Huấn luyện mô hình & Tìm ứng viên phù hợp (Model Training & Matching)
*Hình 2.4, 2.13*

**Backend Flow:**
- **External Service:** Python Scripts (`train_gnn_and_export.py`, `fastapi_recommend.py`)
- **Controller (Java Integration):**
    - `com.resourceservice.controller.JobCtrl` -> API `/test` -> `RecommendationService.getCandidateRecommendByJob`
    - `com.resourceservice.controller.FreelancerCtrl` -> API `/recommend-candidates` -> `FreelancerService.recommendCandidatesForRecruiter`
- **Service Interface:** `com.resourceservice.service.RecommendationService`
- **Service Implementation:** `com.resourceservice.service.impl.RecommendationServiceImpl` (Gọi tới Python Service hoặc xử lý logic gợi ý)

**Frontend:**
- `src/app/pages/recruiter/searching-freelancer-result`

---

## 4. Trò chuyện với trợ lý ảo (Chat with Virtual Assistant)
*Hình 2.5*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.ChatController`
    - `POST /bs-user/api/chat`: Chat với bot -> Gọi trực tiếp private method `callOllama` (Tích hợp LLM Ollama tại local)
- **Service:** Không sử dụng Service layer tách biệt, xử lý trực tiếp trong Controller.

**Frontend:**
- `src/app/pages/home/shared/chatbot/chatbot.component.ts`

---

## 5. Nạp tiền vào ví (Top up wallet)
*Hình 2.6*

**Backend Flow:**
- **Controller:** `com.paymentservice.controller.WalletCtrl`
    - `GET /wallet/_get_by_user_id`: Xem số dư -> `WalletService.getWalletBalanceByUserPhone`
- **Controller:** `com.paymentservice.controller.PaymentController`
    - `POST /create-payment`: Tạo yêu cầu thanh toán -> `PaymentService.createPayment`
- **Controller:** `com.paymentservice.controller.MomoController`
    - `POST /api/momo/create_payment`: Thanh toán Momo -> `MomoService.createQR`
- **Controller:** `com.paymentservice.controller.VNPayResource`
    - `GET /vnpay/pay`: Thanh toán VNPay -> Xử lý trực tiếp tạo URL
- **Service Implementation:**
    - `com.paymentservice.service.impl.WalletServiceImpl`
    - `com.paymentservice.service.impl.PaymentServiceImpl`
    - `com.paymentservice.service.impl.MomoServiceImpl`

**Frontend:**
- `src/app/pages/candidate/jober-wallet`
- `src/app/pages/payment`

---

## 6. Nhận thông báo (Receive Notifications)
*Hình 2.7*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.NotificationController`
    - `GET /bs-user/notifications/{userId}/{role}`: Lấy thông báo -> `NotificationService.getNotifications`
    - `POST /bs-user/notifications/mark-read/{notificationId}`: Đánh dấu đã đọc -> `NotificationService.markAsRead`
- **Service Implementation:** `com.resourceservice.service.impl.NotificationServiceImpl` (Cần xác nhận file này, thường nằm cùng package impl)

**Frontend:**
- `src/app/pages/notification`

---

## 7. Tìm kiếm việc làm (Job Search)
*Hình 2.8*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.JobCtrl`
    - `POST /bs-user/bs-job/_search`: Tìm kiếm cơ bản -> `JobService.getListJobs`
    - `POST /bs-user/bs-job/_search_advanced`: Tìm kiếm nâng cao -> `JobService.searchJobsAdvanced`
- **Controller:** `com.jober.searchservice.controller.SearchingSuggestionCtrl`
    - `POST /bs-search/getDataSearch`: Gợi ý từ khóa -> `SearchingSuggestionService.getDataSearch`
- **Service Implementation:**
    - `com.resourceservice.service.impl.JobServiceImpl`
    - `com.jober.searchservice.service.impl.SearchingSuggestionServiceImpl`

**Frontend:**
- `src/app/pages/candidate/listjob`

---

## 8. Lưu công việc (Save Job)
*Hình 2.9*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.CandidateController`
    - `POST /bs-user/candidate/jobs/save`: Lấy danh sách đã lưu -> `JobService.listJobsByNote("5", ...)`
- **Controller:** `com.resourceservice.controller.JobCtrl` (hoặc CandidateManagement)
    - Logic lưu thường được xử lý thông qua `CandidateManagementService` hoặc cập nhật trạng thái trong `JobService`.
- **Service Implementation:** `com.resourceservice.service.impl.JobServiceImpl`

**Frontend:**
- Nút Lưu trên `src/app/pages/candidate/listjob`

---

## 9. Ứng tuyển công việc (Apply for Job)
*Hình 2.10*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.JobCtrl`
    - `POST /bs-user/bs-job/_apply_job`: Nộp đơn -> `JobService.applyJob`
- **Service Implementation:** `com.resourceservice.service.impl.JobServiceImpl`

**Frontend:**
- Nút Apply trên trang chi tiết công việc.

---

## 10. Quản lý ứng viên ứng tuyển (Manage Applicants)
*Hình 2.12*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.RecruiterController`
    - `POST /bs-user/recruiter/_get_applied_candidate`: Lấy ds ứng viên -> `RecruiterService.findAppliedCandidate`
    - `POST /bs-user/recruiter/candidates`: Xem hồ sơ ứng viên -> `FreelancerService.listCandidate`
- **Service Implementation:**
    - `com.resourceservice.service.impl.RecruiterServiceImpl`
    - `com.resourceservice.service.impl.FreelancerServiceImpl`

**Frontend:**
- `src/app/pages/recruiter/candidate-management`

---

## 11. Đặt lịch phỏng vấn (Schedule Interview)
*Hình 2.14*

**Backend Flow:**
- **Controller:** `com.resourceservice.controller.ScheduleCtrl`
    - `POST /bs-user/schedule/_save`: Tạo lịch -> `ScheduleService.saveSchedule`
    - `POST /bs-user/schedule/_calendar`: Lấy lịch -> `ScheduleService.getCalendar`
- **Service Implementation:** `com.resourceservice.service.impl.ScheduleImpl`

**Frontend:**
- `src/app/pages/candidate/calendar`
