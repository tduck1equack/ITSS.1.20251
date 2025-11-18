"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Tabs,
  Card,
  Avatar,
  Badge,
} from "@radix-ui/themes";
import {
  FiSettings,
  FiX,
  FiUserPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar: string | null;
}

interface ClassData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  year: number | null;
  teachers: Array<{
    teacher: Teacher;
  }>;
}

interface ClassSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassData;
  onUpdate: () => void;
}

export function ClassSettingsDialog({
  open,
  onOpenChange,
  classData,
  onUpdate,
}: ClassSettingsDialogProps) {
  const [formData, setFormData] = useState({
    code: classData.code,
    name: classData.name,
    description: classData.description || "",
    semester: classData.semester || "",
    year: classData.year || new Date().getFullYear(),
  });

  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        code: classData.code,
        name: classData.name,
        description: classData.description || "",
        semester: classData.semester || "",
        year: classData.year || new Date().getFullYear(),
      });
      fetchAllTeachers();
    }
  }, [open, classData]);

  const fetchAllTeachers = async () => {
    try {
      const { data } = await axios.get("/api/users?role=TEACHER");
      setAllTeachers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`/api/classes/${classData.id}`, formData);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update class:", error);
      alert("Không thể cập nhật thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (teacherId: string) => {
    try {
      await axios.post(`/api/classes/${classData.id}/teachers`, {
        teacherId,
        role: "TEACHER",
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to add teacher:", error);
      alert("Không thể thêm giảng viên");
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giảng viên này khỏi lớp?")) return;

    try {
      await axios.delete(
        `/api/classes/${classData.id}/teachers?teacherId=${teacherId}`
      );
      onUpdate();
    } catch (error) {
      console.error("Failed to remove teacher:", error);
      alert("Không thể xóa giảng viên");
    }
  };

  const currentTeacherIds = classData.teachers.map((t) => t.teacher.id);
  const availableTeachers = allTeachers.filter(
    (t) => !currentTeacherIds.includes(t.id)
  );

  const filteredAvailableTeachers = availableTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.email &&
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 700, maxHeight: "85vh" }}>
        <Dialog.Title>Cấu hình lớp học</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Quản lý thông tin và giảng viên của lớp học
        </Dialog.Description>

        <Tabs.Root defaultValue="info">
          <Tabs.List>
            <Tabs.Trigger value="info">Thông tin lớp</Tabs.Trigger>
            <Tabs.Trigger value="teachers">Giảng viên</Tabs.Trigger>
          </Tabs.List>

          {/* Info Tab */}
          <Tabs.Content value="info">
            <form onSubmit={handleUpdateInfo}>
              <Flex direction="column" gap="3" className="mt-4">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Mã lớp <span className="text-red-500">*</span>
                  </Text>
                  <TextField.Root
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Tên lớp <span className="text-red-500">*</span>
                  </Text>
                  <TextField.Root
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Mô tả
                  </Text>
                  <TextArea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </label>
                <Flex gap="3">
                  <label className="flex-1">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Học kỳ
                    </Text>
                    <TextField.Root
                      value={formData.semester}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semester: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="flex-1">
                    <Text as="div" size="2" mb="1" weight="bold">
                      Năm học
                    </Text>
                    <TextField.Root
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year:
                            parseInt(e.target.value) ||
                            new Date().getFullYear(),
                        })
                      }
                    />
                  </label>
                </Flex>
              </Flex>
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray" type="button">
                    Hủy
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  className="bg-mint-500"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </Flex>
            </form>
          </Tabs.Content>

          {/* Teachers Tab */}
          <Tabs.Content value="teachers">
            <Flex direction="column" gap="4" className="mt-4">
              {/* Current Teachers */}
              <div>
                <Text size="2" weight="bold" className="mb-2 block">
                  Giảng viên hiện tại ({classData.teachers.length})
                </Text>
                <Flex direction="column" gap="2">
                  {classData.teachers.map(({ teacher }) => (
                    <Card key={teacher.id} className="bg-white p-3">
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="3">
                          <Avatar
                            size="2"
                            src={teacher.avatar || undefined}
                            fallback={teacher.name.charAt(0)}
                            className="bg-mint-500"
                          />
                          <div>
                            <Text weight="bold" size="2">
                              {teacher.name}
                            </Text>
                            <Text size="1" className="text-gray-500 block">
                              {teacher.email}
                            </Text>
                          </div>
                        </Flex>
                        {classData.teachers.length > 1 && (
                          <Button
                            size="1"
                            color="red"
                            variant="soft"
                            onClick={() => handleRemoveTeacher(teacher.id)}
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        )}
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </div>

              {/* Add Teachers */}
              <div>
                <Text size="2" weight="bold" className="mb-2 block">
                  Thêm giảng viên
                </Text>
                <TextField.Root
                  placeholder="Tìm kiếm giảng viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                >
                  <TextField.Slot>
                    <FiSearch />
                  </TextField.Slot>
                </TextField.Root>
                <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
                  <Flex direction="column" gap="2">
                    {filteredAvailableTeachers.length > 0 ? (
                      filteredAvailableTeachers.map((teacher) => (
                        <Card key={teacher.id} className="bg-white p-3">
                          <Flex justify="between" align="center">
                            <Flex align="center" gap="3">
                              <Avatar
                                size="2"
                                src={teacher.avatar || undefined}
                                fallback={teacher.name.charAt(0)}
                                className="bg-mint-500"
                              />
                              <div>
                                <Text weight="bold" size="2">
                                  {teacher.name}
                                </Text>
                                <Text size="1" className="text-gray-500 block">
                                  {teacher.email}
                                </Text>
                              </div>
                            </Flex>
                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => handleAddTeacher(teacher.id)}
                            >
                              <FiUserPlus size={14} /> Thêm
                            </Button>
                          </Flex>
                        </Card>
                      ))
                    ) : (
                      <Text size="2" className="text-gray-500 text-center py-4">
                        {searchQuery
                          ? "Không tìm thấy giảng viên"
                          : "Tất cả giảng viên đã được thêm"}
                      </Text>
                    )}
                  </Flex>
                </div>
              </div>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}
