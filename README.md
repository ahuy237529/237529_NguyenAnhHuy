# Hệ thống quản lý nhân sự

## Thông tin sinh viên

- Họ tên: Nguyễn Anh Huy
- MSSV: 237529
- Lớp: DH23TIN09

## Giới thiệu

Ứng dụng quản lý nhân sự cho phép xem danh sách, xem chi tiết,
thêm, tìm kiếm, cập nhật và xóa nhân viên.

## Công nghệ

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose
- Quản lý mã nguồn: Git, GitHub
- Đóng gói: Docker
- Lưu trữ image: Docker Hub
- Triển khai: Render

## Chạy Backend

Mở terminal tại thư mục backend:

    npm ci
    cp .env.example .env

Điền thông tin MongoDB vào .env, sau đó chạy:

    npm start

Backend: http://127.0.0.1:5001

## Chạy Frontend

Mở terminal khác tại thư mục frontend:

    npm ci

Tạo .env từ .env.example.

    npm run dev -- --port 5174 --strictPort

Frontend: http://localhost:5174

## Chạy bản Frontend production tại máy

    npm run build
    npm start

Frontend production: http://localhost:4173
## Build Frontend

    npm run build

## API

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | /health | Kiểm tra trạng thái |
| GET | /api/employees | Danh sách nhân viên |
| GET | /api/employees?search=An | Tìm kiếm |
| GET | /api/employees/:id | Chi tiết nhân viên |
| POST | /api/employees | Thêm nhân viên |
| PUT | /api/employees/:id | Cập nhật nhân viên |
| DELETE | /api/employees/:id | Xóa nhân viên |

## Các đường link nộp bài

| Tài nguyên | Đường link |
|---|---|
| GitHub | CHƯA CẬP NHẬT |
| Docker Hub Backend: https://hub.docker.com/r/ahuy237529/237529-backend
| Docker Hub Frontend: https://hub.docker.com/r/ahuy237529/237529-frontend
| Render App | CHƯA CẬP NHẬT |
| Render API https://two37529-backend-latest.onrender.com
| MongoDB Atlas | CHƯA CẬP NHẬT |

## Cấu hình

Backend sử dụng:
- MONGODB_URI
- PORT
- CLIENT_URL

Frontend production sử dụng:
- API_URL: URL gốc của Backend
- PORT

Không đưa thông tin xác thực vào GitHub.