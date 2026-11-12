import { taskStatusFlags } from "../tasks/utils/taskStatusFlags";
import { localDateInputValue } from "../../core/utils/utils";
import { downloadTextFile } from "../../core/utils/downloadFile";

function parseLocalDateOnly(isoDate) {
  if (!isoDate) return null;
  const parts = String(isoDate).slice(0, 10).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function readTaskDateField(task, keys) {
  for (const key of keys) {
    const v = task?.[key];
    if (v != null && v !== "") return v;
  }
  return null;
}

function taskLocalCalendarDate(raw) {
  if (raw == null || raw === "") return null;
  const str = String(raw).trim();
  const iso = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return parseLocalDateOnly(iso[1]);
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInclusive(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const msPerDay = 86400000;
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1);
}

/** Inclusive calendar span for a task (start_date → due_date). Single date if only one is set. */
export function getTaskDateSpan(task) {
  const startRaw = readTaskDateField(task, ["start_date", "startDate"]);
  const endRaw = readTaskDateField(task, ["due_date", "dueDate", "end_date", "endDate"]);
  const start = taskLocalCalendarDate(startRaw);
  const end = taskLocalCalendarDate(endRaw);
  if (start && end) {
    if (start.getTime() > end.getTime()) {
      return { start: end, end: start };
    }
    return { start, end };
  }
  if (start) return { start, end: start };
  if (end) return { start: end, end };
  return null;
}

function rangesOverlap(rangeStart, rangeEnd, spanStart, spanEnd) {
  return spanStart <= rangeEnd && spanEnd >= rangeStart;
}

function taskMatchesReportDateFilter(task, reportStart, reportEnd, dateField) {
  const mode = dateField || "span";

  if (mode === "span") {
    const span = getTaskDateSpan(task);
    if (!span) return false;
    return rangesOverlap(reportStart, reportEnd, span.start, span.end);
  }

  if (mode === "due") {
    const d = taskLocalCalendarDate(readTaskDateField(task, ["due_date", "dueDate", "end_date"]));
    if (!d) return false;
    return d >= reportStart && d <= reportEnd;
  }

  if (mode === "either") {
    const startD = taskLocalCalendarDate(readTaskDateField(task, ["start_date", "startDate"]));
    const dueD = taskLocalCalendarDate(readTaskDateField(task, ["due_date", "dueDate", "end_date"]));
    const inRange = (d) => d && d >= reportStart && d <= reportEnd;
    return inRange(startD) || inRange(dueD);
  }

  const d = taskLocalCalendarDate(readTaskDateField(task, ["start_date", "startDate"]));
  if (!d) return false;
  return d >= reportStart && d <= reportEnd;
}

/** Split est/act hours across task schedule days that fall inside the report range. */
export function getTaskHoursForReportPeriod(task, reportStart, reportEnd, dateField = "span") {
  const est = Number(task.estimated_hours) || 0;
  const act = Number(task.actual_hours) || 0;
  if (dateField !== "span" || !reportStart || !reportEnd) {
    return { est, act };
  }
  const span = getTaskDateSpan(task);
  if (!span) return { est, act };

  const overlapStart = span.start > reportStart ? span.start : reportStart;
  const overlapEnd = span.end < reportEnd ? span.end : reportEnd;
  if (overlapStart > overlapEnd) return { est: 0, act: 0 };

  const spanDays = daysInclusive(span.start, span.end);
  const overlapDays = daysInclusive(overlapStart, overlapEnd);
  const ratio = overlapDays / spanDays;
  return { est: est * ratio, act: act * ratio };
}

export function getQuickDateRange(type) {
  const now = new Date();
  const start = new Date(now);
  switch (type) {
    case "today": {
      const today = localDateInputValue(now);
      return { start: today, end: today };
    }
    case "day": {
      const today = localDateInputValue(now);
      return { start: today, end: today };
    }
    case "thisweek": {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const weekEnd = new Date(start);
      weekEnd.setDate(start.getDate() + 6);
      return {
        start: localDateInputValue(start),
        end: localDateInputValue(weekEnd),
      };
    }
    case "thismonth": {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: localDateInputValue(start),
        end: localDateInputValue(monthEnd),
      };
    }
    default:
      return { start: null, end: null };
  }
}

export function memberDisplayName(member) {
  if (!member) return "";
  if (typeof member === "string") return member;
  return (
    [member.first_name, member.last_name].filter(Boolean).join(" ").trim() ||
    member.email ||
    ""
  );
}

export function personCanonicalKey(person, role = "worker") {
  const email = person?.email?.toLowerCase()?.trim();
  if (email) return `email:${email}`;
  const id = person?.id ?? person?.user_id ?? person?.role_id;
  if (id != null) return `${role}:${id}`;
  return null;
}

/** Returns null = show everyone; Set = only these keys when project selected. */
export function getAllocatedPersonKeys(projectId, allocations = []) {
  if (!projectId || projectId === "all") return null;
  const pid = Number(projectId);
  const alloc = allocations.find((a) => Number(a.project_id) === pid);
  if (!alloc?.members?.length) return new Set();
  const keys = new Set();
  alloc.members.forEach((m) => {
    const email = m.email?.toLowerCase()?.trim();
    if (email) keys.add(`email:${email}`);
    const uid = m.user_id ?? m.role_id;
    if (uid != null) {
      keys.add(`worker:${uid}`);
      keys.add(`admin:${uid}`);
      keys.add(`id:${uid}`);
    }
  });
  return keys;
}

function personAllowed(person, role, allowedKeys) {
  if (!allowedKeys) return true;
  const email = person.email?.toLowerCase()?.trim();
  if (email && allowedKeys.has(`email:${email}`)) return true;
  const id = person.id ?? person.user_id ?? person.role_id;
  if (id != null) {
    if (allowedKeys.has(`${role}:${id}`)) return true;
    if (allowedKeys.has(`id:${id}`)) return true;
  }
  return false;
}

export function buildUserOptions({ workers = [], admins = [], projectId = "all", allocations = [] }) {
  const allowedKeys = getAllocatedPersonKeys(projectId, allocations);
  const byKey = new Map();

  const add = (person, role) => {
    if (!personAllowed(person, role, allowedKeys)) return;
    const key = personCanonicalKey(person, role);
    if (!key || byKey.has(key)) return;
    const base = memberDisplayName(person) || person.email;
    if (!base) return;
    const label = role === "admin" ? `${base} (Admin)` : base;
    byKey.set(key, { key, label });
  };

  workers.forEach((w) => add(w, "worker"));
  admins.forEach((a) => add(a, "admin"));

  return Array.from(byKey.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function taskMatchesUser(task, userKey) {
  if (!userKey || userKey === "all") return true;
  return (task.members || []).some((member) => {
    if (typeof member !== "object") return member === userKey;
    const email = member.email?.toLowerCase()?.trim();
    if (userKey.startsWith("email:") && email === userKey.slice(6)) return true;
    const id = member.user_id ?? member.role_id;
    if (userKey.startsWith("worker:") && String(id) === userKey.slice(7)) return true;
    if (userKey.startsWith("admin:") && String(id) === userKey.slice(6)) return true;
    if (userKey.startsWith("id:") && String(id) === userKey.slice(3)) return true;
    const name = memberDisplayName(member);
    if (userKey.startsWith("t:")) return name === userKey.slice(2);
    return personCanonicalKey(member, "worker") === userKey;
  });
}

export function filterReportTasks(allTasks, filters) {
  let list = [...allTasks];
  const {
    dateRange,
    dateField,
    projectId,
    userKey,
    status,
    priority,
    workflow,
    search,
  } = filters;

  if (dateRange?.start && dateRange?.end) {
    const start = parseLocalDateOnly(dateRange.start);
    const end = parseLocalDateOnly(dateRange.end);
    if (start && end) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      list = list.filter((task) =>
        taskMatchesReportDateFilter(task, start, end, dateField)
      );
    }
  }

  if (projectId && projectId !== "all") {
    list = list.filter((t) => t.projectId === Number(projectId));
  }
  if (userKey && userKey !== "all") {
    list = list.filter((t) => taskMatchesUser(t, userKey));
  }
  if (status && status !== "all") {
    list = list.filter((t) => (t.status_name || t.status) === status);
  }
  if (priority && priority !== "all") {
    list = list.filter((t) => (t.priority || "").toLowerCase() === priority.toLowerCase());
  }
  if (workflow && workflow !== "all") {
    list = list.filter((t) => {
      const f = taskStatusFlags(t);
      if (workflow === "completed") return f.completed;
      if (workflow === "in_progress") return f.inProgress;
      if (workflow === "pending") return f.pending;
      if (workflow === "hold") return f.hold;
      return true;
    });
  }
  const q = (search || "").trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        (t.title || t.name || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.projectName || "").toLowerCase().includes(q)
    );
  }
  return list;
}

export function buildGroupedReportData(filteredTasks) {
  const grouped = {};
  filteredTasks.forEach((task) => {
    const projName = task.projectName || "Unassigned";
    if (!grouped[projName]) grouped[projName] = {};

    (task.members || []).forEach((member) => {
      const userName = memberDisplayName(member) || "Unknown User";
      if (!grouped[projName][userName]) grouped[projName][userName] = [];
      grouped[projName][userName].push(task);
    });

    if (!(task.members || []).length) {
      if (!grouped[projName].Unassigned) grouped[projName].Unassigned = [];
      grouped[projName].Unassigned.push(task);
    }
  });
  return grouped;
}

export function computeReportStats(tasks, options = {}) {
  const { dateRange, dateField = "span" } = options;
  let reportStart = null;
  let reportEnd = null;
  if (dateRange?.start && dateRange?.end) {
    reportStart = parseLocalDateOnly(dateRange.start);
    reportEnd = parseLocalDateOnly(dateRange.end);
    if (reportStart && reportEnd) {
      reportStart.setHours(0, 0, 0, 0);
      reportEnd.setHours(23, 59, 59, 999);
    } else {
      reportStart = null;
      reportEnd = null;
    }
  }

  let est = 0;
  let act = 0;
  const byStatus = {};
  tasks.forEach((t) => {
    const hours = getTaskHoursForReportPeriod(t, reportStart, reportEnd, dateField);
    est += hours.est;
    act += hours.act;
    const st = t.status_name || t.status || "Unknown";
    byStatus[st] = (byStatus[st] || 0) + 1;
  });
  return { count: tasks.length, est, act, byStatus };
}

export async function exportTasksCsv(tasks, formatDate, getMemberNames) {
  const headers = [
    "Task Title",
    "Project",
    "Group",
    "Assigned To",
    "Status",
    "Priority",
    "Start Date",
    "Due Date",
    "Est Hours",
    "Act Hours",
    "Remark",
  ];
  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = tasks.map((t) =>
    [
      t.title || t.name,
      t.projectName,
      t.groupName,
      getMemberNames(t.members),
      t.status_name || t.status,
      t.priority,
      formatDate(t.start_date),
      formatDate(t.due_date),
      t.estimated_hours ?? "",
      t.actual_hours ?? "",
      t.remark,
    ]
      .map(escape)
      .join(",")
  );
  const csvBody = [headers.join(","), ...rows].join("\n");
  await downloadTextFile(
    `Task_Report_${new Date().toISOString().split("T")[0]}.csv`,
    csvBody,
    "text/csv;charset=utf-8"
  );
}
