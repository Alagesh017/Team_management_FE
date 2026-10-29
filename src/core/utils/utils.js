import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getFullAvatarUrl = (url) => {
  if (!url) return null;
  if (typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower === "null" || lower === "undefined" || lower === "none") return null;

  if (trimmed.startsWith("http") || trimmed.startsWith("data:")) return trimmed;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Normalize baseUrl: remove trailing slash and /api/v1 if present
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");

  // Ensure the path starts with / and then /api/v1
  const cleanUrl = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const cleanPath = cleanUrl.startsWith("/api/v1") ? cleanUrl : `/api/v1${cleanUrl}`;

  return `${baseUrl}${cleanPath}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
};

/** ISO / UTC timestamps for monitoring (e.g. 2026-10-28T19:41:42Z). */
export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

/** Local calendar date for `<input type="date">` (not UTC). */
export const localDateInputValue = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Session start → end for work-time views. */
export const formatSessionRange = (startedAt, endedAt) => {
  const startLabel = formatDateTime(startedAt);
  if (!endedAt) return `${startLabel} → In progress`;
  return `${startLabel} → ${formatDateTime(endedAt)}`;
};
