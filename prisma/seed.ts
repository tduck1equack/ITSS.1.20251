import { PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

// Vietnamese names for realistic data
const firstNames = [
  "An",
  "Bình",
  "Cường",
  "Dũng",
  "Đạt",
  "Hà",
  "Hùng",
  "Khoa",
  "Linh",
  "Long",
  "Mai",
  "Nam",
  "Phong",
  "Quang",
  "Sơn",
  "Thảo",
  "Trang",
  "Tuấn",
  "Vân",
  "Yến",
];
const lastNames = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Huỳnh",
  "Phan",
  "Vũ",
  "Võ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
  "Lý",
];

function generateVietnameseName(): string {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middleName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `${lastName} ${middleName} ${firstName}`;
}

async function main() {
  console.log("🌱 Bắt đầu khởi tạo cơ sở dữ liệu...");

  // Clear existing data in correct order
  await prisma.postVote.deleteMany();
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
  await prisma.learningMaterial.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Đã xóa dữ liệu cũ");

  // ========================================
  // CREATE USERS
  // ========================================

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@hust.edu.vn",
      password: "Admin@2025",
      name: "Quản Trị Viên",
      role: "ADMINISTRATOR",
      bio: "Quản trị viên hệ thống Đại học Bách Khoa Hà Nội",
    },
  });

  console.log("✅ Đã tạo admin");

  // Teachers - 10 teachers
  const teacherData = [
    {
      name: "PGS.TS. Nguyễn Văn An",
      email: "nguyenvanan@hust.edu.vn",
      bio: "Giảng viên bộ môn Khoa học Máy tính. Chuyên môn: Cấu trúc dữ liệu và Giải thuật",
    },
    {
      name: "TS. Trần Thị Bình",
      email: "tranthibinh@hust.edu.vn",
      bio: "Giảng viên bộ môn Công nghệ Phần mềm. Chuyên môn: Phát triển ứng dụng Web",
    },
    {
      name: "ThS. Phạm Văn Cường",
      email: "phamvancuong@hust.edu.vn",
      bio: "Giảng viên Viện CNTT & TT. Chuyên môn: Lập trình hướng đối tượng",
    },
    {
      name: "TS. Lê Thị Dung",
      email: "lethidung@hust.edu.vn",
      bio: "Giảng viên bộ môn Trí tuệ nhân tạo. Chuyên môn: Machine Learning",
    },
    {
      name: "PGS.TS. Hoàng Minh Dũng",
      email: "hoangminhdung@hust.edu.vn",
      bio: "Phó trưởng Viện CNTT & TT. Chuyên môn: Hệ quản trị cơ sở dữ liệu",
    },
    {
      name: "ThS. Vũ Thị Hà",
      email: "vuthiha@hust.edu.vn",
      bio: "Giảng viên bộ môn Mạng máy tính. Chuyên môn: Bảo mật thông tin",
    },
    {
      name: "TS. Đỗ Văn Hùng",
      email: "dovanhung@hust.edu.vn",
      bio: "Giảng viên bộ môn Công nghệ Phần mềm. Chuyên môn: Kỹ nghệ phần mềm",
    },
    {
      name: "ThS. Ngô Thị Lan",
      email: "ngothilan@hust.edu.vn",
      bio: "Giảng viên Viện CNTT & TT. Chuyên môn: Thiết kế giao diện người dùng",
    },
    {
      name: "TS. Bùi Quang Minh",
      email: "buiquangminh@hust.edu.vn",
      bio: "Giảng viên bộ môn Khoa học Máy tính. Chuyên môn: Lý thuyết đồ thị",
    },
    {
      name: "ThS. Phan Thị Ngọc",
      email: "phanthingoc@hust.edu.vn",
      bio: "Giảng viên bộ môn Công nghệ Phần mềm. Chuyên môn: Phát triển ứng dụng Di động",
    },
  ];

  const teachers = await Promise.all(
    teacherData.map((t) =>
      prisma.user.create({
        data: {
          email: t.email,
          password: "Teacher@2025",
          name: t.name,
          role: "TEACHER",
          bio: t.bio,
        },
      })
    )
  );

  console.log("✅ Đã tạo 10 giảng viên");

  // Students - 1 demo student + 99 random students

  // Demo student (always created for demo purposes)
  const demoStudent = await prisma.user.create({
    data: {
      email: "nguyenminhan20210001@sis.hust.edu.vn",
      password: "Student@2025",
      name: "Nguyễn Minh An",
      role: "STUDENT",
      bio: "Sinh viên K66 - CNTT, MSSV: 20210001",
    },
  });

  console.log("✅ Đã tạo sinh viên demo");

  // Random students (99 students)
  const randomStudents = await Promise.all(
    Array.from({ length: 99 }, (_, i) => {
      const studentId = 20210002 + i; // Start from 20210002
      const name = generateVietnameseName();
      const nameSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "");
      const email = `${nameSlug}${studentId}@sis.hust.edu.vn`;

      return prisma.user.create({
        data: {
          email,
          password: "Student@2025",
          name,
          role: "STUDENT",
          bio: `Sinh viên K66 - CNTT, MSSV: ${studentId}`,
        },
      });
    })
  );

  // Combine demo student with random students
  const students = [demoStudent, ...randomStudents];

  console.log("✅ Đã tạo 100 sinh viên (1 demo + 99 ngẫu nhiên)");

  // ========================================
  // CREATE CLASSES - 7 classes
  // ========================================

  const classData = [
    {
      code: "IT3180",
      name: "Giới thiệu về Công nghệ Phần mềm",
      description:
        "Môn học cung cấp kiến thức cơ bản về quy trình phát triển phần mềm, các mô hình phát triển, quản lý dự án phần mềm.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [0, 1],
      studentCount: 35,
    },
    {
      code: "IT3190",
      name: "Phát triển ứng dụng Web",
      description:
        "Học phát triển ứng dụng web hiện đại với React, Node.js, và các công nghệ web mới nhất.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [1, 7],
      studentCount: 40,
    },
    {
      code: "IT4785",
      name: "Phát triển ứng dụng Di động",
      description:
        "Phát triển ứng dụng di động đa nền tảng với React Native và Flutter.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [9],
      studentCount: 30,
    },
    {
      code: "IT3100",
      name: "Lập trình Hướng đối tượng",
      description:
        "Các khái niệm cơ bản và nâng cao về lập trình hướng đối tượng với Java.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [2, 6],
      studentCount: 45,
    },
    {
      code: "IT3080",
      name: "Cơ sở Dữ liệu",
      description:
        "Thiết kế và quản trị cơ sở dữ liệu quan hệ, SQL, NoSQL, và các hệ CSDL hiện đại.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [4],
      studentCount: 38,
    },
    {
      code: "IT4895",
      name: "Machine Learning cơ bản",
      description:
        "Giới thiệu các thuật toán machine learning, deep learning và ứng dụng thực tế.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [3],
      studentCount: 25,
    },
    {
      code: "IT4210",
      name: "An toàn và Bảo mật Thông tin",
      description: "Các kỹ thuật mã hóa, bảo mật hệ thống, và an ninh mạng.",
      semester: "Học kỳ 2024.1",
      year: 2024,
      teacherIds: [5, 8],
      studentCount: 32,
    },
  ];

  const classes = [];
  let studentOffset = 0;

  for (const classInfo of classData) {
    const newClass = await prisma.class.create({
      data: {
        code: classInfo.code,
        name: classInfo.name,
        description: classInfo.description,
        semester: classInfo.semester,
        year: classInfo.year,
        status: "ACTIVE",
      },
    });

    // Add teachers
    await Promise.all(
      classInfo.teacherIds.map((teacherIndex) =>
        prisma.classTeacher.create({
          data: {
            classId: newClass.id,
            teacherId: teachers[teacherIndex].id,
            role: "TEACHER",
          },
        })
      )
    );

    // Enroll students (with overlap for realism)
    const classStudents = students.slice(
      studentOffset,
      studentOffset + classInfo.studentCount
    );
    await Promise.all(
      classStudents.map((student) =>
        prisma.classEnrollment.create({
          data: {
            classId: newClass.id,
            studentId: student.id,
            status: "ACTIVE",
          },
        })
      )
    );

    studentOffset += Math.floor(classInfo.studentCount / 2); // 50% overlap
    if (studentOffset + 45 > students.length) studentOffset = 0; // Reset if needed

    classes.push({ ...newClass, teacherIds: classInfo.teacherIds });
  }

  console.log("✅ Đã tạo 7 lớp học");

  // ========================================
  // CREATE POSTS AND COMMENTS
  // ========================================

  const postTitles = {
    ANNOUNCEMENT: [
      "Thông báo lịch học tuần tới",
      "Thông báo kiểm tra giữa kỳ",
      "Thay đổi lịch học trong tuần",
      "Thông báo nghỉ lễ",
    ],
    DISCUSSION: [
      "Thảo luận về bài giảng tuần này",
      "Hỏi đáp về project cuối kỳ",
      "Chia sẻ kinh nghiệm làm bài tập",
      "Câu hỏi về đề thi mẫu",
    ],
    MATERIAL: [
      "Tài liệu tham khảo bổ sung",
      "Slide bài giảng tuần này",
      "Video hướng dẫn",
      "Code mẫu cho bài tập",
    ],
  };

  const commentTemplates = [
    "Cảm ơn thầy/cô đã chia sẻ!",
    "Em có thắc mắc về phần này ạ.",
    "Tài liệu rất hữu ích!",
    "Em cần giải thích thêm về vấn đề này.",
    "Thầy/cô có thể giải thích rõ hơn không ạ?",
    "Em đã hiểu rồi, cảm ơn thầy/cô!",
    "Bài giảng rất hay và dễ hiểu.",
    "Em có một câu hỏi về slide số 15.",
    "Phần này khó quá, mọi người giúp em với!",
    "Mình đã làm được rồi, bạn cần giúp không?",
  ];

  for (const classItem of classes) {
    const classTeachers = await prisma.classTeacher.findMany({
      where: { classId: classItem.id },
      include: { teacher: true },
    });

    const classStudents = await prisma.classEnrollment.findMany({
      where: { classId: classItem.id },
      include: { student: true },
    });

    const numPosts = 3 + Math.floor(Math.random() * 3); // 3-5 posts

    for (let i = 0; i < numPosts; i++) {
      const postType = ["ANNOUNCEMENT", "DISCUSSION", "MATERIAL"][
        Math.floor(Math.random() * 3)
      ] as "ANNOUNCEMENT" | "DISCUSSION" | "MATERIAL";
      const isTeacherPost = postType === "ANNOUNCEMENT" || Math.random() > 0.4;

      const author = isTeacherPost
        ? classTeachers[Math.floor(Math.random() * classTeachers.length)]
            .teacher
        : classStudents[Math.floor(Math.random() * classStudents.length)]
            .student;

      const titleOptions = postTitles[postType];
      const title =
        titleOptions[Math.floor(Math.random() * titleOptions.length)];

      const post = await prisma.post.create({
        data: {
          classId: classItem.id,
          authorId: author.id,
          title,
          content: `${title}. Đây là nội dung chi tiết của bài viết này trong lớp ${
            classItem.name
          }. ${
            postType === "ANNOUNCEMENT"
              ? "Các bạn lưu ý thông tin này để không bỏ lỡ."
              : postType === "MATERIAL"
              ? "Các bạn có thể tải tài liệu và tham khảo."
              : "Mọi người cùng thảo luận và chia sẻ ý kiến nhé!"
          }`,
          type: postType,
          pinned: i === 0 && postType === "ANNOUNCEMENT",
        },
      });

      // Create 2-6 comments per post
      const numComments = 2 + Math.floor(Math.random() * 5);

      for (let j = 0; j < numComments; j++) {
        const isTeacherComment = Math.random() > 0.7;
        const commenter = isTeacherComment
          ? classTeachers[Math.floor(Math.random() * classTeachers.length)]
              .teacher
          : classStudents[Math.floor(Math.random() * classStudents.length)]
              .student;

        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: commenter.id,
            content:
              commentTemplates[
                Math.floor(Math.random() * commentTemplates.length)
              ],
          },
        });
      }

      // Add votes
      const numVoters = Math.floor(
        Math.random() * Math.min(15, classStudents.length)
      );
      const voters = [...classStudents]
        .sort(() => Math.random() - 0.5)
        .slice(0, numVoters);

      for (const voter of voters) {
        await prisma.postVote.create({
          data: {
            postId: post.id,
            userId: voter.student.id,
            voteType: Math.random() > 0.15 ? "UPVOTE" : "DOWNVOTE",
          },
        });
      }
    }
  }

  console.log("✅ Đã tạo bài viết và bình luận");

  // ========================================
  // CREATE ASSIGNMENTS
  // ========================================

  const assignmentTemplates = [
    "Bài tập về nhà",
    "Bài tập thực hành",
    "Project nhóm",
    "Bài tập lớn",
    "Tiểu luận",
  ];

  for (const classItem of classes) {
    const classTeachers = await prisma.classTeacher.findMany({
      where: { classId: classItem.id },
    });

    const teacher = classTeachers[0];
    const numAssignments = 2 + Math.floor(Math.random() * 2); // 2-3 assignments

    for (let i = 0; i < numAssignments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7 + i * 7);

      await prisma.assignment.create({
        data: {
          classId: classItem.id,
          createdById: teacher.teacherId,
          title: `${assignmentTemplates[i % assignmentTemplates.length]} ${
            i + 1
          } - ${classItem.name}`,
          description: `Mô tả chi tiết bài tập ${i + 1} cho môn ${
            classItem.name
          }. Sinh viên cần hoàn thành và nộp đúng hạn. Bài tập này chiếm ${
            10 + i * 5
          }% điểm tổng kết.`,
          dueDate,
          maxPoints: 10 + i * 5,
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log("✅ Đã tạo bài tập");

  console.log("\n✨ Hoàn thành khởi tạo cơ sở dữ liệu!");
  console.log("\n📊 Tóm tắt:");
  console.log(`- 1 admin`);
  console.log(`- 10 giảng viên`);
  console.log(`- 100 sinh viên`);
  console.log(`- 7 lớp học (mỗi lớp 25-45 sinh viên)`);
  console.log(`- Mỗi lớp có 3-5 bài viết`);
  console.log(`- Mỗi bài viết có 2-6 bình luận`);
  console.log(`- Mỗi lớp có 2-3 bài tập`);
  console.log("\n🔑 Thông tin đăng nhập:");
  console.log("────────────────────────────────");
  console.log("Admin: admin@hust.edu.vn / Admin@2025");
  console.log("Giảng viên: nguyenvanan@hust.edu.vn / Teacher@2025");
  console.log("Sinh viên: (tự động tạo) / Student@2025");
  console.log("────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
