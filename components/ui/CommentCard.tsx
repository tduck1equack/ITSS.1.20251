import { Avatar, Badge, Flex, Text } from "@radix-ui/themes";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    author?: {
      name: string;
      avatar?: string;
      groupName?: string;
    };
  };
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <Flex gap="2">
      <Avatar
        size="1"
        src={comment.author?.avatar}
        fallback={comment.author?.name?.charAt(0) || "U"}
        className="bg-gray-400"
      />
      <div className="flex-1">
        <Flex align="center" gap="1">
          <Text size="1" weight="bold">
            {comment.author?.name}
          </Text>
          {comment.author?.groupName && (
            <Badge size="1" color="blue">
              {comment.author.groupName}
            </Badge>
          )}
        </Flex>
        <Text size="2" className="text-gray-700">
          {comment.content}
        </Text>
      </div>
    </Flex>
  );
}
