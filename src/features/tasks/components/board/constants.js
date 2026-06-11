export const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

export const avatarColor = (userId) =>
  AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];

export const PRIORITY = {
  high:   { label: "High",   bg: "#fef2f2", text: "#ef4444", dot: "#ef4444" },
  medium: { label: "Medium", bg: "#fffbeb", text: "#f59e0b", dot: "#f59e0b" },
  low:    { label: "Low",    bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
};

export const getMemberInitials = (m) =>
  `${m.first_name.charAt(0)}${m.last_name ? m.last_name.charAt(0) : ""}`.toUpperCase();

export const getMemberKey = (member) => `${member.type}-${member.user_id}`;

export const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};