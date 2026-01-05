/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";
import { io, Socket } from "socket.io-client";
import { CheckpointData } from "@/types/presentation";
import { X, Send, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const PDFMainViewer = dynamic(
  () => import("@/components/features/interactive-slides/PDFMainViewer"),
  { ssr: false, loading: () => <div>Loading PDF...</div> }
);

export default function StudentLivePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const { user } = useAuth();
  const toast = useToast();

  const [sessionData, setSessionData] = useState<any>(null);
  const [currPage, setCurrPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const socketRef = useRef<Socket | null>(null);

  const [activeCheckpoint, setActiveCheckpoint] =
    useState<CheckpointData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State thời gian
  const [timeLeft, setTimeLeft] = useState(0);
  const [deadline, setDeadline] = useState<number>(0);

  // 1. Load Session Info
  useEffect(() => {
    if (!sessionId) return;
    axios
      .get(`/api/sessions/${sessionId}`)
      .then((res) => setSessionData(res.data))
      .catch(() => {
        alert("Phiên học không tồn tại hoặc đã kết thúc");
        router.back();
      });
  }, [sessionId, router]);

  // 2. Logic Đếm Ngược (Timer Loop)
  useEffect(() => {
    // Chỉ chạy khi có deadline hợp lệ
    if (!activeCheckpoint || deadline === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.ceil((deadline - now) / 1000);

      if (secondsLeft <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
        return;
      }
      setTimeLeft(secondsLeft);
    }, 200); // Update mỗi 200ms để UI mượt mà

    return () => clearInterval(timer);
  }, [activeCheckpoint, deadline]);

  // 3. Socket Connection
  useEffect(() => {
    if (!user || !sessionId) return;
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Student connected");
      socket.emit("JOIN_SESSION", {
        sessionId,
        userId: user.id,
        role: "STUDENT",
      });
    });

    // A. Nhận lệnh MỞ câu hỏi
    socket.on("NEW_CHECKPOINT_STARTED", (data: any) => {
      const checkpoint = data.checkpoint || data;
      // Nếu server chưa gửi deadline, fallback về logic cũ (cộng duration vào giờ hiện tại)
      const dl =
        data.deadline || Date.now() + (checkpoint.timeLimit || 30) * 1000;

      setActiveCheckpoint(checkpoint);
      setDeadline(dl);

      // Tính toán ngay lập tức để tránh delay UI
      const initialSeconds = Math.ceil((dl - Date.now()) / 1000);
      setTimeLeft(initialSeconds > 0 ? initialSeconds : 0);

      setCurrPage(checkpoint.pageNumber);
      setSelectedAnswers([]);
      setIsSubmitted(false);
      toast.info("Câu hỏi mới!", `Vui lòng xem trang ${checkpoint.pageNumber}`);
    });

    // B. Sync (Vào muộn / F5)
    socket.on("SYNC_CURRENT_CHECKPOINT", (data: any) => {
      const checkpoint = data.checkpoint || data;
      const dl =
        data.deadline || Date.now() + (checkpoint.timeLimit || 30) * 1000;

      setActiveCheckpoint(checkpoint);
      setDeadline(dl);

      const initialSeconds = Math.ceil((dl - Date.now()) / 1000);
      setTimeLeft(initialSeconds > 0 ? initialSeconds : 0);
    });

    // C. Dừng câu hỏi
    socket.on("CHECKPOINT_STOPPED", () => {
      setActiveCheckpoint(null);
      setDeadline(0);
      toast.info("Hết giờ", "Câu hỏi đã đóng.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, user, toast]);

  const toggleAnswer = (optionId: string) => {
    if (isSubmitted || timeLeft === 0) return;
    setSelectedAnswers((prev) => {
      if (prev.includes(optionId)) return prev.filter((id) => id !== optionId);
      return [...prev, optionId];
    });
  };

  const handleSubmit = async () => {
    if (!socketRef.current || !activeCheckpoint || selectedAnswers.length === 0)
      return;

    try {
      // Gửi socket để vẽ biểu đồ
      socketRef.current.emit("STUDENT_SUBMIT_ANSWER", {
        sessionId,
        checkpointId: activeCheckpoint.id,
        answerData: selectedAnswers,
      });

      // Gọi API lưu DB
      await axios.post(`/api/sessions/${sessionId}/submit`, {
        userId: user?.id,
        checkpointId: activeCheckpoint.id,
        answerData: selectedAnswers,
      });

      setIsSubmitted(true);
      toast.success("Đã nộp", "Câu trả lời của bạn đã được ghi nhận.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi", "Không thể lưu kết quả vào hệ thống.");
    }
  };

  if (!sessionData)
    return <div className="p-10 text-center">Đang vào lớp học...</div>;

  const progressPercent = activeCheckpoint
    ? (timeLeft / activeCheckpoint.timeLimit) * 100
    : 0;

  const progressColor =
    progressPercent > 50
      ? "bg-green-500"
      : progressPercent > 20
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-white border-b flex items-center px-4 justify-between shrink-0 z-10">
        <h1 className="font-bold text-gray-800 truncate max-w-[200px] md:max-w-md">
          {sessionData.presentation.name}
        </h1>

        <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border">
          <button
            onClick={() => setCurrPage((p) => Math.max(1, p - 1))}
            disabled={currPage <= 1}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {currPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrPage((p) => Math.min(totalPages, p + 1))}
            disabled={currPage >= totalPages}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* PDF View */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-auto flex justify-center p-4">
          <div className="max-w-4xl w-full">
            <PDFMainViewer
              fileUrl={sessionData.presentation.fileUrl}
              currPage={currPage}
              onLoadSuccess={(total) => setTotalPages(total)}
            />
          </div>
        </div>

        {/* Popup Câu hỏi */}
        {activeCheckpoint && (
          <div className="absolute top-4 right-4 w-[350px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-right duration-300 max-h-[calc(100vh-100px)] overflow-hidden">
            <div className="h-1.5 w-full bg-gray-100">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`font-mono font-bold text-lg ${
                    timeLeft <= 5
                      ? "text-red-600 animate-pulse"
                      : "text-blue-800"
                  }`}
                >
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  còn lại
                </span>
              </div>
              <button
                onClick={() => setActiveCheckpoint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar">
              <p className="font-medium text-gray-800 mb-4 text-lg leading-snug">
                {activeCheckpoint.question}
              </p>

              <div className="space-y-2">
                {activeCheckpoint.options.map((opt: any, idx: number) => {
                  const optId = String.fromCharCode(65 + idx);
                  const isSelected = selectedAnswers.includes(optId);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleAnswer(optId)}
                      className={`
                          p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 select-none
                          ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]"
                              : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                          }
                          ${
                            isSubmitted || timeLeft === 0
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                      `}
                    >
                      <span
                        className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border shrink-0
                            ${
                              isSelected
                                ? "bg-white text-blue-600 border-white"
                                : "bg-gray-100 text-gray-500 border-gray-300"
                            }
                        `}
                      >
                        {optId}
                      </span>
                      <span className="font-medium text-sm">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              {timeLeft === 0 && !isSubmitted ? (
                <div className="text-center text-red-500 font-bold py-2 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center gap-2">
                  <AlertCircle size={18} /> Hết thời gian nộp bài
                </div>
              ) : isSubmitted ? (
                <div className="text-center text-green-600 font-bold py-2 bg-green-100 rounded-lg">
                  ✓ Đã nộp bài thành công
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswers.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Send size={18} /> Gửi câu trả lời
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
