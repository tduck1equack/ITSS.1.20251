import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu khởi tạo cơ sở dữ liệu...");

  // Xóa dữ liệu hiện có
  await prisma.notificationSubscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationCategory.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postAttachment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.assignmentSubmissionAttachment.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignmentAttachment.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Đã xóa dữ liệu cũ");

  // ========================================
  // TẠO NGƯỜI DÙNG
  // ========================================

  const admin = await prisma.user.create({
    data: {
      email: "quantri@hust.edu.vn",
      password: "Admin@2025", // Trong production, cần hash password!
      name: "Nguyễn Văn Quản",
      role: "ADMINISTRATOR",
      bio: "Quản trị viên hệ thống Đại học Bách Khoa Hà Nội",
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      email: "nguyenvana@hust.edu.vn",
      password: "Teacher@2025",
      name: "TS. Nguyễn Văn An",
      role: "TEACHER",
      bio: "Giảng viên Công nghệ Thông tin, Viện CNTT & TT. Chuyên môn: Lập trình hướng đối tượng, Cấu trúc dữ liệu",
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "tranthib@hust.edu.vn",
      password: "Teacher@2025",
      name: "PGS.TS. Trần Thị Bình",
      role: "TEACHER",
      bio: "Phó trưởng bộ môn Khoa học Máy tính. Chuyên môn: Cơ sở dữ liệu, Hệ quản trị CSDL",
    },
  });

  const teacher3 = await prisma.user.create({
    data: {
      email: "phamvanc@hust.edu.vn",
      password: "Teacher@2025",
      name: "ThS. Phạm Văn Cường",
      role: "TEACHER",
      bio: "Giảng viên Viện CNTT & TT. Chuyên môn: Phát triển ứng dụng Web, Lập trình Java",
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: "hoang.nm20210001@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Nguyễn Minh Hoàng",
        role: "STUDENT",
        bio: "Sinh viên K66 - Công nghệ Thông tin, MSSV: 20210001",
      },
    }),
    prisma.user.create({
      data: {
        email: "linh.pt20210002@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Phạm Thùy Linh",
        role: "STUDENT",
        bio: "Sinh viên K66 - Khoa học Máy tính, MSSV: 20210002",
      },
    }),
    prisma.user.create({
      data: {
        email: "tuan.lv20210003@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Lê Văn Tuấn",
        role: "STUDENT",
        bio: "Sinh viên K66 - Công nghệ Thông tin, MSSV: 20210003",
      },
    }),
    prisma.user.create({
      data: {
        email: "mai.nth20210004@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Nguyễn Thị Hương Mai",
        role: "STUDENT",
        bio: "Sinh viên K66 - Hệ thống Thông tin, MSSV: 20210004",
      },
    }),
    prisma.user.create({
      data: {
        email: "duc.hv20210005@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Hoàng Văn Đức",
        role: "STUDENT",
        bio: "Sinh viên K66 - Công nghệ Thông tin, MSSV: 20210005",
      },
    }),
    prisma.user.create({
      data: {
        email: "anh.dt20210006@sis.hust.edu.vn",
        password: "Student@2025",
        name: "Đỗ Thu Anh",
        role: "STUDENT",
        bio: "Sinh viên K66 - Khoa học Máy tính, MSSV: 20210006",
      },
    }),
  ]);

  console.log("✅ Đã tạo người dùng:", {
    admin: admin.email,
    teachers: [teacher1.email, teacher2.email, teacher3.email],
    students: students.map((s) => s.email),
  });

  // ========================================
  // TẠO CÁC LỚP HỌC
  // ========================================

  const it3080 = await prisma.class.create({
    data: {
      code: "IT3080",
      name: "Nhập môn Lập trình",
      description:
        "Môn học cung cấp kiến thức cơ bản về lập trình máy tính, sử dụng ngôn ngữ C/C++. Sinh viên sẽ học về biến, kiểu dữ liệu, cấu trúc điều khiển, hàm, mảng và con trỏ.",
      teacherId: teacher1.id,
      status: "ACTIVE",
      semester: "Học kỳ 20241",
      year: 2024,
    },
  });

  const it3100 = await prisma.class.create({
    data: {
      code: "IT3100",
      name: "Lập trình Hướng đối tượng",
      description:
        "Môn học về lập trình hướng đối tượng với Java. Nội dung bao gồm: Lớp và đối tượng, kế thừa, đa hình, trừu tượng hóa, interface, exception handling.",
      teacherId: teacher1.id,
      status: "ACTIVE",
      semester: "Học kỳ 20241",
      year: 2024,
    },
  });

  const it3150 = await prisma.class.create({
    data: {
      code: "IT3150",
      name: "Cơ sở Dữ liệu",
      description:
        "Môn học về hệ quản trị cơ sở dữ liệu quan hệ. Sinh viên học thiết kế CSDL, ngôn ngữ SQL, chuẩn hóa, transaction và concurrency control.",
      teacherId: teacher2.id,
      status: "ACTIVE",
      semester: "Học kỳ 20241",
      year: 2024,
    },
  });

  const it4409 = await prisma.class.create({
    data: {
      code: "IT4409",
      name: "Phát triển ứng dụng Web",
      description:
        "Môn học về phát triển ứng dụng web hiện đại. Nội dung: HTML/CSS, JavaScript, React, Node.js, RESTful API, Database Integration.",
      teacherId: teacher3.id,
      status: "ACTIVE",
      semester: "Học kỳ 20241",
      year: 2024,
    },
  });

  const it3320 = await prisma.class.create({
    data: {
      code: "IT3320",
      name: "Cấu trúc Dữ liệu và Giải thuật",
      description:
        "Môn học về các cấu trúc dữ liệu cơ bản (danh sách, ngăn xếp, hàng đợi, cây, đồ thị) và các thuật toán (sắp xếp, tìm kiếm, đệ quy).",
      teacherId: teacher1.id,
      status: "ACTIVE",
      semester: "Học kỳ 20241",
      year: 2024,
    },
  });

  console.log("✅ Đã tạo các lớp học:", [
    it3080.code,
    it3100.code,
    it3150.code,
    it4409.code,
    it3320.code,
  ]);

  // ========================================
  // GHI DANH SINH VIÊN
  // ========================================

  await prisma.classEnrollment.createMany({
    data: [
      // IT3080 - Nhập môn Lập trình
      { classId: it3080.id, studentId: students[0].id },
      { classId: it3080.id, studentId: students[1].id },
      { classId: it3080.id, studentId: students[2].id },
      { classId: it3080.id, studentId: students[3].id },

      // IT3100 - Lập trình Hướng đối tượng
      { classId: it3100.id, studentId: students[0].id },
      { classId: it3100.id, studentId: students[2].id },
      { classId: it3100.id, studentId: students[4].id },

      // IT3150 - Cơ sở Dữ liệu
      { classId: it3150.id, studentId: students[1].id },
      { classId: it3150.id, studentId: students[3].id },
      { classId: it3150.id, studentId: students[5].id },

      // IT4409 - Phát triển ứng dụng Web
      { classId: it4409.id, studentId: students[0].id },
      { classId: it4409.id, studentId: students[1].id },
      { classId: it4409.id, studentId: students[4].id },
      { classId: it4409.id, studentId: students[5].id },

      // IT3320 - Cấu trúc Dữ liệu và Giải thuật
      { classId: it3320.id, studentId: students[2].id },
      { classId: it3320.id, studentId: students[3].id },
      { classId: it3320.id, studentId: students[4].id },
    ],
  });

  console.log("✅ Đã ghi danh sinh viên vào các lớp");

  // ========================================
  // TẠO BÀI TẬP
  // ========================================

  const assignment1 = await prisma.assignment.create({
    data: {
      classId: it3080.id,
      title: "Bài tập 1: Chương trình Hello World",
      description:
        'Viết chương trình đầu tiên in ra màn hình dòng chữ "Hello, HUST!". Yêu cầu: Sử dụng ngôn ngữ C/C++, compile và chạy thành công, nộp file source code (.c hoặc .cpp)',
      dueDate: new Date("2024-12-20T23:59:59Z"),
      maxPoints: 100,
      status: "PUBLISHED",
      createdById: teacher1.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      classId: it3100.id,
      title: "Bài tập 2: Xây dựng lớp Sinh viên",
      description:
        "Xây dựng lớp Student với các thuộc tính: mã sinh viên, họ tên, ngày sinh, điểm trung bình. Viết các phương thức getter/setter, constructor, và phương thức hiển thị thông tin.",
      dueDate: new Date("2024-12-25T23:59:59Z"),
      maxPoints: 100,
      status: "PUBLISHED",
      createdById: teacher1.id,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      classId: it3150.id,
      title: "Bài tập 3: Thiết kế CSDL Quản lý Thư viện",
      description:
        "Thiết kế cơ sở dữ liệu cho hệ thống quản lý thư viện trường học. Yêu cầu: Vẽ sơ đồ ER, chuyển sang quan hệ, chuẩn hóa về 3NF, viết các câu truy vấn SQL mẫu.",
      dueDate: new Date("2024-12-30T23:59:59Z"),
      maxPoints: 150,
      status: "PUBLISHED",
      createdById: teacher2.id,
    },
  });

  const assignment4 = await prisma.assignment.create({
    data: {
      classId: it4409.id,
      title: "Bài tập 4: Xây dựng trang web cá nhân",
      description:
        "Xây dựng trang web cá nhân giới thiệu bản thân. Yêu cầu: Sử dụng HTML5, CSS3, responsive design, có ít nhất 3 trang (Trang chủ, Giới thiệu, Liên hệ).",
      dueDate: new Date("2025-01-05T23:59:59Z"),
      maxPoints: 100,
      status: "PUBLISHED",
      createdById: teacher3.id,
    },
  });

  const assignment5 = await prisma.assignment.create({
    data: {
      classId: it3320.id,
      title: "Bài tập 5: Cài đặt thuật toán sắp xếp",
      description:
        "Cài đặt và so sánh 3 thuật toán sắp xếp: Quick Sort, Merge Sort, Heap Sort. Yêu cầu: Đo thời gian chạy với các bộ dữ liệu khác nhau, phân tích độ phức tạp.",
      dueDate: new Date("2025-01-10T23:59:59Z"),
      maxPoints: 150,
      status: "PUBLISHED",
      createdById: teacher1.id,
    },
  });

  console.log("✅ Đã tạo bài tập");

  // ========================================
  // TẠO BÀI NỘP
  // ========================================

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students[0].id,
      content:
        '#include <stdio.h>\nint main() {\n    printf("Hello, HUST!\\n");\n    return 0;\n}',
      submittedAt: new Date("2024-12-15T14:30:00Z"),
      status: "GRADED",
      grade: 95,
      feedback: "Bài làm tốt! Code sạch và chạy đúng.",
      gradedAt: new Date("2024-12-16T10:00:00Z"),
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students[1].id,
      content:
        '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, HUST!" << endl;\n    return 0;\n}',
      submittedAt: new Date("2024-12-18T20:15:00Z"),
      status: "SUBMITTED",
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: students[0].id,
      content:
        "public class Student {\n    private String id;\n    private String name;\n    // ... constructor and methods\n}",
      submittedAt: new Date("2024-12-24T18:00:00Z"),
      status: "SUBMITTED",
    },
  });

  console.log("✅ Đã tạo bài nộp");

  // ========================================
  // TẠO BÀI ĐĂNG
  // ========================================

  const post1 = await prisma.post.create({
    data: {
      classId: it3080.id,
      authorId: teacher1.id,
      title: "Chào mừng các bạn đến với môn Nhập môn Lập trình!",
      content:
        "Xin chào các bạn sinh viên K66! Chào mừng các bạn đến với môn Nhập môn Lập trình IT3080. Trong học kỳ này, chúng ta sẽ cùng nhau tìm hiểu về lập trình cơ bản với ngôn ngữ C/C++. Hãy chuẩn bị tinh thần học tập nghiêm túc và nhiệt huyết nhé!",
      type: "ANNOUNCEMENT",
      pinned: true,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      classId: it3080.id,
      authorId: teacher1.id,
      title: "Tài liệu học tập tuần 1",
      content:
        "Các bạn tải tài liệu bài giảng tuần 1 tại đây. Nội dung: Giới thiệu về lập trình, biến và kiểu dữ liệu cơ bản trong C.",
      type: "MATERIAL",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      classId: it3150.id,
      authorId: teacher2.id,
      title: "Thông báo: Lịch thi giữa kỳ",
      content:
        "Kỳ thi giữa kỳ môn Cơ sở Dữ liệu sẽ được tổ chức vào ngày 15/01/2025, thời gian 90 phút. Hình thức thi: Tự luận và trắc nghiệm trên máy. Phạm vi: Chương 1 đến Chương 4.",
      type: "ANNOUNCEMENT",
      pinned: true,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      classId: it4409.id,
      authorId: students[0].id,
      title: "Hỏi về cách deploy ứng dụng React",
      content:
        "Chào thầy và các bạn, em muốn hỏi về cách deploy ứng dụng React lên Vercel. Các bạn có thể chia sẻ kinh nghiệm không ạ?",
      type: "DISCUSSION",
    },
  });

  console.log("✅ Đã tạo bài đăng");

  // ========================================
  // TẠO BÌNH LUẬN
  // ========================================

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: teacher3.id,
      content:
        "Chào em! Deploy lên Vercel rất đơn giản. Em chỉ cần push code lên GitHub, sau đó import project từ GitHub vào Vercel là xong. Thầy sẽ làm demo trong buổi học tới nhé!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: students[1].id,
      content:
        "Mình đã deploy thành công rồi. Vercel rất nhanh và miễn phí cho dự án cá nhân. Bạn có thể tham khảo docs của Vercel nhé!",
    },
  });

  console.log("✅ Đã tạo bình luận");

  // ========================================
  // TẠO ĐIỂM DANH
  // ========================================

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.attendance.createMany({
    data: [
      // Hôm nay
      {
        classId: it3080.id,
        studentId: students[0].id,
        date: today,
        status: "PRESENT",
      },
      {
        classId: it3080.id,
        studentId: students[1].id,
        date: today,
        status: "PRESENT",
      },
      {
        classId: it3080.id,
        studentId: students[2].id,
        date: today,
        status: "LATE",
        notes: "Đến muộn 10 phút",
      },
      {
        classId: it3080.id,
        studentId: students[3].id,
        date: today,
        status: "ABSENT",
      },

      // Hôm qua
      {
        classId: it3080.id,
        studentId: students[0].id,
        date: yesterday,
        status: "PRESENT",
      },
      {
        classId: it3080.id,
        studentId: students[1].id,
        date: yesterday,
        status: "ABSENT",
        notes: "Xin phép nghỉ ốm",
      },
      {
        classId: it3080.id,
        studentId: students[2].id,
        date: yesterday,
        status: "PRESENT",
      },
      {
        classId: it3080.id,
        studentId: students[3].id,
        date: yesterday,
        status: "PRESENT",
      },

      // 2 ngày trước
      {
        classId: it3100.id,
        studentId: students[0].id,
        date: twoDaysAgo,
        status: "PRESENT",
      },
      {
        classId: it3100.id,
        studentId: students[2].id,
        date: twoDaysAgo,
        status: "PRESENT",
      },
      {
        classId: it3100.id,
        studentId: students[4].id,
        date: twoDaysAgo,
        status: "EXCUSED",
        notes: "Nghỉ có phép",
      },
    ],
  });

  console.log("✅ Đã tạo điểm danh");

  // ========================================
  // TẠO DANH MỤC THÔNG BÁO
  // ========================================

  const notifCategories = await Promise.all([
    prisma.notificationCategory.create({
      data: {
        code: "ASSIGNMENT_CREATED",
        name: "Bài tập mới",
        description: "Thông báo khi có bài tập mới được đăng",
        icon: "assignment",
        color: "#3B82F6",
        priority: "NORMAL",
      },
    }),
    prisma.notificationCategory.create({
      data: {
        code: "ASSIGNMENT_GRADED",
        name: "Bài tập đã chấm",
        description: "Thông báo khi bài tập được chấm điểm",
        icon: "grade",
        color: "#10B981",
        priority: "NORMAL",
      },
    }),
    prisma.notificationCategory.create({
      data: {
        code: "POST_CREATED",
        name: "Bài đăng mới",
        description: "Thông báo khi có bài đăng mới trong lớp",
        icon: "post",
        color: "#8B5CF6",
        priority: "LOW",
      },
    }),
    prisma.notificationCategory.create({
      data: {
        code: "COMMENT_ADDED",
        name: "Bình luận mới",
        description: "Thông báo khi có người bình luận bài đăng của bạn",
        icon: "comment",
        color: "#F59E0B",
        priority: "LOW",
      },
    }),
    prisma.notificationCategory.create({
      data: {
        code: "CLASS_ANNOUNCEMENT",
        name: "Thông báo lớp học",
        description: "Thông báo quan trọng từ giảng viên",
        icon: "announcement",
        color: "#EF4444",
        priority: "HIGH",
      },
    }),
    prisma.notificationCategory.create({
      data: {
        code: "SYSTEM_MAINTENANCE",
        name: "Bảo trì hệ thống",
        description: "Thông báo về bảo trì và nâng cấp hệ thống",
        icon: "settings",
        color: "#6B7280",
        priority: "URGENT",
      },
    }),
  ]);

  console.log("✅ Đã tạo danh mục thông báo");

  // ========================================
  // TẠO THÔNG BÁO
  // ========================================

  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        categoryId: notifCategories[1].id, // ASSIGNMENT_GRADED
        title: "Bài tập đã được chấm điểm",
        message:
          'Bài nộp của bạn cho "Bài tập 1: Chương trình Hello World" đã được chấm. Điểm: 95/100',
        link: `/assignments/${assignment1.id}`,
        priority: "NORMAL",
        metadata: {
          assignmentId: assignment1.id,
          grade: 95,
          maxPoints: 100,
        },
      },
      {
        userId: students[0].id,
        categoryId: notifCategories[3].id, // COMMENT_ADDED
        title: "Bình luận mới",
        message:
          "ThS. Phạm Văn Cường đã trả lời câu hỏi của bạn về deploy ứng dụng React",
        link: `/posts/${post4.id}`,
        priority: "LOW",
      },
      {
        userId: students[1].id,
        categoryId: notifCategories[0].id, // ASSIGNMENT_CREATED
        title: "Bài tập mới",
        message:
          'Bài tập mới "Bài tập 1: Chương trình Hello World" đã được đăng trong lớp IT3080',
        link: `/assignments/${assignment1.id}`,
        priority: "NORMAL",
        metadata: {
          assignmentId: assignment1.id,
          classId: it3080.id,
          dueDate: assignment1.dueDate.toISOString(),
        },
      },
      {
        userId: students[2].id,
        categoryId: notifCategories[4].id, // CLASS_ANNOUNCEMENT
        title: "Thông báo quan trọng",
        message: "Thông báo: Lịch thi giữa kỳ môn Cơ sở Dữ liệu",
        link: `/posts/${post3.id}`,
        priority: "HIGH",
      },
    ],
  });

  console.log("✅ Đã tạo thông báo");

  console.log("\n🎉 Khởi tạo cơ sở dữ liệu thành công!");
  console.log("\n📝 Thông tin đăng nhập demo:");
  console.log("─────────────────────────────────────────");
  console.log("👤 Quản trị viên:");
  console.log("   Email: quantri@hust.edu.vn");
  console.log("   Mật khẩu: Admin@2025");
  console.log("\n👨‍🏫 Giảng viên:");
  console.log("   Email: nguyenvana@hust.edu.vn");
  console.log("   Mật khẩu: Teacher@2025");
  console.log("\n👨‍🎓 Sinh viên:");
  console.log("   Email: hoang.nm20210001@sis.hust.edu.vn");
  console.log("   Mật khẩu: Student@2025");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi khởi tạo cơ sở dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
