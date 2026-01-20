-- Insert sample data for jobdefault table
INSERT INTO jobdefault (id, name, des, parentid, creationdate, updatedate, icon, active) VALUES
(1, 'Công nghệ thông tin', 'Các công việc liên quan đến IT', NULL, NOW(), NOW(), 'tech-icon', 1),
(2, 'Lập trình viên', 'Phát triển phần mềm', 1, NOW(), NOW(), 'dev-icon', 1),
(3, 'Thiết kế', 'Thiết kế đồ họa và UI/UX', NULL, NOW(), NOW(), 'design-icon', 1),
(4, 'Marketing', 'Tiếp thị và quảng cáo', NULL, NOW(), NOW(), 'marketing-icon', 1),
(5, 'Kinh doanh', 'Bán hàng và phát triển kinh doanh', NULL, NOW(), NOW(), 'business-icon', 1),
(6, 'Java Developer', 'Lập trình Java', 2, NOW(), NOW(), 'java-icon', 1),
(7, 'Frontend Developer', 'Lập trình Frontend', 2, NOW(), NOW(), 'frontend-icon', 1),
(8, 'Backend Developer', 'Lập trình Backend', 2, NOW(), NOW(), 'backend-icon', 1),
(9, 'Tài chính kế toán', 'Các công việc về tài chính', NULL, NOW(), NOW(), 'finance-icon', 1),
(10, 'Nhân sự', 'Quản lý nhân sự', NULL, NOW(), NOW(), 'hr-icon', 1);

-- Insert sample data for job table
INSERT INTO job (id, userid, name, job, lat, lng, phone, email, number, address, des, salary, expdate, requiredexperiencelevel, requiredskilllevel, profit, requiredskill, province, district, ward, jobdefaultid, workingtype, organizationid, creationdate, updatedate, active, level)
VALUES
-- Jobs in Hanoi
(1, 1, 'Tuyển dụng lập trình viên Java Senior', 'Java Developer', 21.0285, 105.8542, '0123456789', 'hr@techcompany.com', 2, '123 Đường Láng, Đống Đa, Hà Nội', 'Cần tuyển lập trình viên Java có kinh nghiệm 3+ năm. Thành thạo Spring Boot, microservices.', '20-30 triệu', '2024-12-31', 3, 4, 'Thưởng theo dự án', 'Java, Spring Boot, MySQL, Docker', 'Hà Nội', 'Đống Đa', 'Láng Thượng', 6, 1, 1, NOW(), NOW(), 1, 1),

(2, 1, 'Frontend Developer React/Angular', 'Frontend Developer', 21.0313, 105.8516, '0123456790', 'recruit@webapp.vn', 1, '456 Phố Huế, Hai Bà Trưng, Hà Nội', 'Tuyển Frontend Developer thành thạo React/Angular, có kinh nghiệm làm SPA.', '15-25 triệu', '2024-12-25', 2, 3, 'Bonus cuối năm', 'React, Angular, TypeScript, CSS', 'Hà Nội', 'Hai Bà Trưng', 'Phố Huế', 7, 1, 2, NOW(), NOW(), 1, 1),

(3, 1, 'Thiết kế UI/UX cho ứng dụng mobile', 'UI/UX Designer', 21.0245, 105.8412, '0123456791', 'design@mobileapp.com', 1, '789 Thái Hà, Đống Đa, Hà Nội', 'Cần thiết kế UI/UX cho các ứng dụng mobile iOS và Android.', '12-18 triệu', '2024-12-20', 2, 3, 'Thưởng KPI', 'Figma, Sketch, Adobe XD', 'Hà Nội', 'Đống Đa', 'Thái Hà', 3, 1, 3, NOW(), NOW(), 1, 1),

(4, 1, 'Marketing Digital chuyên Facebook Ads', 'Digital Marketer', 21.0278, 105.8342, '0123456792', 'marketing@ecommerce.vn', 2, '321 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'Tuyển Marketing Digital có kinh nghiệm chạy Facebook Ads, Google Ads.', '10-15 triệu', '2024-12-15', 1, 2, 'Hoa hồng theo doanh số', 'Facebook Ads, Google Ads, Analytics', 'Hà Nội', 'Thanh Xuân', 'Khương Mai', 4, 1, 4, NOW(), NOW(), 1, 1),

(5, 1, 'Backend Developer Node.js', 'Backend Developer', 21.0227, 105.8194, '0123456793', 'tech@startup.io', 1, '654 Cầu Giấy, Cầu Giấy, Hà Nội', 'Phát triển API và hệ thống backend cho ứng dụng fintech.', '18-28 triệu', '2024-12-30', 2, 4, 'Stock options', 'Node.js, Express, MongoDB, Redis', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 8, 1, 5, NOW(), NOW(), 1, 1),

-- Jobs in Ho Chi Minh City  
(6, 1, 'Full-stack Developer MERN Stack', 'Full-stack Developer', 10.8231, 106.6297, '0123456794', 'careers@techsaigon.com', 2, '123 Nguyễn Văn Cừ, Quận 5, TP.HCM', 'Phát triển ứng dụng web full-stack với MERN stack.', '22-35 triệu', '2024-12-28', 3, 4, 'Thưởng dự án', 'MongoDB, Express, React, Node.js', 'TP. Hồ Chí Minh', 'Quận 5', 'Phường 1', 2, 1, 6, NOW(), NOW(), 1, 1),

(7, 1, 'Business Analyst', 'Business Analyst', 10.7769, 106.7009, '0123456795', 'ba@consulting.com', 1, '456 Võ Văn Tần, Quận 3, TP.HCM', 'Phân tích yêu cầu nghiệp vụ và thiết kế giải pháp cho doanh nghiệp.', '16-24 triệu', '2024-12-22', 2, 3, 'Thưởng hiệu suất', 'Business Analysis, SQL, Excel', 'TP. Hồ Chí Minh', 'Quận 3', 'Phường 6', 5, 1, 7, NOW(), NOW(), 1, 1),

(8, 1, 'Kế toán tổng hợp', 'Kế toán', 10.7624, 106.6822, '0123456796', 'hr@manufacture.vn', 1, '789 Lê Văn Sỹ, Quận Tân Bình, TP.HCM', 'Làm kế toán tổng hợp cho công ty sản xuất, báo cáo tài chính.', '8-12 triệu', '2024-12-18', 1, 2, 'Thưởng lễ tết', 'Excel, SAP, Kế toán doanh nghiệp', 'TP. Hồ Chí Minh', 'Quận Tân Bình', 'Phường 7', 9, 1, 8, NOW(), NOW(), 1, 1),

(9, 1, 'Nhân viên tuyển dụng', 'HR Recruitment', 10.7829, 106.6958, '0123456797', 'recruit@hrcompany.com', 2, '321 Pasteur, Quận 1, TP.HCM', 'Tuyển dụng nhân sự cho các vị trí IT và phi IT.', '9-14 triệu', '2024-12-26', 1, 2, 'Thưởng tuyển dụng', 'Tuyển dụng, Phỏng vấn, HR', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 10, 1, 9, NOW(), NOW(), 1, 1),

(10, 1, 'iOS Developer Swift', 'iOS Developer', 10.7756, 106.7019, '0123456798', 'mobile@appdev.vn', 1, '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'Phát triển ứng dụng iOS native với Swift và SwiftUI.', '20-30 triệu', '2024-12-27', 3, 4, 'Thưởng sản phẩm', 'Swift, SwiftUI, Xcode, iOS SDK', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 'Phường 21', 2, 1, 10, NOW(), NOW(), 1, 1),

-- More jobs in Hanoi
(11, 1, 'DevOps Engineer', 'DevOps Engineer', 21.0144, 105.8454, '0123456799', 'devops@cloudtech.vn', 1, '111 Trần Duy Hưng, Cầu Giấy, Hà Nội', 'Quản lý hạ tầng cloud và CI/CD pipeline.', '25-40 triệu', '2024-12-29', 3, 5, 'Stock options', 'AWS, Docker, Kubernetes, Jenkins', 'Hà Nội', 'Cầu Giấy', 'Trần Duy Hưng', 2, 1, 11, NOW(), NOW(), 1, 1),

(12, 1, 'Product Manager', 'Product Manager', 21.0313, 105.8516, '0123456800', 'pm@product.tech', 1, '222 Nguyễn Chí Thanh, Đống Đa, Hà Nội', 'Quản lý sản phẩm công nghệ từ ý tưởng đến triển khai.', '30-45 triệu', '2025-01-05', 4, 5, 'Equity', 'Product Management, Agile, Analytics', 'Hà Nội', 'Đống Đa', 'Kim Liên', 5, 1, 12, NOW(), NOW(), 1, 1),

-- Jobs in Da Nang
(13, 1, 'QA Automation Engineer', 'QA Engineer', 16.0544, 108.2022, '0123456801', 'qa@testware.vn', 1, '333 Lê Duẩn, Hải Châu, Đà Nẵng', 'Tự động hóa testing cho ứng dụng web và mobile.', '15-22 triệu', '2024-12-24', 2, 3, 'Thưởng chất lượng', 'Selenium, Appium, Java, TestNG', 'Đà Nẵng', 'Hải Châu', 'Hải Châu I', 2, 1, 13, NOW(), NOW(), 1, 1),

(14, 1, 'Content Creator', 'Content Creator', 16.0678, 108.2208, '0123456802', 'content@media.dn', 2, '444 Hoàng Diệu, Hải Châu, Đà Nẵng', 'Sáng tạo nội dung cho social media và website.', '8-15 triệu', '2024-12-21', 1, 2, 'Thưởng viral', 'Content Writing, Social Media, Photoshop', 'Đà Nẵng', 'Hải Châu', 'Thạch Thang', 4, 1, 14, NOW(), NOW(), 1, 1),

(15, 1, 'Data Analyst', 'Data Analyst', 16.0544, 108.2022, '0123456803', 'data@analytics.vn', 1, '555 Đinh Tiên Hoàng, Hải Châu, Đà Nẵng', 'Phân tích dữ liệu và tạo báo cáo business intelligence.', '12-20 triệu', '2024-12-23', 2, 3, 'Thưởng insight', 'SQL, Python, Tableau, Excel', 'Đà Nẵng', 'Hải Châu', 'Hòa Cường Bắc', 2, 1, 15, NOW(), NOW(), 1, 1);

-- Insert sample organizations
INSERT INTO organization (id, name, avatar, des, creationdate, updatedate, active)
VALUES
(1, 'TechCorp Vietnam', 'https://via.placeholder.com/100x100?text=TechCorp', 'Công ty công nghệ hàng đầu Việt Nam', NOW(), NOW(), 1),
(2, 'WebApp Solutions', 'https://via.placeholder.com/100x100?text=WebApp', 'Chuyên phát triển ứng dụng web', NOW(), NOW(), 1),
(3, 'MobileApp Studio', 'https://via.placeholder.com/100x100?text=Mobile', 'Studio phát triển ứng dụng di động', NOW(), NOW(), 1),
(4, 'Digital Marketing Pro', 'https://via.placeholder.com/100x100?text=Marketing', 'Chuyên digital marketing', NOW(), NOW(), 1),
(5, 'Fintech Startup', 'https://via.placeholder.com/100x100?text=Fintech', 'Startup công nghệ tài chính', NOW(), NOW(), 1),
(6, 'Saigon Tech', 'https://via.placeholder.com/100x100?text=Saigon', 'Công ty công nghệ tại TP.HCM', NOW(), NOW(), 1),
(7, 'Business Consulting', 'https://via.placeholder.com/100x100?text=Consulting', 'Công ty tư vấn doanh nghiệp', NOW(), NOW(), 1),
(8, 'Manufacturing Co', 'https://via.placeholder.com/100x100?text=Manufacturing', 'Công ty sản xuất', NOW(), NOW(), 1),
(9, 'HR Solutions', 'https://via.placeholder.com/100x100?text=HR', 'Giải pháp nhân sự', NOW(), NOW(), 1),
(10, 'App Development', 'https://via.placeholder.com/100x100?text=AppDev', 'Phát triển ứng dụng', NOW(), NOW(), 1),
(11, 'CloudTech', 'https://via.placeholder.com/100x100?text=Cloud', 'Công nghệ đám mây', NOW(), NOW(), 1),
(12, 'ProductTech', 'https://via.placeholder.com/100x100?text=Product', 'Công ty sản phẩm công nghệ', NOW(), NOW(), 1),
(13, 'TestWare', 'https://via.placeholder.com/100x100?text=TestWare', 'Chuyên testing phần mềm', NOW(), NOW(), 1),
(14, 'Media Đà Nẵng', 'https://via.placeholder.com/100x100?text=Media', 'Công ty truyền thông', NOW(), NOW(), 1),
(15, 'Analytics Pro', 'https://via.placeholder.com/100x100?text=Analytics', 'Chuyên phân tích dữ liệu', NOW(), NOW(), 1);

-- Reset sequences to continue from the last inserted ID
SELECT setval('jobdefault_id_seq', (SELECT MAX(id) FROM jobdefault));
SELECT setval('job_id_seq', (SELECT MAX(id) FROM job));
SELECT setval('organization_id_seq', (SELECT MAX(id) FROM organization));

