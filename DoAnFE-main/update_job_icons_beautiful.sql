-- Script để cập nhật icon cho các ngành nghề nổi bật với ảnh đẹp hơn
-- Sử dụng Icons8 và các nguồn ảnh chất lượng cao

-- Kinh doanh - Bán hàng (Price tag với $)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/price-tag.png' 
WHERE LOWER(name) LIKE '%kinh doanh%' OR LOWER(name) LIKE '%bán hàng%' OR LOWER(name) LIKE '%sale%';

-- Marketing - PR - Quảng cáo (Megaphone)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/megaphone.png' 
WHERE LOWER(name) LIKE '%marketing%' OR LOWER(name) LIKE '%truyền thông%' OR LOWER(name) LIKE '%quảng cáo%' OR LOWER(name) LIKE '%telesales%';

-- Chăm sóc khách hàng (Headset)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/headset.png' 
WHERE LOWER(name) LIKE '%chăm sóc%' OR LOWER(name) LIKE '%customer%' OR LOWER(name) LIKE '%tư vấn%';

-- Nhân sự - Hành chính (Briefcase)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/briefcase.png' 
WHERE LOWER(name) LIKE '%nhân sự%' OR LOWER(name) LIKE '%hành chính%' OR LOWER(name) LIKE '%văn phòng%' OR LOWER(name) LIKE '%tuyển sinh%';

-- Công nghệ Thông tin (Computer)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/computer.png' 
WHERE LOWER(name) LIKE '%công nghệ%' OR LOWER(name) LIKE '%it%' OR LOWER(name) LIKE '%lập trình%' OR LOWER(name) LIKE '%devops%' OR LOWER(name) LIKE '%programmer%' OR LOWER(name) LIKE '%developer%' OR LOWER(name) LIKE '%php%' OR LOWER(name) LIKE '%.net%';

-- Tài chính - Ngân hàng (Bank)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/bank.png' 
WHERE LOWER(name) LIKE '%tài chính%' OR LOWER(name) LIKE '%ngân hàng%' OR LOWER(name) LIKE '%kế toán%' OR LOWER(name) LIKE '%kiểm toán%' OR LOWER(name) LIKE '%thuế%' OR LOWER(name) LIKE '%techcombank%';

-- Bất động sản (Home)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/home.png' 
WHERE LOWER(name) LIKE '%bất động sản%' OR LOWER(name) LIKE '%nhà đất%' OR LOWER(name) LIKE '%real estate%';

-- Y tế - Dược (Medical)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/medical.png' 
WHERE LOWER(name) LIKE '%y tế%' OR LOWER(name) LIKE '%dược%' OR LOWER(name) LIKE '%bác sĩ%' OR LOWER(name) LIKE '%y tá%';

-- Giáo dục - Đào tạo (Education)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/school.png' 
WHERE LOWER(name) LIKE '%giáo dục%' OR LOWER(name) LIKE '%đào tạo%' OR LOWER(name) LIKE '%trường học%' OR LOWER(name) LIKE '%học viên%';

-- Sản xuất - Công nghiệp (Factory)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/factory.png' 
WHERE LOWER(name) LIKE '%sản xuất%' OR LOWER(name) LIKE '%công nhân%' OR LOWER(name) LIKE '%công nghiệp%' OR LOWER(name) LIKE '%đóng gói%' OR LOWER(name) LIKE '%kỹ sư%';

-- Thiết kế - Đồ họa (Design)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/design.png' 
WHERE LOWER(name) LIKE '%thiết kế%' OR LOWER(name) LIKE '%đồ họa%' OR LOWER(name) LIKE '%designer%' OR LOWER(name) LIKE '%design%';

-- Khách sạn - Nhà hàng (Hotel)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/hotel.png' 
WHERE LOWER(name) LIKE '%khách sạn%' OR LOWER(name) LIKE '%nhà hàng%' OR LOWER(name) LIKE '%hotel%' OR LOWER(name) LIKE '%restaurant%' OR LOWER(name) LIKE '%pha chế%';

-- Vận tải - Logistics (Truck)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/truck.png' 
WHERE LOWER(name) LIKE '%vận tải%' OR LOWER(name) LIKE '%logistics%' OR LOWER(name) LIKE '%vận hành%' OR LOWER(name) LIKE '%shipping%';

-- Nông nghiệp (Agriculture)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/agriculture.png' 
WHERE LOWER(name) LIKE '%nông lâm%' OR LOWER(name) LIKE '%ngư nghiệp%' OR LOWER(name) LIKE '%agriculture%';

-- Báo chí - Truyền hình (News)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/news.png' 
WHERE LOWER(name) LIKE '%báo chí%' OR LOWER(name) LIKE '%truyền hình%' OR LOWER(name) LIKE '%media%' OR LOWER(name) LIKE '%journalism%';

-- Điện tử - Viễn thông (Phone)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/phone.png' 
WHERE LOWER(name) LIKE '%điện tử%' OR LOWER(name) LIKE '%viễn thông%' OR LOWER(name) LIKE '%telecom%';

-- Thêm các ngành nghề còn thiếu:

-- Luật pháp (Law)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/law.png' 
WHERE LOWER(name) LIKE '%luật%' OR LOWER(name) LIKE '%pháp lý%' OR LOWER(name) LIKE '%law%';

-- Xây dựng (Construction)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/construction.png' 
WHERE LOWER(name) LIKE '%xây dựng%' OR LOWER(name) LIKE '%construction%' OR LOWER(name) LIKE '%kiến trúc%';

-- Nghệ thuật (Art)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/art.png' 
WHERE LOWER(name) LIKE '%nghệ thuật%' OR LOWER(name) LIKE '%art%' OR LOWER(name) LIKE '%music%' OR LOWER(name) LIKE '%âm nhạc%';

-- Thể thao (Sports)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/sports.png' 
WHERE LOWER(name) LIKE '%thể thao%' OR LOWER(name) LIKE '%sports%' OR LOWER(name) LIKE '%fitness%';

-- Du lịch (Travel)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/travel.png' 
WHERE LOWER(name) LIKE '%du lịch%' OR LOWER(name) LIKE '%travel%' OR LOWER(name) LIKE '%tourism%';

-- Môi trường (Environment)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/environment.png' 
WHERE LOWER(name) LIKE '%môi trường%' OR LOWER(name) LIKE '%environment%' OR LOWER(name) LIKE '%ecology%';

-- An ninh (Security)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/security.png' 
WHERE LOWER(name) LIKE '%an ninh%' OR LOWER(name) LIKE '%security%' OR LOWER(name) LIKE '%bảo vệ%';

-- Cập nhật các job cụ thể từ database
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/bug.png' 
WHERE name = 'Fix bug';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/calculator.png' 
WHERE name = 'Kế toán Thuế';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/computer.png' 
WHERE name = 'Chuyên viên Triển khai Giải pháp ERP';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/headset.png' 
WHERE name = 'Nhân viên Tư vấn';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/price-tag.png' 
WHERE name = 'Nhân viên Kinh doanh';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/headset.png' 
WHERE name = 'Nhân viên Chăm sóc Khách hàng';

-- Bổ sung thêm các ngành nghề còn thiếu:

-- Giáo dục - Đào tạo (School)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/school.png' 
WHERE LOWER(name) LIKE '%giáo viên%' OR LOWER(name) LIKE '%teacher%' OR LOWER(name) LIKE '%tiếng anh%' OR LOWER(name) LIKE '%english%';

-- Kỹ sư - Kỹ thuật (Engineering)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/engineering.png' 
WHERE LOWER(name) LIKE '%kỹ sư%' OR LOWER(name) LIKE '%engineer%' OR LOWER(name) LIKE '%kĩ sư%' OR LOWER(name) LIKE '%quản lý dữ liệu%' OR LOWER(name) LIKE '%data%';

-- Quản lý (Management)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/management.png' 
WHERE LOWER(name) LIKE '%quản lý%' OR LOWER(name) LIKE '%management%' OR LOWER(name) LIKE '%giám đốc%' OR LOWER(name) LIKE '%director%' OR LOWER(name) LIKE '%manager%';

-- CTO, CEO, Dev, SE
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/executive.png' 
WHERE name = 'CTO' OR name = 'CEO';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/code.png' 
WHERE name = 'Dev' OR name = 'SE';

-- Giúp việc, Phụ bếp (Service)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/cleaning.png' 
WHERE name = 'Giúp việc';

UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/chef.png' 
WHERE name = 'Phụ bếp';

-- Business Consultant
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/business.png' 
WHERE LOWER(name) LIKE '%business consultant%' OR LOWER(name) LIKE '%tư vấn kinh doanh%';

-- Giao dịch viên (Teller)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/bank.png' 
WHERE LOWER(name) LIKE '%giao dịch viên%' OR LOWER(name) LIKE '%teller%';

-- Business Development Executive
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/business.png' 
WHERE LOWER(name) LIKE '%business development%' OR LOWER(name) LIKE '%phát triển kinh doanh%';

-- Nhân viên văn phòng (Office Staff)
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/office.png' 
WHERE LOWER(name) LIKE '%nhân viên văn phòng%' OR LOWER(name) LIKE '%office staff%';

-- Cập nhật tất cả các job còn lại với icon mặc định đẹp
UPDATE jobdefault SET icon = 'https://img.icons8.com/color/64/briefcase.png' 
WHERE icon LIKE '%encrypted-tbn0.gstatic.com%' OR icon LIKE '%gstatic.com%';

-- Kiểm tra kết quả
SELECT name, icon FROM jobdefault WHERE icon LIKE 'https://img.icons8.com%' ORDER BY name;
