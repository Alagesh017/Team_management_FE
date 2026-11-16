import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../../core/utils/utils";

function matchAdmin(admin, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  const hay = `${admin.name || ""} ${admin.email || ""}`.toLowerCase();
  return hay.includes(needle);
}

/**
 * Gmail-style recipient row: type to filter admins, pick from suggestions.
 * @param {boolean} multiple - Cc mode (chips + multiple ids)
 */
export function LeaveRecipientField({
  label,
  admins,
  selectedIds,
  onSelectedIdsChange,
  multiple = false,
  excludeIds = [],
  disabled,
  placeholder = "Type a name or email…",
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  const selectedAdmins = useMemo(
    () => admins.filter((a) => selectedIds.includes(a.id)),
    [admins, selectedIds]
  );

  const suggestions = useMemo(() => {
    return admins.filter(
      (a) =>
        !excludeIds.includes(a.id) &&
        !selectedIds.includes(a.id) &&
        matchAdmin(a, query)
    );
  }, [admins, excludeIds, selectedIds, query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (admin) => {
    if (multiple) {
      onSelectedIdsChange([...selectedIds, admin.id]);
      setQuery("");
    } else {
      onSelectedIdsChange([admin.id]);
      setQuery("");
      setFocused(false);
    }
  };

  const remove = (id) => {
    onSelectedIdsChange(selectedIds.filter((x) => x !== id));
  };

  const showList = focused && suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative flex items-start gap-2 border-b border-slate-200 py-2 text-sm min-h-[40px]">
      <span className="w-14 shrink-0 pt-1.5 text-slate-500">{label}</span>
      <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1">
        {selectedAdmins.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 pl-2.5 pr-1 py-0.5 text-xs text-slate-800 max-w-full"
          >
            <span className="truncate">{a.name || a.email}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="rounded-full p-0.5 hover:bg-slate-200"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {(!multiple || selectedIds.length < 20) && (multiple || selectedIds.length === 0) ? (
          <input
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={selectedIds.length ? (multiple ? "Add Cc…" : "") : placeholder}
            className={cn(
              "flex-1 min-w-[120px] border-0 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400",
              disabled && "opacity-50"
            )}
          />
        ) : null}
      </div>
      {showList ? (
        <ul
          className="absolute left-14 right-0 top-full z-[110] mt-0 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {suggestions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(a)}
              >
                <span className="font-medium text-slate-900">{a.name}</span>
                <span className="text-slate-500"> &lt;{a.email}&gt;</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}