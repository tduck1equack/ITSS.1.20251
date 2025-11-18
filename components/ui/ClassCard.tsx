import Link from "next/link";
import { Card, Flex, Badge, Heading, Text, Button } from "@radix-ui/themes";
import { FiBook, FiUsers, FiClock, FiCheckCircle } from "react-icons/fi";

interface ClassCardProps {
  classItem: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    status?: string;
    semester: string | null;
    studentCount: number;
    teacherNames: string[];
  };
  href: string;
  isEnrolled?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

export default function ClassCard({
  classItem,
  href,
  isEnrolled = true,
  onAction,
  actionLabel,
  showAction = false,
}: ClassCardProps) {
  const CardContent = (
    <Card
      className={`bg-white h-full ${
        isEnrolled
          ? "hover:shadow-lg transition-shadow cursor-pointer"
          : "hover:shadow-lg transition-shadow"
      }`}
    >
      <Flex direction="column" gap="3" className="p-4">
        {classItem.coverImage ? (
          <img
            src={classItem.coverImage}
            alt={classItem.name}
            className="w-full h-32 object-cover rounded-md"
          />
        ) : (
          <div
            className={`w-full h-32 bg-gradient-to-br ${
              isEnrolled
                ? "from-mint-400 to-mint-600"
                : "from-gray-300 to-gray-500"
            } rounded-md flex items-center justify-center`}
          >
            <FiBook className="text-white" size={48} />
          </div>
        )}
        <div>
          <Flex align="center" gap="2" className="mb-1">
            <Badge color={isEnrolled ? "mint" : "gray"}>{classItem.code}</Badge>
            {isEnrolled && classItem.status === "ACTIVE" && (
              <Badge color="green">
                <FiCheckCircle size={12} /> Đang học
              </Badge>
            )}
          </Flex>
          <Heading size="5" className="text-gray-900 mb-1">
            {classItem.name}
          </Heading>
          <Text size="2" className="text-gray-600 line-clamp-2">
            {classItem.description || "Không có mô tả"}
          </Text>
        </div>
        <Flex gap="3" className="text-sm text-gray-600">
          <Flex align="center" gap="1">
            <FiUsers size={16} />
            <Text size="2">{classItem.studentCount} SV</Text>
          </Flex>
          {classItem.semester && (
            <Flex align="center" gap="1">
              <FiClock size={16} />
              <Text size="2">{classItem.semester}</Text>
            </Flex>
          )}
        </Flex>
        <Text size="1" className="text-gray-500">
          GV: {classItem.teacherNames.join(", ")}
        </Text>
        {showAction && onAction && actionLabel && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction();
            }}
            className="w-full bg-mint-500 hover:bg-mint-600 text-white"
          >
            {actionLabel}
          </Button>
        )}
      </Flex>
    </Card>
  );

  if (isEnrolled || !showAction) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}
