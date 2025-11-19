# Hệ thống Quản lý Lớp học

Ứng dụng web quản lý lớp học được xây dựng với Next.js, hỗ trợ giảng viên và sinh viên tương tác, quản lý bài tập, tài liệu học tập và nhiều tính năng khác.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau:

- **Git** - Hệ thống quản lý phiên bản
  - Tải về tại: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **PostgreSQL** (phiên bản 12 trở lên) - Hệ quản trị cơ sở dữ liệu
  - Tải về tại: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- **Node.js** (phiên bản 18 trở lên) - Môi trường chạy JavaScript
  - Tải về tại: [https://nodejs.org/](https://nodejs.org/)

## Hướng dẫn cài đặt

### 1. Clone repository

Mở terminal/command prompt và chạy lệnh sau để clone dự án về máy:

```bash
git clone https://github.com/tduck1equack/ITSS.1.20251.git
cd ITSS.1.20251
```

### 2. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```bash
# Trên Linux/macOS
cp .env.example .env

# Trên Windows
copy .env.example .env
```

Sau đó mở file `.env` và cập nhật chuỗi kết nối cơ sở dữ liệu:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

**Giải thích chuỗi kết nối PostgreSQL:**

- `username`: Tên người dùng PostgreSQL của bạn (mặc định thường là `postgres`)
- `password`: Mật khẩu bạn đã đặt khi cài PostgreSQL
- `localhost`: Địa chỉ máy chủ (localhost nếu chạy trên máy local)
- `5432`: Cổng mặc định của PostgreSQL
- `database_name`: Tên cơ sở dữ liệu bạn muốn sử dụng (ví dụ: `itss_db`)

**Ví dụ:**

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/itss_db
```

> **Lưu ý:** Bạn cần tạo database trong PostgreSQL trước. Có thể sử dụng pgAdmin hoặc chạy lệnh SQL:
>
> ```sql
> CREATE DATABASE itss_db;
> ```

### 3. Cài đặt dependencies và khởi tạo database

Chạy các lệnh sau theo thứ tự:

```bash
# Cài đặt các package cần thiết
npm i

# Đẩy schema database lên PostgreSQL
npm run db:push

# Seed dữ liệu mẫu vào database
npm run db:seed
```

**Giải thích:**

- `npm i` - Cài đặt tất cả các package được liệt kê trong `package.json`
- `npm run db:push` - Tạo các bảng trong database theo schema Prisma
- `npm run db:seed` - Thêm dữ liệu mẫu (10 giảng viên, 100 sinh viên, 7 lớp học)

### 4. Chạy ứng dụng

Khởi động server development:

```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Tài khoản demo

Sau khi seed database, bạn có thể đăng nhập bằng các tài khoản sau:

### Quản trị viên

- **Email:** admin@hust.edu.vn
- **Mật khẩu:** Admin@2025

### Giảng viên

- **Email:** nguyenvanan@hust.edu.vn
- **Mật khẩu:** Teacher@2025

### Sinh viên

- **Email:** nguyenminhan20210001@sis.hust.edu.vn
- **Mật khẩu:** Student@2025

## Tính năng chính

### Dành cho Giảng viên

- ✅ Tạo và quản lý lớp học
- ✅ Cấu hình thông tin lớp và thêm giảng viên khác
- ✅ Tạo và quản lý nhóm sinh viên (ngẫu nhiên hoặc thủ công)
- ✅ Đăng bài viết, thông báo trong lớp
- ✅ Xem danh sách sinh viên
- ✅ Tham gia giảng dạy các lớp có sẵn
- 🚧 Giao bài tập (đang phát triển)
- 🚧 Tải lên tài liệu học tập (đang phát triển)
- 🚧 Điểm danh (đang phát triển)

### Dành cho Sinh viên

- ✅ Xem các lớp đã đăng ký
- ✅ Tham gia lớp học mới
- ✅ Xem bài viết và bình luận
- ✅ Vote bài viết
- ✅ Xem nhóm của mình
- 🚧 Nộp bài tập (đang phát triển)
- 🚧 Tải tài liệu (đang phát triển)

### Dành cho Quản trị viên

- ✅ Quản lý người dùng (giảng viên, sinh viên)
- ✅ Quản lý lớp học
- ✅ Xem thống kê hệ thống

## Công nghệ sử dụng

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI Framework:** Radix UI Themes
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL với Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** Custom auth với localStorage

## Cấu trúc thư mục

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Login page
├── components/            # React components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── prisma/               # Prisma schema & migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── public/               # Static files
```

## Scripts hữu ích

```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Chạy production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Reset database (xóa toàn bộ dữ liệu)
npm run db:reset

# Xem database với Prisma Studio
npm run db:studio
```

## Xử lý sự cố

### Lỗi kết nối database

- Kiểm tra PostgreSQL đã chạy chưa
- Xác nhận thông tin trong `.env` đúng
- Đảm bảo database đã được tạo

### Lỗi khi seed

- Chạy `npm run db:push` lại
- Nếu vẫn lỗi, thử `npm run db:reset` rồi `npm run db:seed`

### Port 3000 đã được sử dụng

Chạy với port khác:

```bash
PORT=3001 npm run dev
```

## Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo pull request hoặc mở issue nếu bạn gặp vấn đề.

## Giấy phép

Dự án này được phát triển cho mục đích học tập tại Đại học Bách Khoa Hà Nội.
