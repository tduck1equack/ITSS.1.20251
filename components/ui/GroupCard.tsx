import { Card, Flex, Badge, Heading, Text, Avatar } from "@radix-ui/themes";
import { FiUsers, FiFileText } from "react-icons/fi";

interface GroupCardProps {
  group: {
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
  };
  classCode: string;
  className: string;
}

export function GroupCard({ group, classCode, className }: GroupCardProps) {
  return (
    <Card className="bg-white p-6">
      <Flex direction="column" gap="4">
        {/* Group Header */}
        <div>
          <Flex align="center" gap="2" className="mb-2">
            <Badge color="mint" size="2">
              {classCode}
            </Badge>
            <Badge color="blue" size="2">
              {group.name}
            </Badge>
          </Flex>
          <Heading size="6" className="text-gray-900 mb-1">
            {className}
          </Heading>
          {group.description && (
            <Text size="2" className="text-gray-600">
              {group.description}
            </Text>
          )}
        </div>

        {/* Stats */}
        <Flex gap="4">
          <Flex align="center" gap="2">
            <FiUsers className="text-mint-600" size={20} />
            <Text size="2">
              <strong>{group.members.length}</strong> thành viên
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <FiFileText className="text-mint-600" size={20} />
            <Text size="2">
              <strong>{group.assignments?.length || 0}</strong> bài tập
            </Text>
          </Flex>
        </Flex>

        {/* Members */}
        <div>
          <Text size="2" weight="bold" className="mb-2 block">
            Thành viên nhóm
          </Text>
          <Flex wrap="wrap" gap="3">
            {group.members.map((member) => (
              <Flex
                key={member.student.id}
                align="center"
                gap="2"
                className="bg-mint-50 rounded-lg p-2 pr-3"
              >
                <Avatar
                  size="2"
                  src={member.student.avatar || undefined}
                  fallback={member.student.name.charAt(0)}
                  className="bg-mint-500"
                />
                <Text size="2" weight="bold">
                  {member.student.name}
                  {member.student.studentCode && (
                    <span className="text-gray-500 font-normal">
                      {" "}
                      ({member.student.studentCode})
                    </span>
                  )}
                </Text>
              </Flex>
            ))}
          </Flex>
        </div>

        {/* Group Assignments */}
        {group.assignments && group.assignments.length > 0 && (
          <div>
            <Text size="2" weight="bold" className="mb-2 block">
              Bài tập nhóm
            </Text>
            <Flex direction="column" gap="2">
              {group.assignments.map((assignment) => (
                <Card key={assignment.id} className="bg-gray-50 p-3">
                  <Flex justify="between" align="center">
                    <div>
                      <Text size="2" weight="bold">
                        {assignment.title}
                      </Text>
                      <Text size="1" className="text-gray-500">
                        Hạn:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </div>
                    <Badge
                      color={
                        assignment.status === "PUBLISHED"
                          ? "green"
                          : assignment.status === "CLOSED"
                          ? "red"
                          : "gray"
                      }
                    >
                      {assignment.maxPoints} điểm
                    </Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </div>
        )}
      </Flex>
    </Card>
  );
}
