# Hướng dẫn chạy dự án

## Tổng quan

* **Backend**: .NET 8.0
* **Frontend**: React 19
* **Database**: SQL Server (chạy bằng Docker)

---

## 1. Cài đặt .NET 8.0 SDK

### Trên Windows

* Tải **.NET 8.0 SDK**:
  [https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-8.0.420-windows-x64-installer](https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-8.0.420-windows-x64-installer)

* Nếu gặp lỗi thiếu **ASP.NET Core Runtime**, cài thêm:
  [https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-aspnetcore-8.0.25-windows-x86-installer](https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-aspnetcore-8.0.25-windows-x86-installer)

---

## 2. Khởi tạo SQL Server bằng Docker

### Trên Windows

```bash
docker run ^
  -e "ACCEPT_EULA=Y" ^
  -e "MSSQL_SA_PASSWORD=MatKhauBaoMat123!" ^
  -p 1433:1433 ^
  --name elearning_db ^
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### Trên macOS

```bash
docker run \
  -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=MatKhauBaoMat123!' \
  -p 1433:1433 \
  --name elearning_db \
  -d mcr.microsoft.com/azure-sql-edge
```



---

## 3. Chạy Backend

1. Khởi động container SQL Server trong Docker
2. Chạy các lệnh sau:

```bash
cd backend/project
dotnet tool install --global dotnet-ef
dotnet ef database update
dotnet run
```

---

## 4. Chạy Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## Hoàn tất
