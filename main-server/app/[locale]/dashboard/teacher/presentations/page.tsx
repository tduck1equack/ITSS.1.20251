"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Presentation } from "@/types/presentation";
import CreatePresentationDialog from "@/components/features/interactive-slides/CreatePresentationDialog";
import { Plus, FileText, Edit, Play, BarChart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StartSessionDialog from "@/components/features/interactive-slides/StartSessionDialog";

export default function PresentationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // feature follow dialog and presentation
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);

  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const fetchPresentations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`/api/presentations/teacher/${user.id}`);
      setPresentations(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPresentations();
    }
  }, [isAuthenticated, fetchPresentations]);

  if (authLoading) {
    return <div className="p-6">Đang xác thực...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bài giảng tương tác
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý và trình chiếu các slide có câu hỏi tương tác.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Tạo mới
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : presentations.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Chưa có bài giảng nào
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((p) => (
            <div key={p.id} className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold">{p.name}</h3>

              <div className="flex gap-3 mt-4">
                <Link
                  href={`/${locale}/dashboard/teacher/presentations/${p.id}/edit`}
                  className="flex items-center gap-1 text-blue-600 text-sm"
                >
                  <Edit size={16} /> Biên tập câu hỏi
                </Link>

                <Link
                  href={`/${locale}/dashboard/teacher/presentations/${p.id}/reports`}
                  className="flex items-center gap-1 text-purple-600 text-sm"
                  title="Xem lịch sử báo cáo"
                >
                  <BarChart size={16} /> Thống kê
                </Link>

                <button
                  onClick={() => {
                    setSelectedPresentation(p);
                    setIsStartDialogOpen(true);
                  }}
                  className="flex items-center gap-1 text-green-600 text-sm"
                >
                  <Play size={16} /> Trình chiếu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePresentationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchPresentations}
      />

      {selectedPresentation && (
        <StartSessionDialog
          open={isStartDialogOpen}
          onClose={() => {
            setIsStartDialogOpen(false);
            setSelectedPresentation(null);
          }}
          presentationId={selectedPresentation.id}
          presentationName={selectedPresentation.name}
        />
      )}
    </div>
  );
}
