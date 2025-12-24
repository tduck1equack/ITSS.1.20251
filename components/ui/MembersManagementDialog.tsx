"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  Card,
  Avatar,
  Badge,
  Tabs,
  Select,
} from "@radix-ui/themes";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiUserPlus,
  FiUserMinus,
} from "react-icons/fi";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  name: string;
  email: string;
  studentCode?: string | null;
  avatar: string | null;
  role: string;
}

interface Teacher {
  teacher: User;
}

interface Student {
  student: User;
}

interface MembersManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  createdBy: string | null;
  currentUserId: string;
  existingTeachers: Teacher[];
  existingStudents: Student[];
  onSave: (changes: {
    addedTeachers: string[];
    removedTeachers: string[];
    addedStudents: string[];
    removedStudents: string[];
  }) => Promise<void>;
}

export function MembersManagementDialog({
  open,
  onOpenChange,
  classId,
  createdBy,
  currentUserId,
  existingTeachers,
  existingStudents,
  onSave,
}: MembersManagementDialogProps) {
  const t = useTranslations('classes.members_dialog');
  const [teachers, setTeachers] = useState<string[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [initialTeachers, setInitialTeachers] = useState<string[]>([]);
  const [initialStudents, setInitialStudents] = useState<string[]>([]);

  const [availableTeachers, setAvailableTeachers] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      const teacherIds = existingTeachers.map((t) => t.teacher.id);
      const studentIds = existingStudents.map((s) => s.student.id);

      setTeachers(teacherIds);
      setStudents(studentIds);
      setInitialTeachers(teacherIds);
      setInitialStudents(studentIds);

      fetchAvailableUsers();
    }
  }, [open, existingTeachers, existingStudents]);

  const fetchAvailableUsers = async () => {
    setLoadingData(true);
    try {
      const [teachersRes, studentsRes] = await Promise.all([
        fetch("/api/users?role=TEACHER"),
        fetch("/api/users?role=STUDENT"),
      ]);

      const teachersData = await teachersRes.json();
      const studentsData = await studentsRes.json();

      setAvailableTeachers(teachersData.users || []);
      setAvailableStudents(studentsData.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddTeacher = () => {
    if (selectedTeacher && !teachers.includes(selectedTeacher)) {
      setTeachers([...teachers, selectedTeacher]);
      setSelectedTeacher("");
    }
  };

  const handleRemoveTeacher = (teacherId: string) => {
    // Prevent the creator from removing themselves
    if (createdBy && teacherId === createdBy && teacherId === currentUserId) {
      return;
    }
    setTeachers(teachers.filter((id) => id !== teacherId));
  };

  const handleAddStudent = () => {
    if (selectedStudent && !students.includes(selectedStudent)) {
      setStudents([...students, selectedStudent]);
      setSelectedStudent("");
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(students.filter((id) => id !== studentId));
  };

  const getTeacherChanges = () => {
    const added = teachers.filter((id) => !initialTeachers.includes(id));
    const removed = initialTeachers.filter((id) => !teachers.includes(id));
    return { added, removed };
  };

  const getStudentChanges = () => {
    const added = students.filter((id) => !initialStudents.includes(id));
    const removed = initialStudents.filter((id) => !students.includes(id));
    return { added, removed };
  };

  const teacherChanges = getTeacherChanges();
  const studentChanges = getStudentChanges();
  const hasChanges =
    teacherChanges.added.length > 0 ||
    teacherChanges.removed.length > 0 ||
    studentChanges.added.length > 0 ||
    studentChanges.removed.length > 0;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        addedTeachers: teacherChanges.added,
        removedTeachers: teacherChanges.removed,
        addedStudents: studentChanges.added,
        removedStudents: studentChanges.removed,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save members:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUser = (userId: string, userList: User[]) =>
    userList.find((u) => u.id === userId);

  const filteredAvailableTeachers = availableTeachers.filter(
    (t) =>
      !teachers.includes(t.id) &&
      (t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  const filteredAvailableStudents = availableStudents.filter(
    (s) =>
      !students.includes(s.id) &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.studentCode && s.studentCode.includes(studentSearch)))
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 900 }}>
        <Dialog.Title>{t('title')}</Dialog.Title>

        {/* Change Indicator */}
        {hasChanges && (
          <Card className="mt-4 p-3 bg-blue-50 border-blue-300">
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" className="text-blue-900">
                {t('unsaved_changes')}
              </Text>
              {teacherChanges.added.length > 0 && (
                <Text size="2" className="text-green-700">
                  {t('added_teachers')}{" "}
                  {teacherChanges.added
                    .map((id) => getUser(id, availableTeachers)?.name || id)
                    .join(", ")}
                </Text>
              )}
              {teacherChanges.removed.length > 0 && (
                <Text size="2" className="text-red-700">
                  {t('removed_teachers')}{" "}
                  {teacherChanges.removed
                    .map(
                      (id) =>
                        existingTeachers.find((t) => t.teacher.id === id)
                          ?.teacher.name || id
                    )
                    .join(", ")}
                </Text>
              )}
              {studentChanges.added.length > 0 && (
                <Text size="2" className="text-green-700">
                  {t('added_students')}{" "}
                  {studentChanges.added
                    .map((id) => getUser(id, availableStudents)?.name || id)
                    .join(", ")}
                </Text>
              )}
              {studentChanges.removed.length > 0 && (
                <Text size="2" className="text-red-700">
                  {t('removed_students')}{" "}
                  {studentChanges.removed
                    .map(
                      (id) =>
                        existingStudents.find((s) => s.student.id === id)
                          ?.student.name || id
                    )
                    .join(", ")}
                </Text>
              )}
            </Flex>
          </Card>
        )}

        <Tabs.Root defaultValue="teachers" className="mt-4">
          <Tabs.List>
            <Tabs.Trigger value="teachers">
              {t('teachers_tab')} ({teachers.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="students">
              {t('students_tab')} ({students.length})
            </Tabs.Trigger>
          </Tabs.List>

          {/* Teachers Tab */}
          <Tabs.Content value="teachers">
            <Flex direction="column" gap="4" className="mt-4">
              {/* Add Teacher Section */}
              <Card className="p-4 bg-gray-50">
                <Text size="2" weight="bold" className="mb-3 block">
                  {t('add_teacher')}
                </Text>
                <Flex gap="2" align="end">
                  <div className="flex-1">
                    <TextField.Root
                      placeholder={t('search_teacher_placeholder')}
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                    >
                      <TextField.Slot>
                        <FiSearch />
                      </TextField.Slot>
                    </TextField.Root>
                  </div>
                </Flex>

                {loadingData ? (
                  <Text size="2" className="text-gray-500 mt-3">
                    {t('loading')}
                  </Text>
                ) : filteredAvailableTeachers.length > 0 ? (
                  <div className="mt-3 max-h-48 overflow-y-auto">
                    <Flex direction="column" gap="2">
                      {filteredAvailableTeachers.slice(0, 5).map((teacher) => (
                        <Card
                          key={teacher.id}
                          className="p-2 hover:bg-white cursor-pointer"
                        >
                          <Flex justify="between" align="center">
                            <Flex align="center" gap="2">
                              <Avatar
                                size="2"
                                src={teacher.avatar || undefined}
                                fallback={teacher.name.charAt(0)}
                              />
                              <div>
                                <Text size="2" weight="bold">
                                  {teacher.name}
                                </Text>
                              </div>
                            </Flex>
                            <Button
                              size="1"
                              onClick={() => {
                                setTeachers([...teachers, teacher.id]);
                              }}
                              className="bg-mint-500 hover:bg-mint-600"
                            >
                              <FiPlus size={14} /> {t('add')}
                            </Button>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </div>
                ) : (
                  <Text size="2" className="text-gray-500 mt-3">
                    {teacherSearch
                      ? t('no_teachers_found')
                      : t('all_teachers_added')}
                  </Text>
                )}
              </Card>

              {/* Current Teachers List */}
              <div>
                <Text size="2" weight="bold" className="mb-3 block">
                  {t('current_teachers')}
                </Text>
                <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                  <Flex direction="column" gap="2">
                    {teachers.map((teacherId) => {
                      const teacher =
                        existingTeachers.find((t) => t.teacher.id === teacherId)
                          ?.teacher ||
                        availableTeachers.find((t) => t.id === teacherId);
                      if (!teacher) return null;

                      const isCreator =
                        createdBy &&
                        teacherId === createdBy &&
                        teacherId === currentUserId;

                      return (
                        <Card key={teacherId} className="p-3 bg-white">
                          <Flex justify="between" align="center">
                            <Flex align="center" gap="3">
                              <Avatar
                                size="3"
                                src={teacher.avatar || undefined}
                                fallback={teacher.name.charAt(0)}
                                className="bg-mint-500"
                              />
                              <div>
                                <Text weight="bold">
                                  {teacher.name}
                                  {isCreator && (
                                    <Badge
                                      color="blue"
                                      size="1"
                                      className="ml-2"
                                    >
                                      {t('creator_badge')}
                                    </Badge>
                                  )}
                                </Text>
                              </div>
                            </Flex>
                            <Button
                              size="1"
                              color="red"
                              variant="soft"
                              onClick={() => handleRemoveTeacher(teacherId)}
                              disabled={isCreator}
                              title={
                                isCreator
                                  ? t('creator_cannot_remove')
                                  : ""
                              }
                            >
                              <FiTrash2 size={14} /> {t('remove')}
                            </Button>
                          </Flex>
                        </Card>
                      );
                    })}
                  </Flex>
                </div>
              </div>
            </Flex>
          </Tabs.Content>

          {/* Students Tab */}
          <Tabs.Content value="students">
            <Flex direction="column" gap="4" className="mt-4">
              {/* Add Student Section */}
              <Card className="p-4 bg-gray-50">
                <Text size="2" weight="bold" className="mb-3 block">
                  {t('add_student')}
                </Text>
                <Flex gap="2" align="end">
                  <div className="flex-1">
                    <TextField.Root
                      placeholder={t('search_student_placeholder')}
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    >
                      <TextField.Slot>
                        <FiSearch />
                      </TextField.Slot>
                    </TextField.Root>
                  </div>
                </Flex>

                {loadingData ? (
                  <Text size="2" className="text-gray-500 mt-3">
                    {t('loading')}
                  </Text>
                ) : filteredAvailableStudents.length > 0 ? (
                  <div className="mt-3 max-h-48 overflow-y-auto">
                    <Flex direction="column" gap="2">
                      {filteredAvailableStudents.slice(0, 5).map((student) => (
                        <Card
                          key={student.id}
                          className="p-2 hover:bg-white cursor-pointer"
                        >
                          <Flex justify="between" align="center">
                            <Flex align="center" gap="2">
                              <Avatar
                                size="2"
                                src={student.avatar || undefined}
                                fallback={student.name.charAt(0)}
                              />
                              <div>
                                <Text size="2" weight="bold">
                                  {student.name}
                                  {student.studentCode && (
                                    <span className="text-gray-500 font-normal">
                                      {" "}
                                      ({student.studentCode})
                                    </span>
                                  )}
                                </Text>
                              </div>
                            </Flex>
                            <Button
                              size="1"
                              onClick={() => {
                                setStudents([...students, student.id]);
                              }}
                              className="bg-mint-500 hover:bg-mint-600"
                            >
                              <FiPlus size={14} /> {t('add')}
                            </Button>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </div>
                ) : (
                  <Text size="2" className="text-gray-500 mt-3">
                    {studentSearch
                      ? t('no_students_found')
                      : t('all_students_added')}
                  </Text>
                )}
              </Card>

              {/* Current Students List */}
              <div>
                <Text size="2" weight="bold" className="mb-3 block">
                  {t('current_students')}
                </Text>
                <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {students.map((studentId) => {
                      const student =
                        existingStudents.find((s) => s.student.id === studentId)
                          ?.student ||
                        availableStudents.find((s) => s.id === studentId);
                      if (!student) return null;

                      return (
                        <Card key={studentId} className="p-3 bg-white">
                          <Flex justify="between" align="center">
                            <Flex align="center" gap="2">
                              <Avatar
                                size="2"
                                src={student.avatar || undefined}
                                fallback={student.name.charAt(0)}
                                className="bg-mint-500"
                              />
                              <div className="flex-1 min-w-0">
                                <Text
                                  size="2"
                                  weight="bold"
                                  className="truncate"
                                >
                                  {student.name}
                                  {student.studentCode && (
                                    <span className="text-gray-500 font-normal">
                                      {" "}
                                      ({student.studentCode})
                                    </span>
                                  )}
                                </Text>
                              </div>
                            </Flex>
                            <Button
                              size="1"
                              color="red"
                              variant="soft"
                              onClick={() => handleRemoveStudent(studentId)}
                            >
                              <FiTrash2 size={12} />
                            </Button>
                          </Flex>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t('cancel')}
            </Button>
          </Dialog.Close>
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-mint-500 hover:bg-mint-600"
          >
            {loading ? t('saving') : t('save_changes')}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
