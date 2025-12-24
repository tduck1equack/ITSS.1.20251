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
  Select,
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
  FiPlus,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import ClassHeader from "@/components/ui/ClassHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PostCard } from "@/components/ui/PostCard";
import { CreatePostDialog } from "@/components/ui/CreatePostDialog";
import { GroupCard } from "@/components/ui/GroupCard";
import { useStudentTabs } from "@/components/ui/StudentDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { AttachmentListing } from "@/components/ui/AttachmentListing";
import { UploadAttachmentDialog } from "@/components/ui/UploadAttachmentDialog";
import { FileAttachment } from "@/components/ui/FilePickerInput";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { AssignmentListItem } from "@/components/ui/AssignmentListItem";
import { AttendanceCheckIn } from "@/components/ui/AttendanceCheckIn";
import { useLocale, useTranslations } from "next-intl";

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
        studentCode: string | null;
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
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
    uploadedAt?: Date | string;
    uploader?: {
      name: string;
    };
  }>;
}

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const toast = useToast();
  const studentTabs = useStudentTabs();
  const t = useTranslations('classes.detail');
  const tTabs = useTranslations('classes.detail.tabs');
  const tSections = useTranslations('classes.detail.sections');
  const tButtons = useTranslations('classes.detail.buttons');
  const tEmpty = useTranslations('classes.detail.empty_states');
  const tActions = useTranslations('classes.detail.actions');
  const tPostSort = useTranslations('posts.sorting');
  const tPostActions = useTranslations('posts.actions');
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isUploadAttachmentOpen, setIsUploadAttachmentOpen] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);
  const [commentSortOrder, setCommentSortOrder] = useState<"time" | "votes">(
    "time"
  );
  const [postSortOrder, setPostSortOrder] = useState<"latest" | "oldest" | "most_votes" | "recently_updated">("latest");

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

      // Find user's group
      const userGroup = groupsData.groups?.find((g: any) =>
        g.members.some((m: any) => m.student.id === user?.id)
      );
      setUserGroupId(userGroup?.id || null);
    } catch (error) {
      console.error("Failed to fetch class:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.push(`/${locale}/login`);
    } else if (!isLoading && user && !classData) {
      fetchClassData();
      fetchAttachments();
      fetchMaterials();
      fetchAssignments();
    }
  }, [user, isLoading]);

  const handleVote = async (
    postId: string,
    voteType: "UPVOTE" | "DOWNVOTE"
  ) => {
    if (!classData) return;

    // Optimistic update
    const updatedPosts = classData.posts.map((post) => {
      if (post.id !== postId) return post;

      const existingVote = post.votes?.find((v: any) => v.userId === user?.id);
      let newVotes = post.votes ? [...post.votes] : [];

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote
          newVotes = newVotes.filter((v: any) => v.userId !== user?.id);
        } else {
          // Change vote
          newVotes = newVotes.map((v: any) =>
            v.userId === user?.id ? { ...v, voteType } : v
          );
        }
      } else {
        // Add vote
        newVotes.push({ userId: user?.id, voteType });
      }

      return { ...post, votes: newVotes };
    });

    setClassData({ ...classData, posts: updatedPosts });

    try {
      await axios.post(`/api/posts/${postId}/vote`, {
        userId: user?.id,
        voteType,
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error(tActions('vote_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleComment = async (
    postId: string,
    content: string,
    attachments?: FileAttachment[]
  ) => {
    if (!content?.trim() || !classData) return;

    // Create optimistic comment
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user?.id || '',
      author: {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
      },
      votes: [],
      attachments: attachments || [],
    };

    // Optimistic update
    const updatedPosts = classData.posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [...(post.comments || []), optimisticComment],
        updatedAt: new Date().toISOString(),
      };
    });

    setClassData({ ...classData, posts: updatedPosts });
    toast.success(tActions('comment_added'));

    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, {
        authorId: user?.id,
        content,
        attachments,
      });

      // Replace optimistic comment with real data
      const realComment = response.data;
      const finalPosts = classData.posts.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [
            ...(post.comments || []).filter((c: any) => c.id !== optimisticComment.id),
            realComment,
          ],
          updatedAt: new Date().toISOString(),
        };
      });
      setClassData({ ...classData, posts: finalPosts });
    } catch (error) {
      console.error("Failed to comment:", error);
      toast.error(tActions('comment_failed'));
      // Revert optimistic update
      fetchClassData();
    }
  };

  const handleCommentVote = async (
    commentId: string,
    voteType: "UPVOTE" | "DOWNVOTE"
  ) => {
    if (!classData) return;

    // Optimistic update
    const updatedPosts = classData.posts.map((post) => {
      if (!post.comments) return post;

      const updatedComments = post.comments.map((comment: any) => {
        if (comment.id !== commentId) return comment;

        const existingVote = comment.votes?.find(
          (v: any) => v.userId === user?.id
        );
        let newVotes = comment.votes ? [...comment.votes] : [];

        if (existingVote) {
          if (existingVote.voteType === voteType) {
            // Remove vote
            newVotes = newVotes.filter((v: any) => v.userId !== user?.id);
          } else {
            // Change vote
            newVotes = newVotes.map((v: any) =>
              v.userId === user?.id ? { ...v, voteType } : v
            );
          }
        } else {
          // Add vote
          newVotes.push({ userId: user?.id, voteType });
        }

        return { ...comment, votes: newVotes };
      });

      return { ...post, comments: updatedComments };
    });

    setClassData({ ...classData, posts: updatedPosts });

    try {
      await axios.post(`/api/comments/${commentId}/vote`, {
        userId: user?.id,
        voteType,
      });
    } catch (error) {
      console.error("Failed to vote on comment:", error);
      toast.error(tActions('comment_vote_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleCommentSortChange = (value: "time" | "votes") => {
    setCommentSortOrder(value);
  };

  const handleCreatePost = async (formData: {
    title: string;
    content: string;
    type: string;
    attachments?: FileAttachment[];
  }) => {
    try {
      await axios.post(`/api/classes/${id}/posts`, {
        ...formData,
        authorId: user?.id,
      });
      setIsPostDialogOpen(false);
      toast.success(tActions('post_created'), tActions('post_created_success'));
      fetchClassData();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(tActions('error'), tActions('post_failed'));
      throw error;
    }
  };

  const handleExit = async () => {
    try {
      await axios.delete(`/api/classes/${id}/enroll?studentId=${user?.id}`);
      setIsExitDialogOpen(false);
      toast.success(tActions('left_class'));
      router.push(`/${locale}/dashboard/student/classes`);
    } catch (error) {
      console.error("Failed to exit class:", error);
      toast.error(tActions('leave_class_failed'));
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`/api/classes/${id}/attachments`);
      setAttachments(response.data);
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
      toast.error(tActions('error'), tActions('fetch_attachments_failed'));
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`/api/classes/${id}/materials`);
      setMaterials(response.data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      toast.error(tActions('error'), tActions('fetch_materials_failed'));
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `/api/classes/${id}/assignments?studentId=${user?.id}`
      );
      setAssignments(response.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error(tActions('error'), tActions('fetch_assignments_failed'));
    }
  };

  const handleUploadAttachment = async (formData: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) => {
    try {
      await axios.post(`/api/classes/${id}/attachments`, {
        uploaderId: user?.id,
        ...formData,
      });
      setIsUploadAttachmentOpen(false);
      toast.success(tActions('uploaded'), tActions('file_uploaded_success'));
      fetchAttachments();
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      toast.error(tActions('error'), tActions('upload_failed'));
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm(tActions('confirm_delete_file'))) return;

    try {
      await axios.delete(`/api/classes/${id}/attachments/${attachmentId}`);
      toast.success(tActions('deleted'), tActions('file_deleted'));
      fetchAttachments();
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      toast.error(tActions('error'), tActions('delete_failed'));
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/api/classes/${id}/enroll`, {
        studentId: user?.id,
      });
      fetchClassData();
      toast.success(tActions('joined_class'));
    } catch (error) {
      console.error("Failed to join class:", error);
      toast.error(tActions('join_class_failed'));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={studentTabs} />
        <Container size="4" className="py-8">
          <Text size="5" className="text-gray-600">
            {t('loading')}
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
            enrolledLabel={tButtons('enrolled')}
            onBack={() => router.push(`/${locale}/dashboard/student/classes`)}
            role="student"
            actionButton={
              isEnrolled ? (
                <ConfirmDialog
                  open={isExitDialogOpen}
                  onOpenChange={setIsExitDialogOpen}
                  title={tActions('confirm_leave_class')}
                  description={tActions('confirm_leave_class_description')}
                  onConfirm={handleExit}
                  trigger={
                    <Button color="red" variant="soft">
                      <FiLogOut size={16} /> {tButtons('leave_class')}
                    </Button>
                  }
                />
              ) : (
                <Button
                  className="bg-mint-500 hover:bg-mint-600"
                  onClick={handleJoin}
                >
                  <FiUserPlus size={16} /> {tButtons('join')}
                </Button>
              )
            }
          />

          {/* Tabs Content */}
          <Tabs.Root defaultValue={isEnrolled ? "posts" : "members"}>
            <Tabs.List>
              {isEnrolled && (
                <>
                  <Tabs.Trigger value="posts">{tTabs('posts')}</Tabs.Trigger>
                  <Tabs.Trigger value="assignments">{tTabs('assignments')}</Tabs.Trigger>
                  <Tabs.Trigger value="materials">{tTabs('materials')}</Tabs.Trigger>
                  <Tabs.Trigger value="attachments">{tTabs('attachments')}</Tabs.Trigger>
                  <Tabs.Trigger value="groups">{tTabs('groups')}</Tabs.Trigger>
                  <Tabs.Trigger value="attendance">{tTabs('attendance')}</Tabs.Trigger>
                </>
              )}
              <Tabs.Trigger value="members">{tTabs('members')}</Tabs.Trigger>
            </Tabs.List>

            {/* Posts Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="posts">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">{tSections('posts_in_class')}</Heading>
                    <Flex gap="2" align="center">
                      <Select.Root value={postSortOrder} onValueChange={(value: any) => setPostSortOrder(value)} size="2">
                        <Select.Trigger>
                          {tPostSort('sort_by')} {tPostSort(postSortOrder)}
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="latest">{tPostSort('latest')}</Select.Item>
                          <Select.Item value="recently_updated">{tPostSort('recently_updated')}</Select.Item>
                          <Select.Item value="most_votes">{tPostSort('most_votes')}</Select.Item>
                          <Select.Item value="oldest">{tPostSort('oldest')}</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <Button
                        className="bg-mint-500 hover:bg-mint-600"
                        onClick={() => setIsPostDialogOpen(true)}
                      >
                        <FiPlus size={16} /> {tButtons('create_post')}
                      </Button>
                    </Flex>
                  </Flex>

                  <CreatePostDialog
                    open={isPostDialogOpen}
                    onOpenChange={setIsPostDialogOpen}
                    onSubmit={handleCreatePost}
                  />

                  {classData.posts && classData.posts.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {(() => {
                        const sortedPosts = [...classData.posts].sort((a, b) => {
                          // Pinned posts always come first
                          if (a.pinned && !b.pinned) return -1;
                          if (!a.pinned && b.pinned) return 1;

                          // Then sort by selected order
                          switch (postSortOrder) {
                            case 'latest':
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            case 'oldest':
                              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                            case 'recently_updated':
                              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                            case 'most_votes':
                              const aVotes = (a.votes?.filter((v: any) => v.voteType === 'UPVOTE').length || 0) - (a.votes?.filter((v: any) => v.voteType === 'DOWNVOTE').length || 0);
                              const bVotes = (b.votes?.filter((v: any) => v.voteType === 'UPVOTE').length || 0) - (b.votes?.filter((v: any) => v.voteType === 'DOWNVOTE').length || 0);
                              return bVotes - aVotes;
                            default:
                              return 0;
                          }
                        });

                        return sortedPosts.map((post) => {
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
                              commentSortOrder={commentSortOrder}
                              onCommentSortChange={handleCommentSortChange}
                              onCommentVote={handleCommentVote}
                            />
                          );
                        });
                      })()}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiMessageSquare
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        {tEmpty('no_posts')}
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
                  <Heading size="6">{tSections('assignments')}</Heading>

                  {assignments.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {assignments.map((assignment) => (
                        <AssignmentListItem
                          key={assignment.id}
                          assignment={assignment}
                          submission={assignment.submissions?.[0] || null}
                          isStudent={true}
                          currentUserId={user?.id}
                          userGroupId={userGroupId}
                          onUploadComplete={fetchAssignments}
                        />
                      ))}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiFileText
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">{tEmpty('no_assignments')}</Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Materials Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="materials">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">{tSections('learning_materials')}</Heading>

                  {materials.length > 0 ? (
                    <Flex direction="column" gap="4">
                      {materials.map((material) => (
                        <MaterialCard
                          key={material.id}
                          material={material}
                          canDelete={false}
                        />
                      ))}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiFile
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        {tEmpty('no_materials')}
                      </Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Attachments Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="attachments">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">{tSections('attachments')}</Heading>
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={() => {
                        setIsUploadAttachmentOpen(true);
                      }}
                    >
                      <FiPlus size={16} /> {tButtons('upload_file')}
                    </Button>
                  </Flex>

                  <UploadAttachmentDialog
                    open={isUploadAttachmentOpen}
                    onOpenChange={setIsUploadAttachmentOpen}
                    onUpload={handleUploadAttachment}
                  />

                  {attachments.length > 0 ? (
                    <Flex direction="column" gap="2">
                      {attachments.map((attachment) => (
                        <AttachmentListing
                          key={attachment.id}
                          attachment={attachment}
                          canDelete={attachment.uploader?.id === user?.id}
                          onDelete={handleDeleteAttachment}
                        />
                      ))}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiFile
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        {tEmpty('no_attachments')}
                      </Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Groups Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="groups">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">{tSections('my_group')}</Heading>
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
                              {tEmpty('not_assigned_to_group')}
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
                        {tEmpty('no_groups')}
                      </Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Attendance Tab - Only for enrolled students */}
            {isEnrolled && (
              <Tabs.Content value="attendance">
                <Flex direction="column" gap="4" className="mt-6">
                  <Heading size="6">{tSections('attendance')}</Heading>
                  <AttendanceCheckIn classId={id} studentId={user.id} />
                </Flex>
              </Tabs.Content>
            )}

            {/* Members Tab */}
            <Tabs.Content value="members">
              <Flex direction="column" gap="4" className="mt-6">
                <Heading size="6">
                  {tSections('members_count', { count: classData.enrollments.length + classData.teachers.length })}
                </Heading>

                <div>
                  <Text size="3" weight="bold" className="mb-3 block">
                    {tSections('teachers')}
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
                              {tSections('teacher')}
                            </Badge>
                          </div>
                        </Flex>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Text size="3" weight="bold" className="mb-3 block">
                    {tSections('students')}
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
