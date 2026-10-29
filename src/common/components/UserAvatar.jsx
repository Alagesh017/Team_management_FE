import React from "react";
import { getFullAvatarUrl } from "../../core/utils/utils";
import { cn } from "../../core/utils/utils";

/**
 * Profile avatar with API path / base64 support (same as project-allocation).
 */
export function UserAvatar({
  url,
  email,
  firstName,
  lastName,
  className = "h-9 w-9",
  imageClassName,
}) {
  const [imgError, setImgError] = React.useState(false);
  const fullUrl = getFullAvatarUrl(url);

  React.useEffect(() => {
    setImgError(false);
  }, [url]);

  const hasImg = Boolean(fullUrl) && !imgError;
  const initial = (
    firstName?.[0] ||
    lastName?.[0] ||
    email?.[0] ||
    "?"
  ).toUpperCase();

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm",
        hasImg ? "bg-transparent" : "flex items-center justify-center bg-slate-900",
        className
      )}
    >
      {hasImg ? (
        <img
          key={fullUrl}
          src={fullUrl}
          alt=""
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-bold leading-none text-white">{initial}</span>
      )}
    </div>
  );
}
