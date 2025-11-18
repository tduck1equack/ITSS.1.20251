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
  TextField,
  Dialog,
} from "@radix-ui/themes";
import {
  FiBook,
  FiUsers,
  FiFileText,
  FiFile,
  FiCheckCircle,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiSend,
  FiLogOut,
  FiUserPlus,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import { studentTabs } from "@/components/ui/StudentDashboardNav";
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

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/classes/${id}`);
      setClassData(data.class);
      // Check if current user is enrolled
      const enrolled = data.class.enrollments.some(
        (e: any) => e.student.id === user?.id
      );
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error("Failed to fetch class:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.push("/login");
    } else if (!isLoading && user) {
      fetchClassData();
    }
  }, [user, isLoading, id]);

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
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentText[postId];
    if (!content?.trim()) return;

    try {
      await axios.post(`/api/posts/${postId}/comments`, {
        authorId: user?.id,
        content,
      });
      setCommentText({ ...commentText, [postId]: "" });
      fetchClassData();
    } catch (error) {
      console.error("Failed to comment:", error);
    }
  };

  const handleExit = async () => {
    try {
      await axios.delete(`/api/classes/${id}/enroll?studentId=${user?.id}`);
      setIsExitDialogOpen(false);
      fetchClassData();
    } catch (error) {
      console.error("Failed to exit class:", error);
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/api/classes/${id}/enroll`, {
        studentId: user?.id,
      });
      fetchClassData();
    } catch (error) {
      console.error("Failed to join class:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={studentTabs} />
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
      <DashboardNavBar tabs={studentTabs} />

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
                    {isEnrolled ? (
                      <Badge color="green" size="2">
                        <FiCheckCircle size={12} /> Đã đăng ký
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
                    onClick={() => router.push("/dashboard/student/classes")}
                  >
                    Quay lại
                  </Button>
                  {isEnrolled ? (
                    <Dialog.Root
                      open={isExitDialogOpen}
                      onOpenChange={setIsExitDialogOpen}
                    >
                      <Dialog.Trigger>
                        <Button color="red" variant="soft">
                          <FiLogOut size={16} /> Rời khỏi
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Content style={{ maxWidth: 450 }}>
                        <Dialog.Title>Xác nhận rời khỏi lớp</Dialog.Title>
                        <Dialog.Description size="2" mb="4">
                          Bạn có chắc chắn muốn rời khỏi lớp học này? Bạn có thể
                          đăng ký lại sau.
                        </Dialog.Description>
                        <Flex gap="3" justify="end">
                          <Dialog.Close>
                            <Button variant="soft" color="gray">
                              Hủy
                            </Button>
                          </Dialog.Close>
                          <Button color="red" onClick={handleExit}>
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
                      <FiUserPlus size={16} /> Tham gia
                    </Button>
                  )}
                </Flex>
              </Flex>

              <Flex gap="4" className="mt-4">
                <Flex align="center" gap="2">
                  <Avatar
                    size="2"
                    src={classData.teachers[0]?.teacher.avatar || undefined}
                    fallback={
                      classData.teachers[0]?.teacher.name.charAt(0) || "T"
                    }
                    className="bg-mint-500"
                  />
                  <Text size="2">
                    GV:{" "}
                    <strong>
                      {classData.teachers.map((t) => t.teacher.name).join(", ")}
                    </strong>
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <FiUsers className="text-mint-600" size={20} />
                  <Text size="2">
                    <strong>{classData.enrollments.length}</strong> sinh viên
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Tabs Content */}
          <Tabs.Root defaultValue={isEnrolled ? "posts" : "members"}>
            <Tabs.List>
              {isEnrolled && (
                <>
                  <Tabs.Trigger value="posts">Bài viết</Tabs.Trigger>
                  <Tabs.Trigger value="assignments">Bài tập</Tabs.Trigger>
                  <Tabs.Trigger value="materials">Tài liệu</Tabs.Trigger>
                </>
              )}
              <Tabs.Trigger value="members">Thành viên</Tabs.Trigger>
            </Tabs.List>

            {/* Posts Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="posts">
                <Flex direction="column" gap="4" className="mt-6">
                  {classData.posts && classData.posts.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {classData.posts.map((post) => {
                        const upvotes =
                          post.votes?.filter(
                            (v: any) => v.voteType === "UPVOTE"
                          ).length || 0;
                        const downvotes =
                          post.votes?.filter(
                            (v: any) => v.voteType === "DOWNVOTE"
                          ).length || 0;
                        const userVote = post.votes?.find(
                          (v: any) => v.userId === user.id
                        );

                        return (
                          <Card key={post.id} className="bg-white p-4">
                            <Flex gap="3">
                              <Avatar
                                size="3"
                                src={post.author?.avatar}
                                fallback={post.author?.name?.charAt(0) || "U"}
                                className="bg-mint-500"
                              />
                              <Flex
                                direction="column"
                                gap="2"
                                className="flex-1"
                              >
                                <div>
                                  <Flex align="center" gap="2">
                                    <Text weight="bold">
                                      {post.author?.name}
                                    </Text>
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

                                {/* Vote buttons */}
                                <Flex gap="3" align="center">
                                  <Flex gap="2">
                                    <Button
                                      size="1"
                                      variant={
                                        userVote?.voteType === "UPVOTE"
                                          ? "solid"
                                          : "soft"
                                      }
                                      color={
                                        userVote?.voteType === "UPVOTE"
                                          ? "mint"
                                          : "gray"
                                      }
                                      onClick={() =>
                                        handleVote(post.id, "UPVOTE")
                                      }
                                    >
                                      <FiThumbsUp size={14} /> {upvotes}
                                    </Button>
                                    <Button
                                      size="1"
                                      variant={
                                        userVote?.voteType === "DOWNVOTE"
                                          ? "solid"
                                          : "soft"
                                      }
                                      color={
                                        userVote?.voteType === "DOWNVOTE"
                                          ? "red"
                                          : "gray"
                                      }
                                      onClick={() =>
                                        handleVote(post.id, "DOWNVOTE")
                                      }
                                    >
                                      <FiThumbsDown size={14} /> {downvotes}
                                    </Button>
                                  </Flex>
                                  <Flex
                                    align="center"
                                    gap="1"
                                    className="text-gray-600"
                                  >
                                    <FiMessageSquare size={16} />
                                    <Text size="2">
                                      {post.comments?.length || 0} bình luận
                                    </Text>
                                  </Flex>
                                </Flex>

                                {/* Comments */}
                                {post.comments && post.comments.length > 0 && (
                                  <Flex
                                    direction="column"
                                    gap="2"
                                    className="mt-3 pl-4 border-l-2 border-mint-200"
                                  >
                                    {post.comments.map((comment: any) => (
                                      <Flex key={comment.id} gap="2">
                                        <Avatar
                                          size="1"
                                          src={comment.author?.avatar}
                                          fallback={
                                            comment.author?.name?.charAt(0) ||
                                            "U"
                                          }
                                          className="bg-gray-400"
                                        />
                                        <div className="flex-1">
                                          <Text size="1" weight="bold">
                                            {comment.author?.name}
                                          </Text>
                                          <Text
                                            size="2"
                                            className="text-gray-700"
                                          >
                                            {comment.content}
                                          </Text>
                                        </div>
                                      </Flex>
                                    ))}
                                  </Flex>
                                )}

                                {/* Comment input */}
                                <Flex gap="2" className="mt-2">
                                  <TextField.Root
                                    placeholder="Viết bình luận..."
                                    value={commentText[post.id] || ""}
                                    onChange={(e) =>
                                      setCommentText({
                                        ...commentText,
                                        [post.id]: e.target.value,
                                      })
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    size="2"
                                    onClick={() => handleComment(post.id)}
                                    className="bg-mint-500"
                                  >
                                    <FiSend size={14} />
                                  </Button>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Card>
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

            {/* Assignments Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="assignments">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">Bài tập</Heading>
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

            {/* Materials Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="materials">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">Tài liệu học tập</Heading>
                  <Card className="bg-white p-8 text-center">
                    <FiFile className="mx-auto text-gray-400 mb-4" size={48} />
                    <Text className="text-gray-600">
                      Chức năng đang phát triển
                    </Text>
                  </Card>
                </Flex>
              </Tabs.Content>
            )}

            {/* Members Tab */}
            <Tabs.Content value="members">
              <Flex direction="column" gap="4" className="mt-6">
                <Heading size="6">
                  Thành viên lớp (
                  {classData.enrollments.length + classData.teachers.length})
                </Heading>

                <div>
                  <Text size="3" weight="bold" className="mb-3 block">
                    Giảng viên
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classData.teachers.map((t) => (
                      <Card key={t.teacher.id} className="bg-white p-4">
                        <Flex align="center" gap="3">
                          <Avatar
                            size="3"
                            src={t.teacher.avatar || undefined}
                            fallback={t.teacher.name.charAt(0)}
                            className="bg-white-500"
                          />
                          <div>
                            <Text weight="bold">{t.teacher.name}</Text>
                            <Badge size="1" color="mint">
                              Giảng viên
                            </Badge>
                          </div>
                        </Flex>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Text size="3" weight="bold" className="mb-3 block">
                    Sinh viên
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classData.enrollments.map((enrollment) => (
                      <Card
                        key={enrollment.student.id}
                        className="bg-white p-4"
                      >
                        <Flex align="center" gap="3">
                          <Avatar
                            size="3"
                            src={enrollment.student.avatar || undefined}
                            fallback={enrollment.student.name.charAt(0)}
                            className="bg-white-400"
                          />
                          <div>
                            <Text weight="bold">{enrollment.student.name}</Text>
                          </div>
                        </Flex>
                      </Card>
                    ))}
                  </div>
                </div>
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Container>
    </div>
  );
}
