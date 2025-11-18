"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
  Container,
  Heading,
  Text,
  Card,
  Flex,
  Button,
  Dialog,
  TextField,
  TextArea,
  Badge,
  Tabs,
} from "@radix-ui/themes";
import {
  FiBook,
  FiUsers,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiSearch,
} from "react-icons/fi";
import DashboardNavBar from "@/components/ui/DashboardNavBar";
import ClassCard from "@/components/ui/ClassCard";
import { teacherTabs } from "@/components/ui/TeacherDashboardNav";
import { useAuth } from "@/contexts/AuthContext";

interface Class {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  semester: string | null;
  year: number | null;
  studentCount: number;
  teacherNames: string[];
}

export default function TeacherClassesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    semester: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "TEACHER")) {
      router.push("/login");
    } else if (!isLoading && user) {
      fetchClasses();
    }
  }, [user, isLoading, router]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Fetch teaching classes
      const { data: myData } = await axios.get(
        `/api/classes?role=teacher&userId=${user?.id}`
      );
      setClasses(myData.classes || []);

      // Fetch all available classes
      const { data: allData } = await axios.get("/api/classes");
      const available = (allData.classes || []).filter(
        (c: Class) => !myData.classes.some((mc: Class) => mc.id === c.id)
      );
      setAvailableClasses(available);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/classes", {
        ...formData,
        teacherId: user?.id,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        semester: "",
        year: new Date().getFullYear(),
      });
      fetchClasses();
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lớp học này?")) return;

    try {
      await axios.delete(`/api/classes/${classId}`);
      fetchClasses();
    } catch (error) {
      console.error("Failed to delete class:", error);
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

  if (!user) {
    return null;
  }

  // Filter classes based on search query
  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableClasses = availableClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mint-50">
      <DashboardNavBar tabs={teacherTabs} />

      <Container size="4" className="py-8">
        <Flex direction="column" gap="6">
          {/* Header */}
          <Flex justify="between" align="center">
            <div>
              <Heading size="8" className="text-gray-900 mb-2">
                Lớp học của tôi
              </Heading>
              <Text size="4" className="text-gray-600">
                Quản lý các lớp học bạn đang giảng dạy
              </Text>
            </div>
            <Dialog.Root
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <Dialog.Trigger>
                <Button className="bg-mint-500 hover:bg-mint-600 text-white">
                  <FiPlus size={18} /> Tạo lớp mới
                </Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>Tạo lớp học mới</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                  Điền thông tin để tạo lớp học mới
                </Dialog.Description>
                <form onSubmit={handleCreateClass}>
                  <Flex direction="column" gap="3">
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Mã lớp <span className="text-red-500">*</span>
                      </Text>
                      <TextField.Root
                        placeholder="VD: CS101-2024"
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
                        placeholder="VD: Nhập môn Khoa học Máy tính"
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
                        placeholder="Mô tả về lớp học..."
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
                          placeholder="VD: HK1"
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
                              year: parseInt(e.target.value),
                            })
                          }
                        />
                      </label>
                    </Flex>
                  </Flex>
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Hủy
                      </Button>
                    </Dialog.Close>
                    <Button
                      type="submit"
                      className="bg-mint-500 hover:bg-mint-600"
                    >
                      Tạo lớp học
                    </Button>
                  </Flex>
                </form>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>

          {/* Search Bar */}
          <Card className="bg-white p-4">
            <TextField.Root
              placeholder="Tìm kiếm lớp học theo tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="3"
            >
              <TextField.Slot>
                <FiSearch />
              </TextField.Slot>
            </TextField.Root>
          </Card>

          {/* Tabs for My Classes and Available Classes */}
          <Tabs.Root defaultValue="my-classes">
            <Tabs.List>
              <Tabs.Trigger value="my-classes">
                Lớp đang giảng dạy ({classes.length})
              </Tabs.Trigger>
              <Tabs.Trigger value="available">
                Lớp có sẵn ({availableClasses.length})
              </Tabs.Trigger>
            </Tabs.List>

            {/* My Classes Tab */}
            <Tabs.Content value="my-classes">
              <div className="mt-6">
                {filteredClasses.length === 0 ? (
                  <Card className="bg-white p-8 text-center">
                    <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
                    <Heading size="5" className="text-gray-700 mb-2">
                      {searchQuery
                        ? "Không tìm thấy lớp học"
                        : "Chưa có lớp học nào"}
                    </Heading>
                    <Text className="text-gray-600">
                      {searchQuery
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Hãy tạo lớp học đầu tiên của bạn!"}
                    </Text>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClasses.map((classItem) => (
                      <div key={classItem.id} className="relative">
                        <ClassCard
                          classItem={classItem}
                          href={`/dashboard/teacher/classes/${classItem.id}`}
                          isEnrolled={true}
                        />
                        <Button
                          variant="soft"
                          color="red"
                          size="1"
                          className="absolute top-2 right-2"
                          onClick={() => handleDeleteClass(classItem.id)}
                        >
                          <FiTrash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>

            {/* Available Classes Tab */}
            <Tabs.Content value="available">
              <div className="mt-6">
                {filteredAvailableClasses.length === 0 ? (
                  <Card className="bg-white p-8 text-center">
                    <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
                    <Heading size="5" className="text-gray-700 mb-2">
                      {searchQuery
                        ? "Không tìm thấy lớp học"
                        : "Không có lớp học có sẵn"}
                    </Heading>
                    <Text className="text-gray-600">
                      {searchQuery
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Tất cả các lớp học đã được gán giảng viên"}
                    </Text>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAvailableClasses.map((classItem) => (
                      <ClassCard
                        key={classItem.id}
                        classItem={classItem}
                        href={`/dashboard/teacher/classes/${classItem.id}`}
                        isEnrolled={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Container>
    </div>
  );
}
