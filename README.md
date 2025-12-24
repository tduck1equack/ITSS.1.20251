# Hệ thống Quản lý Lớp học

Ứng dụng web quản lý lớp học được xây dựng với Next.js, hỗ trợ giảng viên và sinh viên tương tác, quản lý bài tập, tài liệu học tập và nhiều tính năng khác.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau:

- **Git** - Hệ thống quản lý phiên bản
  - Tải về tại: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js** (phiên bản 18 trở lên) - Môi trường chạy JavaScript
  - Tải về tại: [https://nodejs.org/](https://nodejs.org/)

**Chọn một trong hai phương án setup Database:**

### Phương án A: Sử dụng Docker (Khuyến nghị)
- **Docker** - Platform để chạy containers
  - Tải về tại: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### Phương án B: Cài đặt PostgreSQL thủ công
- **PostgreSQL** (phiên bản 12 trở lên) - Hệ quản trị cơ sở dữ liệu
  - Tải về tại: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

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

Mở file `.env` và cập nhật các biến môi trường. File `.env.example` đã có sẵn cấu hình mẫu:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456789
POSTGRES_DB=course_management
POSTGRES_URL=postgresql://postgres:123456789@localhost:5432/course_management
```

> **Lưu ý:** Bạn có thể thay đổi username, password và tên database theo ý muốn, nhưng đảm bảo các giá trị này khớp nhau trong chuỗi `POSTGRES_URL`.

### 3. Khởi động Database

#### Phương án A: Sử dụng Docker (Khuyến nghị)

Docker giúp việc setup database trở nên đơn giản và nhất quán trên mọi hệ điều hành.

**Bước 1: Khởi động PostgreSQL container**

```bash
docker compose up -d
```

Lệnh này sẽ:
- Tải image PostgreSQL 17 (nếu chưa có)
- Tạo và chạy container với tên `lms_postgres`
- Cài đặt dependencies và khởi tạo database

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

### 5r compose down -v

# Khởi động lại container
docker restart lms_postgres
```

#### Phương án B: Cài đặt PostgreSQL thủ công

Nếu bạn đã cài đặt PostgreSQL trên máy:

**Bước 1: Tạo database**

Sử dụng pgAdmin hoặc chạy lệnh SQL:

```sql
CREATE DATABASE course_management;
```

**Bước 2: Cập nhật `.env`**

Đảm bảo chuỗi kết nối trong `.env` khớp với cấu hình PostgreSQL của bạn:

```env
POSTGRES_URL=postgresql://username:password@localhost:5432/database_name
```

**Giải thích chuỗi kết nối:**
- `username`: Tên người dùng PostgreSQL (mặc định: `postgres`)
- `password`: Mật khẩu bạn đã đặt khi cài PostgreSQL
- `localhost`: Địa chỉ máy chủ
- `5432`: Cổng mặc định của PostgreSQL
- `database_name`: Tên database bạn đã tạo

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
**Nếu dùng Docker:**
- Kiểm tra container đang chạy: `docker ps`
- Xem logs: `docker logs lms_postgres`
- Khởi động lại container: `docker restart lms_postgres`
- Kiểm tra biến môi trường trong `.env` khớp với `docker-compose.yml`

**Nếu dùng PostgreSQL thủ công:**
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

### Port 5432 (PostgreSQL) đã được sử dụng

Nếu bạn đã có PostgreSQL cài sẵn và đang chạy trên port 5432, bạn có hai lựa chọn:

1. **Dừng PostgreSQL local và dùng Docker:**
   ```bash
   # Windows (trong PowerShell as Admin)
   Stop-Service postgresql-x64-[version]
   
   # Linux/macOS
   sudo service postgresql stop
   ```

2. **Sử dụng PostgreSQL local thay vì Docker:**
   - Không chạy `docker compose up`
   - Tạo database thủ công theo hướng dẫn Phương án B components/            # React components
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
