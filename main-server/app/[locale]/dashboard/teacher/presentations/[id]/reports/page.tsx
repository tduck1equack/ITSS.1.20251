/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Users, FileBarChart, Clock } from "lucide-react";
import Link from "next/link";

export default function PresentationReportsPage() {
  const params = useParams();
  const presentationId = params?.id as string;
  const locale = params?.locale || "vi";

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/presentations/${presentationId}/sessions`)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [presentationId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/${locale}/dashboard/teacher/presentations`}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch sử phiên học
          </h1>
          <p className="text-gray-500 text-sm">
            Xem lại báo cáo các lớp đã dạy.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed text-gray-500">
          Chưa có phiên học nào được tạo.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border rounded-lg p-5 hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  {session.sessionName}
                  {session.isActive ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                      ● Đang diễn ra
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                      Đã kết thúc
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(session.startedAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(session.startedAt).toLocaleTimeString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {session._count?.responses || 0} tương tác
                  </span>
                </div>
              </div>

              <Link
                href={`/${locale}/dashboard/teacher/presentations/report/${session.id}`}
                className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-md hover:bg-indigo-100 font-medium transition"
              >
                <FileBarChart size={18} />
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
