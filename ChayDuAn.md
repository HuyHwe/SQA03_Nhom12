# Hướng Dẫn Chạy Dự Án (Full Stack)

Hướng dẫn chi tiết cách cài đặt và chạy dự án bao gồm Backend (Spring Boot + Microservices) và Frontend (Angular).

---

## Phần 1: Backend (Server)

Phần Backend nằm trong thư mục `DoAn-main`. Sử dụng Docker để chạy toàn bộ hệ thống services.

### 1. Chuẩn bị môi trường (Cài đặt)
1.  **Cài đặt Docker Desktop**:
    *   Tải và cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) cho Mac/Windows.
    *   Khởi động Docker Desktop.


### 2. Chạy Backend
1.  Mở Terminal.
2.  Di chuyển vào thư mục backend:
    ```bash
    cd ./DoAn-main
    ```
    *(Lưu ý: Thay đổi đường dẫn nếu bạn đặt folder ở chỗ khác, nhưng phải vào đúng folder `DoAn-main`)*.
3.  Chạy lệnh Docker Compose để build và start services:
    ```bash
    docker compose -f docker-compose-full.yml up -d --build
    ```
    *   `-f docker-compose-full.yml`: Chọn file cấu hình đầy đủ.
    *   `up`: Khởi động containers.
    *   `-d`: Chạy ngầm (Detached mode).
    *   `--build`: Build lại image nếu có thay đổi code.

    *Lần đầu chạy sẽ mất khoảng 5-15 phút để tải thư viện và build.*

4.  **Kiểm tra trạng thái**:
    *   Xem logs toàn bộ để đảm bảo không có lỗi:
        ```bash
        docker compose -f docker-compose-full.yml logs -f
        ```
        (Nhấn `Ctrl + C` để thoát xem log).
    *   Truy cập Eureka Service để xem các services đã lên chưa: [http://localhost:2001](http://localhost:2001)


Fill Database: 
Dùng prompt với Anti Gravity: Hãy chạy cho tôi file file.sql để đẩy db, using user admin và db jober_test

### 3. Tắt Backend
Khi không dùng nữa, tắt để giải phóng RAM:
```bash
docker compose -f docker-compose-full.yml down
```

---

## Phần 2: Frontend (Client)

Phần Frontend nằm trong thư mục `DoAnFE-main`. Sử dụng Angular và Yarn.

### 1. Chuẩn bị môi trường
1.  **Cài đặt Node.js**: Tải bản LTS tại [nodejs.org](https://nodejs.org/).
2.  **Cài đặt Yarn** (nếu chưa có):
    Chạy lệnh sau trong Terminal:
    ```bash
    npm install --global yarn
    ```

### 2. Cài đặt thư viện (Chạy lần đầu)
1.  Mở tab Terminal mới (giữ Terminal backend chạy riêng hoặc đã ẩn).
2.  Di chuyển vào thư mục frontend:
    ```bash
    cd /Users/nguyenduchuy/SQADoAn/DoAnFE-main
    ```
3.  Cài đặt các gói phụ thuộc (dependencies):
    ```bash
    yarn install
    ```
    *Đợi lệnh chạy xong và báo `Done`.*

### 3. Chạy Frontend
1.  Khởi động server phát triển:
    ```bash
    npm start
    ```
    Hoặc dùng lệnh của Angular CLI trực tiếp:
    ```bash
    ng serve
    ```
2.  **Truy cập Web**:
    *   Mở trình duyệt vào địa chỉ: [http://localhost:4200/](http://localhost:4200/)

---

## Tóm tắt nhanh

1.  **Tab Terminal 1 (Backend)**:
    ```bash
    cd SQADoAn/DoAn-main
    docker compose -f docker-compose-full.yml up -d
    ```
2.  **Tab Terminal 2 (Frontend)**:
    ```bash
    cd SQADoAn/DoAnFE-main
    npm start
    ```
