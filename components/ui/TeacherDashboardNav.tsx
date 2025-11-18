import {
  FiBook,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";

export const teacherTabs = [
  {
    label: "Lớp học",
    href: "/dashboard/teacher/classes",
    icon: <FiBook size={18} />,
  },
  {
    label: "Bài tập",
    href: "/dashboard/teacher/assignments",
    icon: <FiFileText size={18} />,
  },
  {
    label: "Bài viết",
    href: "/dashboard/teacher/posts",
    icon: <FiMessageSquare size={18} />,
  },
  {
    label: "Thông báo",
    href: "/dashboard/teacher/notifications",
    icon: <FiBell size={18} />,
  },
];
