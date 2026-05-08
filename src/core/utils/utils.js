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
  
  // Ensure the path starts with / and then /api/v1
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
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
