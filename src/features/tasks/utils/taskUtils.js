export const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  "#4F46E5", "#0891B2", "#059669", "#D97706",
  "#DC2626", "#7C3AED", "#DB2777", "#0284C7",
  "#16A34A", "#CA8A04"
];

export const PRIORITY_CONFIG = {
  high:   { label: "High",   bg: "#fff1f2", text: "#e11d48", dot: "#e11d48", border: "#fecdd3" },
  medium: { label: "Medium", bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", border: "#fde68a" },
  low:    { label: "Low",    bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e", border: "#bbf7d0" },
};

export const getGroupColor = (name) => {
  const colors = [
    "#4F46E5", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getAvatarColor = (member = "") => {
  let name = "";
  if (typeof member === "object" && member) {
    name = member.first_name + member.last_name + (member.email || "") + (member.user_id || "");
  } else if (typeof member === "string") {
    name = member;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getMemberInitials = (member) => {
  if (!member) return "?";
  if (typeof member === "string") {
    return member.length <= 3 ? member.toUpperCase() : member.slice(0, 2).toUpperCase();
  }
  let name = "";
  if (member.first_name && member.last_name) {
    name = member.first_name + " " + member.last_name;
  } else {
    name = member.name || member.username || member.email || "";
  }
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export const getPriorityStyle = (priority) => {
  const p = priority?.toLowerCase();
  return PRIORITY_CONFIG[p] || PRIORITY_CONFIG.medium;
};

export const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

export const formatDateFull = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const getFullAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  const baseUrl = import.meta.env.VITE_API_URL;
  let fullUrl;
  if (avatarUrl.startsWith('/src/assets')) {
    fullUrl = `${baseUrl}${avatarUrl}`;
  } else if (avatarUrl.startsWith('src/assets')) {
    fullUrl = `${baseUrl}/${avatarUrl}`;
  } else {
    fullUrl = `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }
  return fullUrl;
};

export const isOverdue = (dueDate) => {
  return dueDate && new Date(dueDate) < new Date();
};

export const getMemberKey = (member) => `${member.type || (member.is_admin || member.is_superadmin ? "admin" : "worker")}-${member.user_id}`;