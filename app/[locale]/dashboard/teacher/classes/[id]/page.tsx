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
  FiClock,
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
import { useTeacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { AttachmentListing } from "@/components/ui/AttachmentListing";
import { UploadAttachmentDialog } from "@/components/ui/UploadAttachmentDialog";
import { FileAttachment } from "@/components/ui/FilePickerInput";
import { MaterialCard } from "@/components/ui/MaterialCard";
import { CreateAssignmentDialog } from "@/components/ui/CreateAssignmentDialog";
import { AssignmentCard } from "@/components/ui/AssignmentCard";
import { AttendanceSessionDialog } from "@/components/ui/AttendanceSessionDialog";
import { useLocale, useTranslations } from "next-intl";

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

export default function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const toast = useToast();
  const teacherTabs = useTeacherTabs();
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
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isUploadAttachmentOpen, setIsUploadAttachmentOpen] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [postSortOrder, setPostSortOrder] = useState<"latest" | "oldest" | "most_votes" | "recently_updated">("latest");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [commentSortOrder, setCommentSortOrder] = useState<"time" | "votes">(
    "time"
  );

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

  const fetchAttachments = async () => {
    try {
      const { data } = await axios.get(`/api/classes/${id}/attachments`);
      setAttachments(data);
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const { data } = await axios.get(`/api/classes/${id}/materials`);
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get(`/api/classes/${id}/assignments`);
      setAssignments(data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchAttendanceSessions = async () => {
    try {
      const { data } = await axios.get(
        `/api/classes/${id}/attendance-sessions`
      );
      setAttendanceSessions(data);
    } catch (error) {
      console.error("Failed to fetch attendance sessions:", error);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push(`/${locale}/login`);
    } else if (!isLoading && user && !classData) {
      fetchClassData();
      fetchAttachments();
      fetchMaterials();
      fetchAssignments();
      fetchAttendanceSessions();
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
      toast.success(tActions('post_created'), tActions('post_created_success'));
      fetchClassData();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(tActions('error'), tActions('post_failed'));
      throw error;
    }
  };

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
      toast.error(tActions('error'), tActions('vote_failed'));
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
      toast.error(tActions('error'), tActions('comment_vote_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleCommentSortChange = (value: "time" | "votes") => {
    setCommentSortOrder(value);
  };

  const handlePinPost = async (postId: string, pinned: boolean) => {
    if (!classData) return;

    // Optimistic update
    const updatedPosts = classData.posts.map((post) =>
      post.id === postId ? { ...post, pinned: !pinned } : post
    );
    setClassData({ ...classData, posts: updatedPosts });

    try {
      await axios.patch(`/api/posts/${postId}/pin`, {
        pinned: !pinned,
        userId: user?.id,
      });
      toast.success(
        !pinned ? tPostActions('pin_success') : tPostActions('unpin_success')
      );
    } catch (error) {
      console.error("Failed to pin/unpin post:", error);
      toast.error(tPostActions('pin_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleEditPost = async (
    postId: string,
    title: string,
    content: string,
    type: string
  ) => {
    try {
      await axios.patch(`/api/posts/${postId}`, {
        authorId: user?.id,
        title,
        content,
        type,
      });
      toast.success(tActions('post_updated'));
      fetchClassData();
    } catch (error) {
      console.error("Failed to edit post:", error);
      toast.error(tActions('post_update_failed'));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await axios.delete(`/api/posts/${postId}`, {
        data: { authorId: user?.id },
      });
      toast.success(tActions('post_deleted'));
      fetchClassData();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(tActions('post_delete_failed'));
    }
  };

  const handleResolvePost = async (
    postId: string,
    resolved: boolean,
    commentId?: string
  ) => {
    if (!classData) return;

    // Optimistic update
    const updatedPosts = classData.posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            resolved: !resolved,
            resolvedCommentId: !resolved ? commentId || null : null,
          }
        : post
    );
    setClassData({ ...classData, posts: updatedPosts });

    try {
      await axios.patch(`/api/posts/${postId}/resolve`, {
        resolved: !resolved,
        resolvedCommentId: !resolved ? commentId : null,
        userId: user?.id,
      });
      toast.success(
        !resolved ? tPostActions('resolve_success') : tPostActions('unresolve_success')
      );
    } catch (error) {
      console.error("Failed to resolve/unresolve post:", error);
      toast.error(tPostActions('resolve_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleMarkAsAnswer = async (
    postId: string,
    commentId: string,
    isCurrentAnswer: boolean
  ) => {
    if (!classData) return;

    // If unmarking, just unresolve the post
    if (isCurrentAnswer) {
      await handleResolvePost(postId, true, commentId);
      return;
    }

    // If marking as answer, resolve the post with this comment
    const updatedPosts = classData.posts.map((post) =>
      post.id === postId
        ? { ...post, resolved: true, resolvedCommentId: commentId }
        : post
    );
    setClassData({ ...classData, posts: updatedPosts });

    try {
      await axios.patch(`/api/posts/${postId}/resolve`, {
        resolved: true,
        resolvedCommentId: commentId,
        userId: user?.id,
      });
      toast.success(tPostActions('marked_as_answer'));
    } catch (error) {
      console.error("Failed to mark as answer:", error);
      toast.error(tPostActions('resolve_failed'));
      // Revert on error
      fetchClassData();
    }
  };

  const handleLeave = async () => {
    try {
      await axios.delete(`/api/classes/${id}/teachers?teacherId=${user?.id}`);
      setIsLeaveDialogOpen(false);
      toast.info(tActions('left_class'), tActions('can_rejoin_anytime'));
      router.push(`/${locale}/dashboard/teacher/classes`);
    } catch (error) {
      console.error("Failed to leave class:", error);
      toast.error(tActions('error'), tActions('leave_class_failed'));
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/classes/${id}`);
      setIsLeaveDialogOpen(false);
      toast.success(tActions('class_deleted'), tActions('class_deleted_success'));
      router.push(`/${locale}/dashboard/teacher/classes`);
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error(tActions('error'), tActions('delete_class_failed'));
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/api/classes/${id}/teachers`, {
        teacherId: user?.id,
        role: "TEACHER",
      });
      toast.success(tActions('joined_class'), tActions('joined_teaching_class'));
      fetchClassData();
    } catch (error) {
      console.error("Failed to join class:", error);
      toast.error(tActions('error'), tActions('join_class_failed'));
    }
  };

  const handleCreateAssignment = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
    groupId: string | null;
    isSeparateSubmission: boolean;
    attachments?: FileAttachment[];
  }) => {
    try {
      await axios.post(`/api/classes/${id}/assignments`, {
        ...formData,
        createdById: user?.id,
      });
      setIsAssignmentDialogOpen(false);
      toast.success(tActions('assignment_created'), tActions('assignment_created_success'));
      fetchAssignments();
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error(tActions('error'), tActions('create_assignment_failed'));
      throw error;
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm(tActions('confirm_delete_assignment'))) return;

    try {
      await axios.delete(`/api/assignments/${assignmentId}`);
      toast.success(tActions('deleted'), tActions('assignment_deleted'));
      fetchAssignments();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      toast.error(tActions('error'), tActions('delete_assignment_failed'));
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
        message += tActions('groups_added', { groups: addedGroups.join(", ") }) + " ";
      }
      if (deletedGroups.length > 0) {
        message += tActions('groups_deleted', { groups: deletedGroups.join(", ") }) + " ";
      }
      if (addedGroups.length === 0 && deletedGroups.length === 0) {
        message = tActions('groups_updated', { count: keptGroups.length });
      }

      toast.success(tActions('group_config_saved'), message.trim());
      fetchClassData();
    } catch (error) {
      console.error("Failed to save groups:", error);
      toast.error(tActions('error'), tActions('save_groups_failed'));
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
        message += tActions('teachers_added', { count: changes.addedTeachers.length }) + " ";
      }
      if (changes.removedTeachers.length > 0) {
        message += tActions('teachers_removed', { count: changes.removedTeachers.length }) + " ";
      }
      if (changes.addedStudents.length > 0) {
        message += tActions('students_added', { count: changes.addedStudents.length }) + " ";
      }
      if (changes.removedStudents.length > 0) {
        message += tActions('students_removed', { count: changes.removedStudents.length }) + " ";
      }

      toast.success(tActions('members_saved'), message.trim());
      fetchClassData();
    } catch (error) {
      console.error("Failed to save members:", error);
      toast.error(tActions('error'), tActions('save_members_failed'));
      throw error;
    }
  };

  const handleOpenSessionDialog = (sessionId?: string) => {
    setSelectedSessionId(sessionId || null);
    setIsAttendanceDialogOpen(true);
  };

  const handleCloseAttendanceDialog = () => {
    setIsAttendanceDialogOpen(false);
    setSelectedSessionId(null);
    fetchAttendanceSessions(); // Refresh the list
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-mint-50">
        <DashboardNavBar tabs={teacherTabs} />
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
      <DashboardNavBar tabs={teacherTabs} />

      <Container size="4" className="py-8">
        <Flex direction="column" gap="6">
          {/* Class Header */}
          <ClassHeader
            classData={classData}
            isEnrolled={isTeaching}
            enrolledLabel={tButtons('teaching')}
            onBack={() => router.push(`/${locale}/dashboard/teacher/classes`)}
            role="teacher"
            actionButton={
              isTeaching ? (
                <Flex gap="2">
                  <Button
                    variant="soft"
                    onClick={() => setIsSettingsDialogOpen(true)}
                  >
                    <FiSettings size={16} />
                    {tButtons('class_settings')}
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setIsMembersDialogOpen(true)}
                  >
                    <FiUsers size={16} />
                    {tButtons('manage_members')}
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setIsGroupDialogOpen(true)}
                  >
                    <FiSettings size={16} />
                    {classData.groups && classData.groups.length > 0
                      ? tButtons('configure_groups')
                      : tButtons('create_groups')}
                  </Button>
                  <ConfirmDialog
                    open={isLeaveDialogOpen}
                    onOpenChange={setIsLeaveDialogOpen}
                    title={
                      isCreator
                        ? tActions('confirm_delete_class')
                        : tActions('confirm_leave_teaching')
                    }
                    description={
                      isCreator
                        ? tActions('confirm_delete_class_description')
                        : tActions('confirm_leave_teaching_description')
                    }
                    onConfirm={isCreator ? handleDelete : handleLeave}
                    trigger={
                      <Button color="red" variant="soft">
                        {isCreator ? (
                          <>
                            <FiTrash2 size={16} /> {tButtons('delete_class')}
                          </>
                        ) : (
                          <>
                            <FiLogOut size={16} /> {tButtons('leave_class')}
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
                  <FiUserPlus size={16} /> {tButtons('join_teaching')}
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
                  <Tabs.Trigger value="posts">{tTabs('posts')}</Tabs.Trigger>
                  <Tabs.Trigger value="assignments">{tTabs('assignments')}</Tabs.Trigger>
                  <Tabs.Trigger value="materials">{tTabs('materials')}</Tabs.Trigger>
                  <Tabs.Trigger value="attachments">{tTabs('attachments')}</Tabs.Trigger>
                </>
              )}
              <Tabs.Trigger value="students">{tTabs('students')}</Tabs.Trigger>
              {isTeaching && (
                <Tabs.Trigger value="attendance">{tTabs('attendance')}</Tabs.Trigger>
              )}
            </Tabs.List>

            {/* Posts Tab - Only for teaching teachers */}
            {isTeaching && (
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
                            isTeacher={true}
                            onPin={handlePinPost}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            onResolve={handleResolvePost}
                            onMarkAnswer={(postId, commentId, isCurrentAnswer) =>
                              handleMarkAsAnswer(postId, commentId, isCurrentAnswer)
                            }
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

            {/* Assignments Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="assignments">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">{tSections('assignments')}</Heading>
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={() => setIsAssignmentDialogOpen(true)}
                    >
                      <FiPlus size={16} /> {tButtons('create_assignment')}
                    </Button>
                  </Flex>

                  <CreateAssignmentDialog
                    open={isAssignmentDialogOpen}
                    onOpenChange={setIsAssignmentDialogOpen}
                    onSubmit={handleCreateAssignment}
                    groups={classData.groups || []}
                  />

                  {assignments.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {assignments.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          canDelete={true}
                          onDelete={() => handleDeleteAssignment(assignment.id)}
                        />
                      ))}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiFileText
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        {tEmpty('no_assignments_prompt')}
                      </Text>
                    </Card>
                  )}
                </Flex>
              </Tabs.Content>
            )}

            {/* Materials Tab - Only for teaching teachers */}
            {isTeaching && (
              <Tabs.Content value="materials">
                <Flex direction="column" gap="4" className="mt-6">
                  <Flex justify="between" align="center">
                    <Heading size="6">{tSections('learning_materials')}</Heading>
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={() => {
                        // TODO: Add upload learning material dialog
                        toast.info(
                          tActions('coming_soon'),
                          tActions('material_upload_coming_soon')
                        );
                      }}
                    >
                      <FiPlus size={16} /> {tButtons('upload_material')}
                    </Button>
                  </Flex>

                  {materials.length > 0 ? (
                    <Flex direction="column" gap="4">
                      {materials.map((material) => (
                        <MaterialCard
                          key={material.id}
                          material={material}
                          canDelete={material.uploadedBy?.id === user?.id}
                          onDelete={(id) => {
                            // TODO: Add delete material function
                            toast.info(
                              tActions('coming_soon'),
                              tActions('material_delete_coming_soon')
                            );
                          }}
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

            {/* Attachments Tab - Only for teaching teachers */}
            {isTeaching && (
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
                          canDelete={true}
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

            {/* Students Tab */}
            <Tabs.Content value="students">
              <Flex direction="column" gap="4" className="mt-6">
                <Heading size="6">
                  {tSections('student_list', { count: classData.enrollments.length })}
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
                    <Heading size="6">{tSections('attendance')}</Heading>
                    <Button
                      className="bg-mint-500 hover:bg-mint-600"
                      onClick={() => handleOpenSessionDialog()}
                    >
                      <FiCheckCircle size={16} /> {tButtons('start_attendance')}
                    </Button>
                  </Flex>

                  <AttendanceSessionDialog
                    open={isAttendanceDialogOpen}
                    onOpenChange={handleCloseAttendanceDialog}
                    classId={id}
                    students={classData.enrollments.map((e) => ({
                      ...e.student,
                      studentCode: e.student.studentCode ?? null,
                    }))}
                    sessionId={selectedSessionId}
                  />

                  {attendanceSessions.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {attendanceSessions.map((session) => {
                        const totalStudents = classData.enrollments.length;
                        const checkedInCount = session.checkIns?.length || 0;
                        const attendanceRate =
                          totalStudents > 0
                            ? Math.round((checkedInCount / totalStudents) * 100)
                            : 0;

                        const isActive = session.status === "ACTIVE";
                        const isExpired =
                          session.endTime &&
                          new Date() > new Date(session.endTime);

                        return (
                          <Card
                            key={session.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleOpenSessionDialog(session.id)}
                          >
                            <Flex direction="column" gap="3" p="4">
                              <Flex justify="between" align="start">
                                <Flex direction="column" gap="2">
                                  <Flex align="center" gap="2">
                                    <FiClock className="text-mint-500" />
                                    <Text size="3" weight="bold">
                                      {session.title}
                                    </Text>
                                  </Flex>
                                  <Text size="2" className="text-gray-600">
                                    {tSections('attendance_code')}:{" "}
                                    <span className="font-mono font-bold">
                                      {session.sessionCode}
                                    </span>
                                  </Text>
                                  <Text size="1" className="text-gray-500">
                                    {tSections('started_at')}:{" "}
                                    {new Date(session.startTime).toLocaleString(
                                      "vi-VN",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </Text>
                                </Flex>
                                <Flex direction="column" gap="2" align="end">
                                  <Badge
                                    color={
                                      isActive && !isExpired
                                        ? "green"
                                        : isExpired
                                        ? "orange"
                                        : "gray"
                                    }
                                    size="2"
                                  >
                                    {isActive && !isExpired
                                      ? tSections('status_active')
                                      : isExpired
                                      ? tSections('status_expired')
                                      : tSections('status_closed')}
                                  </Badge>
                                  <Text size="2" weight="bold">
                                    {checkedInCount}/{totalStudents} {tSections('students_short')} (
                                    {attendanceRate}%)
                                  </Text>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Card>
                        );
                      })}
                    </Flex>
                  ) : (
                    <Card className="bg-white p-8 text-center">
                      <FiCheckCircle
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <Text className="text-gray-600">
                        {tEmpty('no_attendance_sessions')}
                      </Text>
                    </Card>
                  )}
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
        createdBy={classData.createdBy}
        currentUserId={user?.id || ""}
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
