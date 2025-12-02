"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
  Container,
  Heading,
  Text,
  Card,
  Flex,
  Button,
  Tabs,
  Badge,
  Avatar,
  Dialog,
  TextField,
  TextArea,
  Select,
} from "@radix-ui/themes";
import {
  FiBook,
  FiUsers,
  FiFileText,
  FiFile,
  FiCheckCircle,
  FiPlus,
  FiMessageSquare,
  FiThumbsUp,
  FiCalendar,
  FiLogOut,
  FiUserPlus,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import ClassHeader from "@/components/ui/ClassHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PostCard } from "@/components/ui/PostCard";
import { GroupManagementDialog } from "@/components/ui/GroupManagementDialog";
import { MembersManagementDialog } from "@/components/ui/MembersManagementDialog";
import { ClassSettingsDialog } from "@/components/ui/ClassSettingsDialog";
import { CreatePostDialog } from "@/components/ui/CreatePostDialog";
import { teacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  year: number | null;
  createdBy: string | null;
  teachers: Array<{
    teacher: { id: string; name: string; avatar: string | null };
  }>;
  enrollments: Array<{
    student: {
      id: string;
      name: string;
      email: string;
      studentCode?: string | null;
      avatar: string | null;
    };
  }>;
  groups?: Array<{
    id: string;
    name: string;
    members: Array<{
      student: {
        id: string;
        name: string;
        email: string;
        studentCode?: string | null;
        avatar: string | null;
      };
    }>;
  }>;
  posts: Array<any>;
  assignments: Array<any>;
  learningMaterials: Array<any>;
}

export default function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/classes/${id}`);

      // Fetch groups separately
      const { data: groupsData } = await axios.get(`/api/classes/${id}/groups`);

      setClassData({ ...data.class, groups: groupsData.groups });
      // Check if current user is teaching this class
      const teaching = data.class.teachers.some(
        (t: any) => t.teacher.id === user?.id
      );
      setIsTeaching(teaching);
      // Check if current user is the creator
      setIsCreator(data.class.createdBy === user?.id);
    } catch (error) {
      console.error("Failed to fetch class:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push("/login");
    } else if (!isLoading && user && !classData) {
      fetchClassData();
    }
  }, [user, isLoading]);

  const handleCreatePost = async (formData: {
    title: string;
    content: string;
    type: string;
  }) => {
    try {
      await axios.post(`/api/classes/${id}/posts`, {
        ...formData,
        authorId: user?.id,
      });
      setIsPostDialogOpen(false);
      toast.success("Đã đăng bài viết", "Bài viết đã được tạo thành công");
      fetchClassData();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Lỗi", "Không thể tạo bài viết");
      throw error;
    }
  };

  const handleVote = async (
    postId: string,
    voteType: "UPVOTE" | "DOWNVOTE"
  ) => {
    try {
      await axios.post(`/api/posts/${postId}/vote`, {
        userId: user?.id,
        voteType,
      });
      fetchClassData();
      toast.success(
        "Đã bình chọn",
        `Đã ${voteType === "UPVOTE" ? "thích" : "không thích"} bài viết`
      );
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error("Lỗi", "Không thể bình chọn bài viết");
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!content?.trim()) return;

    try {
      await axios.post(`/api/posts/${postId}/comments`, {
        authorId: user?.id,
        content,
      });
      fetchClassData();
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Failed to comment:", error);
      toast.error("Không thể thêm bình luận");
    }
  };

  const handleLeave = async () => {
    try {
      await axios.delete(`/api/classes/${id}/teachers?teacherId=${user?.id}`);
      setIsLeaveDialogOpen(false);
      toast.info("Đã rời khỏi lớp", "Bạn có thể tham gia lại bất cứ lúc nào");
      router.push("/dashboard/teacher/classes");
    } catch (error) {
      console.error("Failed to leave class:", error);
      toast.error("Lỗi", "Không thể rời khỏi lớp");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/classes/${id}`);
      setIsLeaveDialogOpen(false);
      toast.success("Đã xóa lớp học", "Lớp học đã được xóa thành công");
      router.push("/dashboard/teacher/classes");
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error("Lỗi", "Không thể xóa lớp học");
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/api/classes/${id}/teachers`, {
        teacherId: user?.id,
        role: "TEACHER",
      });
      toast.success("Đã tham gia lớp", "Bạn đã tham gia giảng dạy lớp học này");
      fetchClassData();
    } catch (error) {
      console.error("Failed to join class:", error);
      toast.error("Lỗi", "Không thể tham gia lớp");
    }
  };

  const handleSaveGroups = async (
    groups: Array<{ name: string; memberIds: string[] }>
  ) => {
    if (!classData) return;

    try {
      // Calculate changes
      const oldGroupNames = (classData.groups || []).map((g) => g.name);
      const newGroupNames = groups.map((g) => g.name);

      const addedGroups = newGroupNames.filter(
        (name) => !oldGroupNames.includes(name)
      );
      const deletedGroups = oldGroupNames.filter(
        (name) => !newGroupNames.includes(name)
      );
      const keptGroups = newGroupNames.filter((name) =>
        oldGroupNames.includes(name)
      );

      await axios.post(`/api/classes/${id}/groups`, {
        groups,
        createdById: user?.id,
      });

      // Create detailed message
      let message = "";
      if (addedGroups.length > 0) {
        message += `Đã thêm: ${addedGroups.join(", ")}. `;
      }
      if (deletedGroups.length > 0) {
        message += `Đã xóa: ${deletedGroups.join(", ")}. `;
      }
      if (addedGroups.length === 0 && deletedGroups.length === 0) {
        message = `Đã cập nhật ${keptGroups.length} nhóm`;
      }

      toast.success("Đã lưu cấu hình nhóm", message.trim());
      fetchClassData();
    } catch (error) {
      console.error("Failed to save groups:", error);
      toast.error("Lỗi", "Không thể lưu cấu hình nhóm");
      throw error;
    }
  };

  const handleSaveMembers = async (changes: {
    addedTeachers: string[];
    removedTeachers: string[];
    addedStudents: string[];
    removedStudents: string[];
  }) => {
    try {
      // Process teacher changes
      for (const teacherId of changes.addedTeachers) {
        await axios.post(`/api/classes/${id}/teachers`, {
          teacherId,
          role: "TEACHER",
        });
      }

      for (const teacherId of changes.removedTeachers) {
        await axios.delete(
          `/api/classes/${id}/teachers?teacherId=${teacherId}`
        );
      }

      // Process student changes
      for (const studentId of changes.addedStudents) {
        await axios.post(`/api/classes/${id}/enroll`, {
          studentId,
        });
      }

      for (const studentId of changes.removedStudents) {
        await axios.delete(`/api/classes/${id}/enroll?studentId=${studentId}`);
      }

      // Create detailed message
      let message = "";
      if (changes.addedTeachers.length > 0) {
        message += `Đã thêm ${changes.addedTeachers.length} giảng viên. `;
      }
      if (changes.removedTeachers.length > 0) {
        message += `Đã xóa ${changes.removedTeachers.length} giảng viên. `;
      }
      if (changes.addedStudents.length > 0) {
        message += `Đã thêm ${changes.addedStudents.length} sinh viên. `;
      }
      if (changes.removedStudents.length > 0) {
        message += `Đã xóa ${changes.removedStudents.length} sinh viên. `;
      }

      toast.success("Đã lưu thành viên lớp", message.trim());
      fetchClassData();
    } catch (error) {
      console.error("Failed to save members:", error);
      toast.error("Lỗi", "Không thể lưu thay đổi thành viên");
      throw error;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={teacherTabs} />
        <Container size="4" className="py-8">
          <Text size="5" className="text-gray-600">
            Đang tải...
          </Text>
        </Container>
      </div>
    );
  }

  if (!user || !classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={teacherTabs} />

      <Container size="4" className="py-8">
        <Flex direction="column" gap="6">
          {/* Class Header */}
          <ClassHeader
            classData={classData}
            isEnrolled={isTeaching}
            enrolledLabel="Đang giảng dạy"
            onBack={() => router.push("/dashboard/teacher/classes")}
            role="teacher"
            actionButton={
              isTeaching ? (
                <Flex gap="2">
                  <Button
                    variant="soft"
                    onClick={() => setIsSettingsDialogOpen(true)}
                  >
                    <FiSettings size={16} />
                    Cấu hình lớp
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setIsMembersDialogOpen(true)}
                  >
                    <FiUsers size={16} />
                    Quản lý thành viên
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setIsGroupDialogOpen(true)}
                  >
                    <FiSettings size={16} />
                    {classData.groups && classData.groups.length > 0
                      ? "Cấu hình nhóm"
                      : "Tạo nhóm"}
                  </Button>
                  <ConfirmDialog
                    open={isLeaveDialogOpen}
                    onOpenChange={setIsLeaveDialogOpen}
                    title={
                      isCreator
                        ? "Xác nhận xóa lớp học"
                        : "Xác nhận rời khỏi lớp giảng dạy"
                    }
                    description={
                      isCreator
                        ? "Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác."
                        : "Bạn có chắc chắn muốn rời khỏi giảng dạy lớp học này? Bạn có thể tham gia lại sau."
                    }
                    onConfirm={isCreator ? handleDelete : handleLeave}
                    trigger={
                      <Button color="red" variant="soft">
                        {isCreator ? (
                          <>
                            <FiTrash2 size={16} /> Xóa lớp
                          </>
                        ) : (
                          <>
                            <FiLogOut size={16} /> Rời khỏi
                          </>
                        )}
                      </Button>
                    }
                  />
                </Flex>
              ) : (
                <Button
                  className="bg-mint-500 hover:bg-mint-600"
                  onClick={handleJoin}
                >
                  <FiUserPlus size={16} /> Tham gia giảng dạy
                </Button>
              )
            }
          />

          {/* Class Settings Dialog */}
          {isTeaching && (
            <ClassSettingsDialog
              open={isSettingsDialogOpen}
              onOpenChange={setIsSettingsDialogOpen}
              classData={classData}
              onUpdate={fetchClassData}
            />
          )}

          {/* Group Management Dialog */}
          <GroupManagementDialog
            open={isGroupDialogOpen}
            onOpenChange={setIsGroupDialogOpen}
            students={classData.enrollments.map((e) => e.student)}
            existingGroups={classData.groups}
            onSave={handleSaveGroups}
          />

          {/* Tabs Content */}
          <Tabs.Root defaultValue={isTeaching ? "posts" : "students"}>
            <Tabs.List>
              {isTeaching && (
                <>
                  <Tabs.Trigger value="posts">Bài viết</Tabs.Trigger>
                  <Tabs.Trigger value="assignments">Bài tập</Tabs.Trigger>
                  <Tabs.Trigger value="materials">Tài liệu</Tabs.Trigger>
                </>
              )}
              <Tabs.Trigger value="students">Sinh viên</Tabs.Trigger>
              {isTeaching && (
                <Tabs.Trigger value="attendance">Điểm danh</Tabs.Trigger>
              )}
            </Tabs.List>

            {/* Posts Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="posts">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">Bài viết trong lớp</Heading>
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={() => setIsPostDialogOpen(true)}
                    >
                      <FiPlus size={16} /> Tạo bài viết
                    </Button>
                  </Flex>

                  <CreatePostDialog
                    open={isPostDialogOpen}
                    onOpenChange={setIsPostDialogOpen}
                    onSubmit={handleCreatePost}
                  />

                  {classData.posts && classData.posts.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {classData.posts.map((post) => {
                        const userVote = post.votes?.find(
                          (v: any) => v.userId === user.id
                        );
                        return (
                          <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user.id}
                            userVote={userVote}
                            onVote={handleVote}
                            onComment={handleComment}
                          />
                        );
                      })}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiMessageSquare
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        Chưa có bài viết nào
                      </Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Assignments Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="assignments">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">Bài tập</Heading>
                    <Button className="bg-mint-500 hover:bg-mint-600">
                      <FiPlus size={16} /> Tạo bài tập
                    </Button>
                  </Flex>
                  <Card className="bg-white p-8 text-center">
                    <FiFileText
                      className="mx-auto text-gray-400 mb-4"
                      size={48}
                    />
                    <Text className="text-gray-600">
                      Chức năng đang phát triển
                    </Text>
                  </Card>
                </Flex>
              </Tabs.Content>
            )}

            {/* Materials Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="materials">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">Tài liệu học tập</Heading>
                    <Button className="bg-mint-500 hover:bg-mint-600">
                      <FiPlus size={16} /> Tải lên tài liệu
                    </Button>
                  </Flex>
                  <Card className="bg-white p-8 text-center">
                    <FiFile className="mx-auto text-gray-400 mb-4" size={48} />
                    <Text className="text-gray-600">
                      Chức năng đang phát triển
                    </Text>
                  </Card>
                </Flex>
              </Tabs.Content>
            )}

            {/* Students Tab */}
            <Tabs.Content value="students">
              <Flex direction="column" gap="4" className="mt-6">
                <Heading size="6">
                  Danh sách sinh viên ({classData.enrollments.length})
                </Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classData.enrollments.map((enrollment) => (
                    <Card key={enrollment.student.id} className="bg-white p-4">
                      <Flex align="center" gap="3">
                        <Avatar
                          size="3"
                          src={enrollment.student.avatar || undefined}
                          fallback={enrollment.student.name.charAt(0)}
                          className="bg-mint-500"
                        />
                        <div>
                          <Text weight="bold">
                            {enrollment.student.name}
                            {enrollment.student.studentCode && (
                              <span className="text-gray-500 font-normal">
                                {" "}
                                ({enrollment.student.studentCode})
                              </span>
                            )}
                          </Text>
                        </div>
                      </Flex>
                    </Card>
                  ))}
                </div>
              </Flex>
            </Tabs.Content>

            {/* Attendance Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="attendance">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">Điểm danh</Heading>
                    <Button className="bg-mint-500 hover:bg-mint-600">
                      <FiCalendar size={16} /> Tạo buổi điểm danh
                    </Button>
                  </Flex>
                  <Card className="bg-white p-8 text-center">
                    <FiCheckCircle
                      className="mx-auto text-gray-400 mb-4"
                      size={48}
                    />
                    <Text className="text-gray-600">
                      Chức năng đang phát triển
                    </Text>
                  </Card>
                </Flex>
              </Tabs.Content>
            )}
          </Tabs.Root>
        </Flex>
      </Container>

      {/* Dialogs */}
      <GroupManagementDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        students={classData.enrollments.map((e) => e.student)}
        existingGroups={classData.groups || []}
        onSave={handleSaveGroups}
      />

      <MembersManagementDialog
        open={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        classId={id}
        existingTeachers={classData.teachers.map((t) => ({
          teacher: {
            ...t.teacher,
            email: "",
            role: "TEACHER",
          },
        }))}
        existingStudents={classData.enrollments.map((e) => ({
          student: {
            ...e.student,
            role: "STUDENT",
          },
        }))}
        onSave={handleSaveMembers}
      />

      <ClassSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        classData={classData}
        onUpdate={fetchClassData}
      />
    </div>
  );
}
