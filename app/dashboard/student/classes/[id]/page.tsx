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
import ClassHeader from "@/components/ui/ClassHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PostCard } from "@/components/ui/PostCard";
import { GroupCard } from "@/components/ui/GroupCard";
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
  groups?: Array<{
    id: string;
    name: string;
    description?: string | null;
    members: Array<{
      student: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
      };
    }>;
    assignments?: Array<{
      id: string;
      title: string;
      dueDate: Date | string;
      status: string;
      maxPoints: number;
    }>;
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

      // Fetch groups separately
      const { data: groupsData } = await axios.get(`/api/classes/${id}/groups`);

      setClassData({ ...data.class, groups: groupsData.groups });
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
          <ClassHeader
            classData={classData}
            isEnrolled={isEnrolled}
            enrolledLabel="Đã đăng ký"
            onBack={() => router.push("/dashboard/student/classes")}
            role="student"
            actionButton={
              isEnrolled ? (
                <ConfirmDialog
                  open={isExitDialogOpen}
                  onOpenChange={setIsExitDialogOpen}
                  title="Xác nhận rời khỏi lớp"
                  description="Bạn có chắc chắn muốn rời khỏi lớp học này? Bạn có thể đăng ký lại sau."
                  onConfirm={handleExit}
                  trigger={
                    <Button color="red" variant="soft">
                      <FiLogOut size={16} /> Rời khỏi
                    </Button>
                  }
                />
              ) : (
                <Button
                  className="bg-mint-500 hover:bg-mint-600"
                  onClick={handleJoin}
                >
                  <FiUserPlus size={16} /> Tham gia
                </Button>
              )
            }
          />

          {/* Tabs Content */}
          <Tabs.Root defaultValue={isEnrolled ? "posts" : "members"}>
            <Tabs.List>
              {isEnrolled && (
                <>
                  <Tabs.Trigger value="posts">Bài viết</Tabs.Trigger>
                  <Tabs.Trigger value="assignments">Bài tập</Tabs.Trigger>
                  <Tabs.Trigger value="materials">Tài liệu</Tabs.Trigger>
                  <Tabs.Trigger value="groups">Nhóm</Tabs.Trigger>
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
                        const userVote = post.votes?.find(
                          (v: any) => v.userId === user.id
                        );

                        return (
                          <PostCard
                            key={post.id}
                            post={post}
                            role="student"
                            userVote={userVote}
                            onVote={handleVote}
                            onComment={handleComment}
                            commentText={commentText[post.id] || ""}
                            onCommentChange={(postId, text) =>
                              setCommentText({ ...commentText, [postId]: text })
                            }
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

            {/* Groups Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="groups">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">Nhóm của tôi</Heading>
                  {classData.groups && classData.groups.length > 0 ? (
                    <>
                      {(() => {
                        const myGroup = classData.groups.find((g) =>
                          g.members.some((m) => m.student.id === user?.id)
                        );

                        if (myGroup) {
                          return (
                            <GroupCard
                              group={myGroup}
                              classCode={classData.code}
                              className={classData.name}
                            />
                          );
                        }

                        return (
                          <Card className="bg-white p-8 text-center">
                            <FiUsers
                              className="mx-auto text-gray-400 mb-4"
                              size={48}
                            />
                            <Text className="text-gray-600">
                              Bạn chưa được phân vào nhóm nào
                            </Text>
                          </Card>
                        );
                      })()}
                    </>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiUsers
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        Lớp học chưa được chia nhóm
                      </Text>
                    </Card>
                  )}
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
