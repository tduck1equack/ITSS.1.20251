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
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { teacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  teachers: Array<{
    teacher: { id: string; name: string; avatar: string | null };
  }>;
  enrollments: Array<{
    student: { id: string; name: string; avatar: string | null };
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
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    type: "DISCUSSION",
  });

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/classes/${id}`);
      setClassData(data.class);
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/classes/${id}/posts`, {
        ...postForm,
        authorId: user?.id,
      });
      setIsPostDialogOpen(false);
      setPostForm({ title: "", content: "", type: "DISCUSSION" });
      fetchClassData();
    } catch (error) {
      console.error("Failed to create post:", error);
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
          <Card className="bg-white p-6">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="start">
                <div>
                  <Flex align="center" gap="2" className="mb-2">
                    <Badge color="mint" size="2">
                      {classData.code}
                    </Badge>
                    {isTeaching ? (
                      <Badge color="green" size="2">
                        <FiCheckCircle size={12} /> Đang giảng dạy
                      </Badge>
                    ) : (
                      <Badge color="gray" size="2">
                        Có sẵn
                      </Badge>
                    )}
                  </Flex>
                  <Heading size="8" className="text-gray-900">
                    {classData.name}
                  </Heading>
                  <Text size="3" className="text-gray-600 mt-2">
                    {classData.description || "Không có mô tả"}
                  </Text>
                </div>
                <Flex gap="2">
                  <Button
                    variant="soft"
                    onClick={() => router.push("/dashboard/teacher/classes")}
                  >
                    Quay lại
                  </Button>
                  {isTeaching ? (
                    <Dialog.Root
                      open={isLeaveDialogOpen}
                      onOpenChange={setIsLeaveDialogOpen}
                    >
                      <Dialog.Trigger>
                        <Button color="red" variant="soft">
                          <FiLogOut size={16} /> Rời khỏi
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content style={{ maxWidth: 450 }}>
                        <Dialog.Title>
                          Xác nhận rời khỏi lớp giảng dạy
                        </Dialog.Title>
                        <Dialog.Description size="2" mb="4">
                          Bạn có chắc chắn muốn rời khỏi giảng dạy lớp học này?
                          Bạn có thể tham gia lại sau.
                        </Dialog.Description>
                        <Flex gap="3" justify="end">
                          <Dialog.Close>
                            <Button variant="soft" color="gray">
                              Hủy
                            </Button>
                          </Dialog.Close>
                          <Button color="red" onClick={handleLeave}>
                            Xác nhận
                          </Button>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                  ) : (
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={handleJoin}
                    >
                      <FiUserPlus size={16} /> Tham gia giảng dạy
                    </Button>
                  )}
                </Flex>
              </Flex>

              <Flex gap="4" className="mt-4">
                <Flex align="center" gap="2">
                  <FiUsers className="text-mint-600" size={20} />
                  <Text size="2">
                    <strong>{classData.enrollments.length}</strong> sinh viên
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <FiFileText className="text-mint-600" size={20} />
                  <Text size="2">
                    <strong>{classData.assignments?.length || 0}</strong> bài
                    tập
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <FiMessageSquare className="text-mint-600" size={20} />
                  <Text size="2">
                    <strong>{classData.posts?.length || 0}</strong> bài viết
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>

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
                    <Dialog.Root
                      open={isPostDialogOpen}
                      onOpenChange={setIsPostDialogOpen}
                    >
                      <Dialog.Trigger>
                        <Button className="bg-mint-500 hover:bg-mint-600">
                          <FiPlus size={16} /> Tạo bài viết
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content style={{ maxWidth: 600 }}>
                        <Dialog.Title>Tạo bài viết mới</Dialog.Title>
                        <form onSubmit={handleCreatePost}>
                          <Flex direction="column" gap="3" className="mt-4">
                            <label>
                              <Text as="div" size="2" mb="1" weight="bold">
                                Loại bài viết
                              </Text>
                              <Select.Root
                                value={postForm.type}
                                onValueChange={(value) =>
                                  setPostForm({ ...postForm, type: value })
                                }
                              >
                                <Select.Trigger />
                                <Select.Content>
                                  <Select.Item value="ANNOUNCEMENT">
                                    Thông báo
                                  </Select.Item>
                                  <Select.Item value="DISCUSSION">
                                    Thảo luận
                                  </Select.Item>
                                  <Select.Item value="MATERIAL">
                                    Tài liệu
                                  </Select.Item>
                                </Select.Content>
                              </Select.Root>
                            </label>
                            <label>
                              <Text as="div" size="2" mb="1" weight="bold">
                                Tiêu đề
                              </Text>
                              <TextField.Root
                                placeholder="Nhập tiêu đề..."
                                value={postForm.title}
                                onChange={(e) =>
                                  setPostForm({
                                    ...postForm,
                                    title: e.target.value,
                                  })
                                }
                                required
                              />
                            </label>
                            <label>
                              <Text as="div" size="2" mb="1" weight="bold">
                                Nội dung
                              </Text>
                              <TextArea
                                placeholder="Nhập nội dung bài viết..."
                                value={postForm.content}
                                onChange={(e) =>
                                  setPostForm({
                                    ...postForm,
                                    content: e.target.value,
                                  })
                                }
                                rows={6}
                                required
                              />
                            </label>
                          </Flex>
                          <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                              <Button variant="soft" color="gray">
                                Hủy
                              </Button>
                            </Dialog.Close>
                            <Button type="submit" className="bg-mint-500">
                              Đăng bài
                            </Button>
                          </Flex>
                        </form>
                      </Dialog.Content>
                    </Dialog.Root>
                  </Flex>

                  {classData.posts && classData.posts.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {classData.posts.map((post) => (
                        <Card key={post.id} className="bg-white p-4">
                          <Flex gap="3">
                            <Avatar
                              size="3"
                              src={post.author?.avatar}
                              fallback={post.author?.name?.charAt(0) || "U"}
                              className="bg-mint-500"
                            />
                            <Flex direction="column" gap="2" className="flex-1">
                              <div>
                                <Flex align="center" gap="2">
                                  <Text weight="bold">{post.author?.name}</Text>
                                  <Badge
                                    size="1"
                                    color={
                                      post.type === "ANNOUNCEMENT"
                                        ? "red"
                                        : "gray"
                                    }
                                  >
                                    {post.type === "ANNOUNCEMENT"
                                      ? "Thông báo"
                                      : post.type === "MATERIAL"
                                      ? "Tài liệu"
                                      : "Thảo luận"}
                                  </Badge>
                                </Flex>
                                <Text size="1" className="text-gray-500">
                                  {new Date(post.createdAt).toLocaleString(
                                    "vi-VN"
                                  )}
                                </Text>
                              </div>
                              <Heading size="4">{post.title}</Heading>
                              <Text size="2" className="text-gray-700">
                                {post.content}
                              </Text>
                              <Flex gap="4" className="text-sm text-gray-600">
                                <Flex align="center" gap="1">
                                  <FiThumbsUp size={16} />
                                  <Text size="2">
                                    {post.votes?.filter(
                                      (v: any) => v.voteType === "UPVOTE"
                                    ).length || 0}
                                  </Text>
                                </Flex>
                                <Flex align="center" gap="1">
                                  <FiMessageSquare size={16} />
                                  <Text size="2">
                                    {post.comments?.length || 0} bình luận
                                  </Text>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Card>
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
