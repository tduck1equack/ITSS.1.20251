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
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import ClassHeader from "@/components/ui/ClassHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PostCard } from "@/components/ui/PostCard";
import { GroupManagementDialog } from "@/components/ui/GroupManagementDialog";
import { ClassSettingsDialog } from "@/components/ui/ClassSettingsDialog";
import { CreatePostDialog } from "@/components/ui/CreatePostDialog";
import { teacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  year: number | null;
  teachers: Array<{
    teacher: { id: string; name: string; avatar: string | null };
  }>;
  enrollments: Array<{
    student: { id: string; name: string; email: string; avatar: string | null };
  }>;
  groups?: Array<{
    id: string;
    name: string;
    members: Array<{
      student: {
        id: string;
        name: string;
        email: string;
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
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
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
    } catch (error) {
      console.error("Failed to fetch class:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push("/login");
    } else if (!isLoading && user) {
      fetchClassData();
    }
  }, [user, isLoading, id]);

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
      fetchClassData();
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  };

  const handleLeave = async () => {
    try {
      await axios.delete(`/api/classes/${id}/teachers?teacherId=${user?.id}`);
      setIsLeaveDialogOpen(false);
      fetchClassData();
    } catch (error) {
      console.error("Failed to leave class:", error);
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/api/classes/${id}/teachers`, {
        teacherId: user?.id,
        role: "TEACHER",
      });
      fetchClassData();
    } catch (error) {
      console.error("Failed to join class:", error);
    }
  };

  const handleSaveGroups = async (
    groups: Array<{ name: string; memberIds: string[] }>
  ) => {
    try {
      await axios.post(`/api/classes/${id}/groups`, {
        groups,
        createdById: user?.id,
      });
      fetchClassData();
    } catch (error) {
      console.error("Failed to save groups:", error);
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
                    title="Xác nhận rời khỏi lớp giảng dạy"
                    description="Bạn có chắc chắn muốn rời khỏi giảng dạy lớp học này? Bạn có thể tham gia lại sau."
                    onConfirm={handleLeave}
                    trigger={
                      <Button color="red" variant="soft">
                        <FiLogOut size={16} /> Rời khỏi
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
                      {classData.posts.map((post) => (
                        <PostCard key={post.id} post={post} role="teacher" />
                      ))}
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
                          <Text weight="bold">{enrollment.student.name}</Text>
                          <Text size="1" className="text-gray-500">
                            {enrollment.student.id}
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
    </div>
  );
}
