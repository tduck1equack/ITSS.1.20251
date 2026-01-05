/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
// Import Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

export default function SessionReportPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const locale = params?.locale || "vi";

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/sessions/${sessionId}/report`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  if (isLoading)
    return <div className="p-10 text-center">Đang tải báo cáo...</div>;
  if (!data) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  // 1. Nhóm dữ liệu theo Checkpoint (Câu hỏi)
  const checkpointsMap = new Map();

  // Khởi tạo map từ danh sách câu hỏi gốc (để câu nào ko ai trả lời vẫn hiện)
  data.presentation.checkpoints.forEach((cp: any) => {
    checkpointsMap.set(cp.id, {
      info: cp,
      responses: [],
      stats: { A: 0, B: 0, C: 0, D: 0 }, // Init stats
    });
  });

  // Fill dữ liệu trả lời vào
  data.responses.forEach((res: any) => {
    const cpGroup = checkpointsMap.get(res.checkpointId);
    if (cpGroup) {
      // Tính đúng sai
      const userAns = (res.answerData as string[]).sort().join(",");
      const correctAns = (cpGroup.info.correctAnswer as string[])
        .sort()
        .join(",");
      const isCorrect = userAns === correctAns;

      cpGroup.responses.push({ ...res, isCorrect });

      // Update stats cho biểu đồ
      (res.answerData as string[]).forEach((ans) => {
        if (cpGroup.stats[ans] !== undefined) {
          cpGroup.stats[ans]++;
        } else {
          cpGroup.stats[ans] = 1; // Trường hợp option khác A,B,C,D
        }
      });
    }
  });

  const reportItems = Array.from(checkpointsMap.values()).sort(
    (a, b) => a.info.pageNumber - b.info.pageNumber
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header & Tổng quan (Giữ nguyên code cũ phần Cards) */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/dashboard/teacher/presentations/${data.presentationId}/reports`}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">
          Báo cáo chi tiết: {data.sessionName}
        </h1>
      </div>

      {/* DANH SÁCH CHI TIẾT TỪNG CÂU HỎI */}
      <div className="space-y-10">
        {reportItems.map((item: any, index) => {
          // Chuẩn bị data cho Chart
          const chartData = Object.entries(item.stats).map(([name, value]) => ({
            name,
            value,
          }));

          return (
            <div
              key={item.info.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              {/* Header câu hỏi */}
              <div className="p-5 border-b bg-gray-50 flex justify-between items-start">
                <div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    Câu hỏi {index + 1} (Trang {item.info.pageNumber})
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 mt-2">
                    {item.info.question}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Tham gia</div>
                  <div className="text-xl font-bold">
                    {item.responses.length} SV
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* CỘT TRÁI: BIỂU ĐỒ */}{" "}
                <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r bg-gray-50/50 flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-gray-500 mb-4 text-center">
                    Phân phối đáp án
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" barSize={40}>
                          {chartData.map((entry: any, idx: number) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={
                                item.info.correctAnswer.includes(entry.name)
                                  ? "#22c55e"
                                  : "#94a3b8"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-400">
                    (Cột màu xanh lá là đáp án đúng)
                  </div>
                </div>
                {/* CỘT PHẢI: DANH SÁCH SINH VIÊN */}
                <div className="w-full md:w-2/3">
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 sticky top-0">
                        <tr>
                          <th className="px-6 py-3">Sinh viên</th>
                          <th className="px-6 py-3">Đáp án chọn</th>
                          <th className="px-6 py-3">Kết quả</th>
                          <th className="px-6 py-3">Thời gian nộp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {item.responses.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-6 text-center text-gray-400"
                            >
                              Chưa có câu trả lời
                            </td>
                          </tr>
                        ) : (
                          item.responses.map((res: any) => (
                            <tr key={res.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3 font-medium">
                                {res.user.name}{" "}
                                <span className="text-gray-400 font-normal text-xs">
                                  ({res.user.studentCode})
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex gap-1">
                                  {(res.answerData as string[]).map((ans) => (
                                    <span
                                      key={ans}
                                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        item.info.correctAnswer.includes(ans)
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {ans}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                {res.isCorrect ? (
                                  <span className="text-green-600 flex items-center gap-1 font-medium">
                                    <CheckCircle size={14} /> Đúng
                                  </span>
                                ) : (
                                  <span className="text-red-500 flex items-center gap-1 font-medium">
                                    <XCircle size={14} /> Sai
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-gray-400 text-xs">
                                {new Date(res.submittedAt).toLocaleTimeString(
                                  "vi-VN"
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
