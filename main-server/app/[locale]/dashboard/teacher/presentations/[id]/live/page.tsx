"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";
import { io, Socket } from "socket.io-client";
import { Presentation, CheckpointData } from "@/types/presentation";
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  XCircle,
  PlayCircle,
  LinkIcon,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useToast } from "@/contexts/ToastContext";

const PDFMainViewer = dynamic(
  () => import("@/components/features/interactive-slides/PDFMainViewer"),
  { ssr: false, loading: () => <div>Loading PDF...</div> }
);

export default function TeacherLivePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const presentationId = params?.id as string;
  const sessionId = searchParams.get("sessionId");
  const { user } = useAuth();
  const toast = useToast();

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currPage, setCurrPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(
    null
  );

  const [liveStats, setLiveStats] = useState<Record<string, number>>({});
  const [totalResponses, setTotalResponses] = useState(0);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const deadlineRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      alert("Thiếu Session ID");
      router.back();
      return;
    }
    axios.get(`/api/presentations/${presentationId}`).then((res) => {
      setPresentation(res.data);
    });
  }, [presentationId, sessionId, router]);

  useEffect(() => {
    if (!user || !sessionId) return;

    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Teacher connected to socket");
      setIsConnected(true);
      socket.emit("JOIN_SESSION", {
        sessionId,
        userId: user.id,
        role: "TEACHER",
      });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("LIVE_STAT_UPDATE", ({ answerData }) => {
      setLiveStats((prev) => {
        const newState = { ...prev };
        const answers = Array.isArray(answerData) ? answerData : [answerData];
        answers.forEach((ans: string) => {
          newState[ans] = (newState[ans] || 0) + 1;
        });
        return newState;
      });
      setTotalResponses((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, user]);

  // SỬA LẠI: Tách hàm tính deadline ra khỏi render cycle
  const calculateDeadline = useCallback((duration: number): number => {
    // Hàm này chỉ chạy khi được gọi, không nằm trong render
    return Date.now() + duration * 1000;
  }, []);

  const stopCheckpoint = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("TEACHER_STOP_CHECKPOINT", { sessionId });
    setActiveCheckpointId(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(0);
    deadlineRef.current = 0;
  }, [sessionId]);

  const handleActivateCheckpoint = useCallback(
    (checkpoint: CheckpointData) => {
      if (!socketRef.current || !sessionId) return;

      // Reset states
      setLiveStats({});
      setTotalResponses(0);
      setActiveCheckpointId(checkpoint.id);

      // Tính toán deadline - SỬA: Gọi hàm calculateDeadline trong callback
      const duration = checkpoint.timeLimit || 30;
      const deadline = calculateDeadline(duration);

      deadlineRef.current = deadline;
      setTimeLeft(duration);

      // Gửi socket event
      socketRef.current.emit("TEACHER_TRIGGER_CHECKPOINT", {
        sessionId,
        checkpointData: checkpoint,
        deadline: deadline,
      });

      // Clear timer cũ nếu có
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.max(
          0,
          Math.ceil((deadlineRef.current - now) / 1000)
        );

        if (secondsLeft <= 0) {
          stopCheckpoint();
          return;
        }
        setTimeLeft(secondsLeft);
      }, 500);
    },
    [calculateDeadline, stopCheckpoint, sessionId]
  );

  const handleManualStop = useCallback(() => {
    stopCheckpoint();
  }, [stopCheckpoint]);

  const handleCopyStudentLink = useCallback(() => {
    if (!sessionId) return;
    const origin = window.location.origin;
    const currentLocale = window.location.pathname.split("/")[1] || "vi";
    const studentLink = `${origin}/${currentLocale}/dashboard/student/presentations/live?sessionId=${sessionId}`;
    navigator.clipboard.writeText(studentLink);
    if (toast) {
      toast.success("Đã sao chép", "Link tham gia đã được copy vào clipboard!");
    }
  }, [sessionId, toast]);

  const handleEndSession = useCallback(async () => {
    if (!confirm("Bạn có chắc muốn kết thúc phiên học này?")) return;
    try {
      await axios.patch(`/api/sessions/${sessionId}/end`);
      const locale = window.location.pathname.split("/")[1] || "vi";
      router.push(
        `/${locale}/dashboard/teacher/presentations/report/${sessionId}`
      );
    } catch (e) {
      console.error(e);
    }
  }, [sessionId, router]);

  const currentCheckpoints =
    presentation?.checkpoints?.filter((cp) => cp.pageNumber === currPage) || [];

  const chartData = Object.entries(liveStats)
    .map(([key, value]) => ({ name: key, value: value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!presentation) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* TOPBAR */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            Thoát
          </button>
          <button
            onClick={handleCopyStudentLink}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition font-medium ml-4"
          >
            <LinkIcon size={16} /> Copy Link SV
          </button>
          <button
            onClick={handleEndSession}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition font-medium"
          >
            Kết thúc phiên
          </button>
          <div className="h-6 w-px bg-gray-600 mx-2"></div>
          <h1 className="font-bold truncate max-w-[200px]">
            {presentation.name}
          </h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isConnected
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isConnected ? "● Online" : "● Offline"}
          </span>
        </div>

        <div className="flex items-center gap-4 bg-gray-700 px-3 py-1.5 rounded-lg">
          <button
            onClick={() => setCurrPage((p) => Math.max(1, p - 1))}
            disabled={currPage <= 1}
            className="hover:text-blue-400 disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          <span className="min-w-20 text-center font-mono">
            {currPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrPage((p) => Math.min(totalPages, p + 1))}
            disabled={currPage >= totalPages}
            className="hover:text-blue-400 disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-gray-900 relative flex flex-col">
          <div className="flex-1 overflow-auto flex justify-center p-4">
            <div className="max-w-5xl w-full h-full">
              <PDFMainViewer
                fileUrl={presentation.fileUrl}
                currPage={currPage}
                onLoadSuccess={setTotalPages}
              />
            </div>
          </div>
        </div>

        <div className="w-[350px] bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-bold flex items-center gap-2">
              <Radio className="text-red-500 animate-pulse" size={18} /> Live
              Control
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Trang {currPage} có {currentCheckpoints.length} câu hỏi
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentCheckpoints.map((cp) => {
              const isActive = activeCheckpointId === cp.id;
              return (
                <div
                  key={cp.id}
                  className={`border rounded-lg p-4 ${
                    isActive
                      ? "bg-gray-700 border-green-500 ring-1 ring-green-500"
                      : "bg-gray-750 border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-600 text-xs px-2 py-0.5 rounded text-white">
                      Quiz
                    </span>
                    {isActive && (
                      <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                        ● Đang chạy
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm mb-3 line-clamp-2">
                    {cp.question}
                  </p>

                  {isActive ? (
                    <div className="space-y-3">
                      <div className="bg-gray-900 rounded p-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>
                            <strong>{totalResponses}</strong> trả lời
                          </span>
                          <span
                            className={`font-mono font-bold flex items-center gap-1 ${
                              timeLeft <= 5
                                ? "text-red-500 animate-pulse"
                                : "text-green-400"
                            }`}
                          >
                            <Clock size={12} /> {timeLeft}s
                          </span>
                        </div>
                        <div className="h-32 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <XAxis
                                dataKey="name"
                                stroke="#888"
                                fontSize={10}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#333",
                                  border: "none",
                                }}
                                itemStyle={{ color: "#fff" }}
                              />
                              <Bar dataKey="value" fill="#3b82f6">
                                {chartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      cp.correctAnswer.includes(entry.name)
                                        ? "#22c55e"
                                        : "#3b82f6"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <button
                        onClick={handleManualStop}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition"
                      >
                        <XCircle size={16} /> Dừng ngay ({timeLeft}s)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleActivateCheckpoint(cp)}
                      disabled={activeCheckpointId !== null}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded text-sm transition"
                    >
                      <PlayCircle size={16} /> Phát ({cp.timeLimit || 30}s)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
