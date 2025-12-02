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
  studentCode?: string | null;
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
  const [initialGroups, setInitialGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [numGroups, setNumGroups] = useState(3);
  const [numGroupsInput, setNumGroupsInput] = useState("3");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingGroups.length > 0) {
      const groupsData = existingGroups.map((g) => ({
        name: g.name,
        memberIds: g.members.map((m) => m.student.id),
      }));
      setGroups(groupsData);
      setInitialGroups(groupsData);
    } else {
      setGroups([]);
      setInitialGroups([]);
    }
    // Reset validation error when dialog opens
    setValidationError("");
    setNumGroupsInput("3");
    setNumGroups(3);
  }, [existingGroups, open]);

  const unassignedStudents = (students || []).filter(
    (student) => !groups.some((g) => g.memberIds.includes(student.id))
  );

  const filteredUnassignedStudents = unassignedStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRandomDivide = () => {
    // Validate input
    if (!numGroupsInput.trim()) {
      setValidationError("Vui lòng nhập số lượng nhóm");
      return;
    }

    // Use the already validated numGroups state
    if (numGroups < 1) {
      setValidationError("Số lượng nhóm phải là số nguyên dương");
      return;
    }

    // Clear validation error
    setValidationError("");

    // Check if students exist
    if (!students || students.length === 0) {
      setValidationError("Không có sinh viên để phân nhóm");
      return;
    }

    // Adjust number of groups if it exceeds student count
    const actualNumGroups = Math.min(numGroups, students.length);

    // Show warning if adjusted
    if (numGroups > students.length) {
      setValidationError(
        `Số nhóm (${numGroups}) vượt quá số sinh viên (${students.length}). Sẽ tạo ${actualNumGroups} nhóm.`
      );
    }

    // Fisher-Yates shuffle algorithm for proper random distribution
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Distribute students evenly across groups
    const newGroups: Group[] = Array.from(
      { length: actualNumGroups },
      (_, i) => ({
        name: `Nhóm ${i + 1}`,
        memberIds: [],
      })
    );

    // Distribute students round-robin to ensure all groups get created
    shuffled.forEach((student, index) => {
      const groupIndex = index % actualNumGroups;
      newGroups[groupIndex].memberIds.push(student.id);
    });

    setGroups(newGroups);
    setNumGroups(actualNumGroups);
  };

  const handleNumGroupsChange = (value: string) => {
    setNumGroupsInput(value);

    // Check for invalid characters or multiple numbers
    if (value.trim() === "") {
      setValidationError("");
      return;
    }

    // Check if input contains multiple numbers separated by comma, space, etc.
    if (/[,\s]/.test(value.trim())) {
      setValidationError("Đầu vào không hợp lệ! Chỉ nhập một số nguyên dương.");
      return;
    }

    // Check if input contains non-numeric characters (except leading/trailing spaces)
    if (!/^\d+$/.test(value.trim())) {
      setValidationError("Đầu vào không hợp lệ! Chỉ nhập số nguyên dương.");
      return;
    }

    const parsed = parseInt(value.trim());
    if (isNaN(parsed) || parsed < 1) {
      setValidationError("Đầu vào không hợp lệ! Số phải lớn hơn 0.");
      return;
    }

    setValidationError("");
    setNumGroups(parsed);
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
    (students || []).find((s) => s.id === studentId);

  // Calculate changes between initial and current groups
  const getGroupChanges = () => {
    const oldGroupNames = initialGroups.map((g) => g.name);
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

    return { addedGroups, deletedGroups, keptGroups };
  };

  const { addedGroups, deletedGroups, keptGroups } = getGroupChanges();
  const hasChanges =
    addedGroups.length > 0 ||
    deletedGroups.length > 0 ||
    JSON.stringify(groups) !== JSON.stringify(initialGroups);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 900 }}>
        <Dialog.Title>Quản lý nhóm</Dialog.Title>

        <Tabs.Root defaultValue="manual">
          <Tabs.List>
            <Tabs.Trigger value="random">Chia ngẫu nhiên</Tabs.Trigger>
            <Tabs.Trigger value="manual">Thủ công</Tabs.Trigger>
          </Tabs.List>

          {/* Change Indicator */}
          {hasChanges && (
            <Card className="mt-4 p-3 bg-blue-50 border-blue-300">
              <Flex direction="column" gap="2">
                <Text size="2" weight="bold" className="text-blue-900">
                  Thay đổi chưa lưu:
                </Text>
                {addedGroups.length > 0 && (
                  <Text size="2" className="text-green-700">
                    ✓ Thêm mới: {addedGroups.join(", ")}
                  </Text>
                )}
                {deletedGroups.length > 0 && (
                  <Text size="2" className="text-red-700">
                    ✗ Xóa: {deletedGroups.join(", ")}
                  </Text>
                )}
                {addedGroups.length === 0 &&
                  deletedGroups.length === 0 &&
                  keptGroups.length > 0 && (
                    <Text size="2" className="text-blue-700">
                      ⟳ Đã chỉnh sửa {keptGroups.length} nhóm
                    </Text>
                  )}
              </Flex>
            </Card>
          )}

          {/* Random Tab */}
          <Tabs.Content value="random">
            <Flex direction="column" gap="4" className="mt-4">
              <Flex gap="3" align="end">
                <label className="flex-1">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Số lượng nhóm
                  </Text>
                  <TextField.Root
                    type="text"
                    placeholder="Nhập số nhóm..."
                    value={numGroupsInput}
                    onChange={(e) => handleNumGroupsChange(e.target.value)}
                  />
                </label>
                <Button
                  onClick={handleRandomDivide}
                  className="bg-mint-500 hover:bg-mint-600"
                >
                  <FiShuffle size={16} /> Chia ngẫu nhiên
                </Button>
              </Flex>

              {validationError && (
                <Card
                  className={`p-3 ${
                    validationError.includes("vượt quá") ||
                    validationError.includes("Sẽ tạo")
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <Text
                    size="2"
                    className={
                      validationError.includes("vượt quá") ||
                      validationError.includes("Sẽ tạo")
                        ? "text-yellow-700"
                        : "text-red-700"
                    }
                  >
                    {validationError}
                  </Text>
                </Card>
              )}

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
                                {student.studentCode && (
                                  <span className="text-gray-500 font-normal">
                                    {" "}
                                    ({student.studentCode})
                                  </span>
                                )}
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
