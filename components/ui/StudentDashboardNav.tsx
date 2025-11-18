import {
  FiBook,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";

export const studentTabs = [
  {
    label: "Lớp học",
    href: "/dashboard/student/classes",
    icon: <FiBook size={18} />,
  },
  {
    label: "Bài tập",
    href: "/dashboard/student/assignments",
    icon: <FiFileText size={18} />,
  },
  {
    label: "Nhóm",
    href: "/dashboard/student/groups",
    icon: <FiUsers size={18} />,
  },
  {
    label: "Bài viết",
    href: "/dashboard/student/posts",
    icon: <FiMessageSquare size={18} />,
  },
  {
    label: "Thông báo",
    href: "/dashboard/student/notifications",
    icon: <FiBell size={18} />,
  },
];
