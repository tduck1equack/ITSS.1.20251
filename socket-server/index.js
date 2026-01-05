const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log("🚀 Socket Server is running on port 3001");

// Lưu trạng thái phòng học
// Structure: { activeCheckpoint: object, deadline: number }
const sessions = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Tham gia
  socket.on("JOIN_SESSION", ({ sessionId, userId, role }) => {
    socket.join(sessionId);
    console.log(`User ${userId} (${role}) joined session ${sessionId}`);

    // Nếu đang có câu hỏi, gửi ngay cho người mới vào (kèm deadline để tính giờ còn lại)
    if (sessions[sessionId]?.activeCheckpoint) {
      socket.emit("SYNC_CURRENT_CHECKPOINT", {
        checkpoint: sessions[sessionId].activeCheckpoint,
        deadline: sessions[sessionId].deadline, // Gửi deadline đã lưu
      });
    }
  });

  // 2. Giáo viên MỞ câu hỏi (Nhận thêm deadline)
  socket.on(
    "TEACHER_TRIGGER_CHECKPOINT",
    ({ sessionId, checkpointData, deadline }) => {
      console.log(
        `Session ${sessionId}: Start CP ${checkpointData.id} until ${deadline}`
      );

      // Lưu lại cả câu hỏi và thời gian kết thúc
      if (!sessions[sessionId]) sessions[sessionId] = {};
      sessions[sessionId].activeCheckpoint = checkpointData;
      sessions[sessionId].deadline = deadline;

      // Gửi cho sinh viên: Cả data và deadline
      socket.to(sessionId).emit("NEW_CHECKPOINT_STARTED", {
        checkpoint: checkpointData,
        deadline: deadline,
      });
    }
  );

  // 3. Giáo viên DỪNG câu hỏi
  socket.on("TEACHER_STOP_CHECKPOINT", ({ sessionId }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].activeCheckpoint = null;
      sessions[sessionId].deadline = null;
    }
    socket.to(sessionId).emit("CHECKPOINT_STOPPED");
  });

  // 4. Sinh viên nộp bài
  socket.on(
    "STUDENT_SUBMIT_ANSWER",
    ({ sessionId, checkpointId, answerData }) => {
      socket.to(sessionId).emit("LIVE_STAT_UPDATE", {
        checkpointId,
        answerData,
      });
    }
  );

  socket.on("disconnect", () => {
    // console.log("User disconnected");
  });
});
