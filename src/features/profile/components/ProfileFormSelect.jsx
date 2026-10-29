import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { cn } from "../../../core/utils/utils";

/** Radix select portal must sit above profile wizard (z-[200]). */
export function ProfileFormSelect({
  value,
  onValueChange,
  disabled,
  placeholder,
  triggerClassName,
  children,
}) {
  const normalized =
    value === null || value === undefined || value === ""
      ? undefined
      : String(value);

  return (
    <Select
      value={normalized}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("z-[300]")} position="popper">
        {children}
      </SelectContent>
    </Select>
  );
}

export function ProfileSelectItem({ value, children }) {
  return <SelectItem value={value}>{children}</SelectItem>;
}

export function normalizeWorkMode(val) {
  const v = String(val || "OFFICE").toUpperCase();
  return ["OFFICE", "WFH", "HYBRID"].includes(v) ? v : "OFFICE";
}

export function normalizeEmploymentType(val) {
  const v = String(val || "FULL_TIME").toUpperCase();
  return ["FULL_TIME", "INTERN", "CONTRACT"].includes(v) ? v : "FULL_TIME";
}

export function normalizeAdminStatus(val) {
  const v = String(val || "ACTIVE").toUpperCase();
  return v === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export function normalizeWorkerStatus(val) {
  const v = String(val || "ACTIVE").toUpperCase();
  return ["ACTIVE", "INACTIVE", "RESIGNED"].includes(v) ? v : "ACTIVE";
}
