import {
  Card,
  Flex,
  Badge,
  Heading,
  Text,
  Button,
  Avatar,
} from "@radix-ui/themes";
import {
  FiCheckCircle,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiLock,
  FiGlobe,
} from "react-icons/fi";
import { ReactNode } from "react";

interface ClassHeaderProps {
  classData: {
    code: string;
    name: string;
    description: string | null;
    isPrivate?: boolean;
    teachers?: Array<{
      teacher: { id: string; name: string; avatar: string | null };
    }>;
    enrollments: Array<any>;
    assignments?: Array<any>;
    posts?: Array<any>;
  };
  isEnrolled: boolean;
  enrolledLabel: string;
  availableLabel?: string;
  onBack: () => void;
  actionButton: ReactNode;
  role?: "student" | "teacher";
}

export default function ClassHeader({
  classData,
  isEnrolled,
  enrolledLabel,
  availableLabel = "Có sẵn",
  onBack,
  actionButton,
  role = "student",
}: ClassHeaderProps) {
  return (
    <Card className="bg-white p-6">
      <Flex direction="column" gap="3">
        <Flex justify="between" align="start">
          <div className="flex-1 max-w-3xl">
            <Flex align="center" gap="2" className="mb-2">
              <Badge color="mint" size="2">
                {classData.code}
              </Badge>
              {classData.isPrivate ? (
                <Badge color="purple" size="2">
                  <FiLock size={12} /> Riêng tư
                </Badge>
              ) : (
                <Badge color="blue" size="2">
                  <FiGlobe size={12} /> Công khai
                </Badge>
              )}
              {isEnrolled ? (
                <Badge color="green" size="2">
                  <FiCheckCircle size={12} /> {enrolledLabel}
                </Badge>
              ) : (
                <Badge color="gray" size="2">
                  {availableLabel}
                </Badge>
              )}
            </Flex>
            <Heading size="8" className="text-gray-900 mb-2">
              {classData.name}
            </Heading>
            <Text size="3" className="text-gray-600 max-w-2xl">
              {classData.description || "Không có mô tả"}
            </Text>
          </div>
          <Flex gap="2" className="shrink-0">
            <Button variant="soft" onClick={onBack}>
              Quay lại
            </Button>
            {actionButton}
          </Flex>
        </Flex>

        <Flex gap="4" className="mt-4">
          {role === "student" &&
            classData.teachers &&
            classData.teachers.length > 0 && (
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
            )}
          <Flex align="center" gap="2">
            <FiUsers className="text-mint-600" size={20} />
            <Text size="2">
              <strong>{classData.enrollments.length}</strong> sinh viên
            </Text>
          </Flex>
          {role === "teacher" && (
            <>
              <Flex align="center" gap="2">
                <FiFileText className="text-mint-600" size={20} />
                <Text size="2">
                  <strong>{classData.assignments?.length || 0}</strong> bài tập
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                <FiMessageSquare className="text-mint-600" size={20} />
                <Text size="2">
                  <strong>{classData.posts?.length || 0}</strong> bài viết
                </Text>
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
