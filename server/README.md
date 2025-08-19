# 🧑‍💼 Human Resources Management System (KLTN)

> Một hệ thống quản lý nhân sự hiện đại — được phát triển bằng **React + Node.js + Sequelize + MySQL**.

Dự án được thực hiện và tuỳ chỉnh bởi [thongtri](https://github.com/phanminhtri667), phục vụ cho mục đích nghiên cứu và triển khai trong đồ án tốt nghiệp Khoa Công Nghệ Thông Tin - IUH.

---

## 🚀 Công Nghệ Sử Dụng

- **Frontend**: React (TypeScript), Redux Toolkit, Formik, Yup, PrimeReact, Chart.js
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Realtime**: Socket.IO
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Migration & Seed**: Sequelize CLI

---

## 🛠️ Yêu Cầu Hệ Thống

- [Node.js](https://nodejs.org/) phiên bản 16 trở lên
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) phiên bản 8+

---

## ⚙️ Cài Đặt & Khởi Chạy

### 1. Clone source code

```bash
git clone https://github.com/phanminhtri667/kltn_HR_management
cd kltn_HR_management
```

### 2. Cài đặt dependencies

```bash
# Cài client
cd client
npm install

# Cài server
cd ../server
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` cho `client/` và `server/` dựa trên `.env.example`.  
Ví dụ `.env` cho server:

```env
PORT=8888
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=hr_management
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:4001
```

### 4. Tạo CSDL và chạy migrate + seed

```bash
cd server
npx sequelize db:migrate
npx sequelize db:seed:all
```

> 💡 Lúc này database `hr_management` cần được tạo sẵn trong MySQL.

### 5. Khởi chạy ứng dụng

```bash
# Chạy backend (port mặc định: 8888)
cd server
npm start

# Chạy frontend (port mặc định: 4001)
cd ../client
npm start
```

---

## 🔐 Tài Khoản Mặc Định

> Sau khi seed, bạn có thể đăng nhập bằng:

- Email: `admin@gmail.com`
- Mật khẩu: `123`

Hoặc bạn có thể tạo tài khoản mới tại:  
`POST http://localhost:8888/api/auth/register`

---

## 📚 Tài Liệu API

Bạn có thể dùng file Postman dưới đây để test API:  
**(Bạn nên thay link bằng file riêng của bạn nếu có)**

```text
https://orange-meadow-264896.postman.co/workspace/Team-Workspace...
```

---

## 🧩 Các Chức Năng Chính

- Đăng nhập / đăng ký (JWT auth)
- Quản lý nhân viên (thêm/sửa/xóa/tìm kiếm)
- Quản lý phòng ban, chức vụ, quyền
- Thống kê dashboard (biểu đồ Chart.js)
- Gửi và nhận thông báo realtime (Socket.IO)

---

## 🤝 Góp Ý & Báo Lỗi

Nếu bạn phát hiện lỗi hoặc có đề xuất cải tiến, hãy tạo một [issue](https://github.com/phanminhtri667/kltn_HR_management/issues) hoặc gửi pull request.

---

## 📄 Giấy Phép

Phân phối theo [MIT License](LICENSE).