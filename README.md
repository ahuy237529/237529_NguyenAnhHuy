# Hệ thống quản lý nhân sự

## Thông tin sinh viên

- Họ tên: Nguyễn Anh Huy
- MSSV: 237529
- Lớp: DH23TIN09

## Giới thiệu

Ứng dụng quản lý nhân sự cho phép xem danh sách, xem chi tiết,
thêm, tìm kiếm, cập nhật và xóa hồ sơ nhân viên.

Frontend giao tiếp với Backend thông qua REST API.
Dữ liệu được lưu trên MongoDB Atlas.

## Công nghệ sử dụng

- Frontend: React, Vite.
- Backend: Node.js, Express.
- Cơ sở dữ liệu: MongoDB Atlas, Mongoose.
- Quản lý mã nguồn: Git, GitHub.
- Đóng gói ứng dụng: Docker.
- Lưu trữ image: Docker Hub.
- Triển khai: Render.

## Chạy Backend tại máy

Mở Git Bash tại thư mục backend:

```bash
npm ci
cp .env.example .env
```

Điền cấu hình thật trong file .env:

- PORT: 5001.
- MONGODB_URI: URI kết nối database 237529_NguyenAnhHuy.
- CLIENT_URL: http://localhost:5174,http://localhost:4173.

Khởi động:

```bash
npm start
```

Backend: http://127.0.0.1:5001

Health: http://127.0.0.1:5001/health

Danh sách nhân viên: http://127.0.0.1:5001/api/employees

Giữ terminal Backend chạy trong lúc sử dụng Frontend.

## Chạy Frontend tại máy

Mở Git Bash khác tại thư mục frontend:

```bash
npm ci
cp .env.example .env
```

Trong frontend/.env, cấu hình:

```env
VITE_API_URL=http://127.0.0.1:5001
```

Khởi động:

```bash
npm run dev -- --port 5174 --strictPort
```

Frontend: http://localhost:5174

## Chạy Frontend production tại máy

Trong thư mục frontend:

```bash
npm run build
npm start
```

Frontend production: http://localhost:4173

Backend phải đang chạy tại http://127.0.0.1:5001.

## REST API

Tham số :id hỗ trợ MongoDB _id hoặc mã nhân viên, ví dụ NV001.

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | /health | Kiểm tra Backend và kết nối database |
| GET | /api/employees | Lấy danh sách nhân viên |
| GET | /api/employees?search=An | Tìm theo mã nhân viên hoặc họ tên |
| GET | /api/employees/:id | Xem chi tiết nhân viên |
| POST | /api/employees | Thêm nhân viên |
| PUT | /api/employees/:id | Cập nhật nhân viên |
| DELETE | /api/employees/:id | Xóa nhân viên |

Các trường bắt buộc: employeeId, fullName, email.
Mã nhân viên không được trùng lặp.

## Docker

Chạy các lệnh build tại thư mục gốc dự án:

```bash
docker build -t ahuy237529/237529-backend:latest ./backend
docker build -t ahuy237529/237529-frontend:latest ./frontend
```

Chạy Backend container:

```bash
docker run -d --name hr237529-backend --env-file ./backend/.env -e PORT=5000 -p 5002:5000 ahuy237529/237529-backend:latest
```

Chạy Frontend container:

```bash
docker run -d --name hr237529-frontend -e PORT=4173 -e API_URL=http://127.0.0.1:5002 -p 4173:4173 ahuy237529/237529-frontend:latest
```

Frontend Docker: http://localhost:4173

Backend Docker: http://127.0.0.1:5002/api/employees

Các lệnh docker run trên dùng khi chưa có container cùng tên.
Cổng 4173 và 5002 trên máy phải chưa được ứng dụng khác sử dụng.

## Cấu hình triển khai Render

### Backend

- NODE_ENV: production.
- PORT: 10000.
- MONGODB_URI: cấu hình riêng trong Environment trên Render.
- CLIENT_URL: https://web-237529.onrender.com.
- Health Check Path: /health.

### Frontend

- NODE_ENV: production.
- PORT: 10000.
- API_URL: https://two37529-backend-latest.onrender.com.
- Health Check Path: /health.

API_URL là URL gốc Backend, không thêm /api/employees.

## Các đường link nộp bài

| Trường thông tin | Đường link |
|---|---|
| Link_GitHub | https://github.com/ahuy237529/237529_NguyenAnhHuy |
| Link_Docker_Backend | https://hub.docker.com/r/ahuy237529/237529-backend |
| Link_Docker_Frontend | https://hub.docker.com/r/ahuy237529/237529-frontend |
| Link_Render_App | https://web-237529.onrender.com |
| Link_Render_API | https://two37529-backend-latest.onrender.com/api/employees |
| Link_Data_MongoDB | mongodb+srv://ahuy237529_db_user:ahuy237529@clusterahuy237529.92ios4a.mongodb.net/237529_NguyenAnhHuy?retryWrites=true&w=majority |

## Bảo vệ thông tin xác thực

- Không commit file .env chứa thông tin thật.
- File .env.example chỉ chứa cấu hình mẫu.
- Không đưa mật khẩu, token hoặc URI chứa mật khẩu vào README.
- Thông tin kết nối production được lưu bằng biến môi trường trên Render.