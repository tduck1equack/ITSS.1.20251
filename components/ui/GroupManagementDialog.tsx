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
} from "@radix-ui/themes";
import { FiX, FiShuffle, FiPlus, FiTrash2, FiSearch } from "react-icons/fi";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Group {
  name: string;
  memberIds: string[];
}

interface GroupManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  existingGroups?: Array<{
    id: string;
    name: string;
    members: Array<{ student: Student }>;
  }>;
  onSave: (groups: Group[]) => Promise<void>;
}

export function GroupManagementDialog({
  open,
  onOpenChange,
  students,
  existingGroups = [],
  onSave,
}: GroupManagementDialogProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [numGroups, setNumGroups] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingGroups.length > 0) {
      setGroups(
        existingGroups.map((g) => ({
          name: g.name,
          memberIds: g.members.map((m) => m.student.id),
        }))
      );
    } else {
      setGroups([]);
    }
  }, [existingGroups, open]);

  const unassignedStudents = students.filter(
    (student) => !groups.some((g) => g.memberIds.includes(student.id))
  );

  const filteredUnassignedStudents = unassignedStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRandomDivide = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groupSize = Math.ceil(students.length / numGroups);
    const newGroups: Group[] = [];

    for (let i = 0; i < numGroups; i++) {
      const start = i * groupSize;
      const end = start + groupSize;
      const members = shuffled.slice(start, end);

      if (members.length > 0) {
        newGroups.push({
          name: `Nhóm ${i + 1}`,
          memberIds: members.map((m) => m.id),
        });
      }
    }

    setGroups(newGroups);
  };

  const handleAddGroup = () => {
    setGroups([
      ...groups,
      {
        name: `Nhóm ${groups.length + 1}`,
        memberIds: [],
      },
    ]);
  };

  const handleDeleteGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const handleRenameGroup = (index: number, newName: string) => {
    const updated = [...groups];
    updated[index].name = newName;
    setGroups(updated);
  };

  const handleAddStudentToGroup = (groupIndex: number, studentId: string) => {
    const updated = [...groups];
    if (!updated[groupIndex].memberIds.includes(studentId)) {
      updated[groupIndex].memberIds.push(studentId);
      setGroups(updated);
    }
  };

  const handleRemoveStudentFromGroup = (
    groupIndex: number,
    studentId: string
  ) => {
    const updated = [...groups];
    updated[groupIndex].memberIds = updated[groupIndex].memberIds.filter(
      (id) => id !== studentId
    );
    setGroups(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(groups);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudent = (studentId: string) =>
    students.find((s) => s.id === studentId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 900 }}>
        <Dialog.Title>Quản lý nhóm</Dialog.Title>

        <Tabs.Root defaultValue="manual">
          <Tabs.List>
            <Tabs.Trigger value="random">Chia ngẫu nhiên</Tabs.Trigger>
            <Tabs.Trigger value="manual">Thủ công</Tabs.Trigger>
          </Tabs.List>

          {/* Random Tab */}
          <Tabs.Content value="random">
            <Flex direction="column" gap="4" className="mt-4">
              <Flex gap="3" align="end">
                <label className="flex-1">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Số lượng nhóm
                  </Text>
                  <TextField.Root
                    type="number"
                    min="1"
                    max={students.length}
                    value={numGroups.toString()}
                    onChange={(e) =>
                      setNumGroups(parseInt(e.target.value) || 1)
                    }
                  />
                </label>
                <Button
                  onClick={handleRandomDivide}
                  className="bg-mint-500 hover:bg-mint-600"
                >
                  <FiShuffle size={16} /> Chia ngẫu nhiên
                </Button>
              </Flex>

              {groups.length > 0 && (
                <Card className="bg-gray-50 p-4">
                  <Text size="2" weight="bold" className="mb-3 block">
                    Kết quả chia nhóm ({groups.length} nhóm)
                  </Text>
                  <Flex direction="column" gap="2">
                    {groups.map((group, index) => (
                      <Flex key={index} align="center" gap="2">
                        <Badge color="mint" size="2">
                          {group.name}
                        </Badge>
                        <Text size="2">
                          {group.memberIds.length} thành viên
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Card>
              )}
            </Flex>
          </Tabs.Content>

          {/* Manual Tab */}
          <Tabs.Content value="manual">
            <Flex direction="column" gap="4" className="mt-4">
              <Flex justify="between" align="center">
                <Text size="2" weight="bold">
                  Danh sách nhóm ({groups.length})
                </Text>
                <Button
                  size="2"
                  onClick={handleAddGroup}
                  className="bg-mint-500 hover:bg-mint-600"
                >
                  <FiPlus size={16} /> Thêm nhóm
                </Button>
              </Flex>

              <div className="max-h-96 overflow-y-auto">
                <Flex direction="column" gap="3">
                  {groups.map((group, groupIndex) => (
                    <Card key={groupIndex} className="p-4">
                      <Flex direction="column" gap="3">
                        <Flex justify="between" align="center">
                          <TextField.Root
                            value={group.name}
                            onChange={(e) =>
                              handleRenameGroup(groupIndex, e.target.value)
                            }
                            className="flex-1 max-w-xs"
                          />
                          <Button
                            size="1"
                            color="red"
                            variant="soft"
                            onClick={() => handleDeleteGroup(groupIndex)}
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </Flex>

                        {group.memberIds.length > 0 ? (
                          <Flex wrap="wrap" gap="2">
                            {group.memberIds.map((memberId) => {
                              const student = getStudent(memberId);
                              if (!student) return null;
                              return (
                                <Badge
                                  key={memberId}
                                  size="2"
                                  color="mint"
                                  className="cursor-pointer"
                                >
                                  <Flex align="center" gap="1">
                                    <Avatar
                                      size="1"
                                      src={student.avatar || undefined}
                                      fallback={student.name.charAt(0)}
                                    />
                                    {student.name}
                                    <FiX
                                      size={12}
                                      onClick={() =>
                                        handleRemoveStudentFromGroup(
                                          groupIndex,
                                          memberId
                                        )
                                      }
                                    />
                                  </Flex>
                                </Badge>
                              );
                            })}
                          </Flex>
                        ) : (
                          <Text size="2" className="text-gray-500">
                            Chưa có thành viên
                          </Text>
                        )}
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </div>

              {/* Unassigned Students */}
              <Card className="bg-gray-50 p-4">
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Text size="2" weight="bold">
                      Chưa phân nhóm ({unassignedStudents.length})
                    </Text>
                    <TextField.Root
                      placeholder="Tìm kiếm sinh viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-xs"
                    >
                      <TextField.Slot>
                        <FiSearch />
                      </TextField.Slot>
                    </TextField.Root>
                  </Flex>

                  {filteredUnassignedStudents.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      <Flex direction="column" gap="2">
                        {filteredUnassignedStudents.map((student) => (
                          <Flex
                            key={student.id}
                            align="center"
                            gap="2"
                            className="p-2 hover:bg-white rounded cursor-pointer"
                          >
                            <Avatar
                              size="2"
                              src={student.avatar || undefined}
                              fallback={student.name.charAt(0)}
                            />
                            <div className="flex-1">
                              <Text size="2" weight="bold">
                                {student.name}
                              </Text>
                              <Text size="1" className="text-gray-500">
                                {student.email}
                              </Text>
                            </div>
                            {groups.length > 0 && (
                              <Flex gap="1">
                                {groups.map((_, groupIndex) => (
                                  <Button
                                    key={groupIndex}
                                    size="1"
                                    variant="soft"
                                    onClick={() =>
                                      handleAddStudentToGroup(
                                        groupIndex,
                                        student.id
                                      )
                                    }
                                  >
                                    → {groups[groupIndex].name}
                                  </Button>
                                ))}
                              </Flex>
                            )}
                          </Flex>
                        ))}
                      </Flex>
                    </div>
                  ) : (
                    <Text size="2" className="text-gray-500 text-center">
                      {searchQuery
                        ? "Không tìm thấy sinh viên"
                        : "Tất cả sinh viên đã được phân nhóm"}
                    </Text>
                  )}
                </Flex>
              </Card>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Hủy
            </Button>
          </Dialog.Close>
          <Button
            onClick={handleSave}
            disabled={loading || groups.length === 0}
            className="bg-mint-500 hover:bg-mint-600"
          >
            {loading ? "Đang lưu..." : "Lưu nhóm"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
