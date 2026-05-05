import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getFullAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Normalize baseUrl: remove trailing slash and /api/v1 if present
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  
  // Ensure the path starts with /api/v1
  const cleanPath = url.startsWith("/api/v1") ? url : `/api/v1${url}`;
  
  return `${baseUrl}${cleanPath}`;
};
