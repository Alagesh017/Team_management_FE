import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  X,
  ChevronDown,
  Inbox,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  PauseCircle,
  Hourglass,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { taskService } from "../services/taskService";
import { workerService } from "../../workers/services/workerService";
import { adminService } from "../../admin/services/adminService";
import { taskStatusFlags } from "../utils/taskStatusFlags";
import { cn } from "../../../core/utils/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getGroupColor = (name) => {
  const colors = [
    "#4F46E5", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AVATAR_COLORS = [
  "#4F46E5", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#DB2777", "#0284C7", "#16A34A", "#CA8A04",
];

const getAvatarColor = (member = "") => {
  let name = "";
  if (typeof member === "object" && member) {
    name = member.first_name + member.last_name + (member.email || "");
  } else if (typeof member === "string") {
    name = member;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getMemberInitials = (member) => {
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

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return { bg: "#FEF2F2", text: "#DC2626" };
    case "medium":
      return { bg: "#FFFBEB", text: "#D97706" };
    case "low":
      return { bg: "#F0FDF4", text: "#16A34A" };
    default:
      return { bg: "#F1F5F9", text: "#64748B" };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

function buildTasksByEmployeeChart(allTasks, workers = [], admins = []) {
  const entries = [];
  const byEmail = {};
  const byWorkerId = {};
  const byAdminId = {};

  const pushPerson = (person, roleTag) => {
    const baseName =
      [person.first_name, person.last_name].filter(Boolean).join(" ").trim() ||
      person.email ||
      roleTag;
    const name = roleTag === "Admin" ? `${baseName} · Admin` : baseName;
    const row = { name, value: 0 };
    entries.push(row);
    const email = person.email?.toLowerCase();
    if (email) byEmail[email] = row;
    if (person.id != null) {
      if (roleTag === "Admin") byAdminId[person.id] = row;
      else byWorkerId[person.id] = row;
    }
  };

  workers.forEach((w) => pushPerson(w, "Worker"));
  admins.forEach((a) => pushPerson(a, "Admin"));

  allTasks.forEach((task) => {
    (task.members || []).forEach((member) => {
      if (typeof member === "string") return;
      const email = member.email?.toLowerCase();
      let row = email ? byEmail[email] : null;
      const uid = member.user_id ?? member.role_id;
      if (!row && uid != null) {
        row = byWorkerId[uid] || byAdminId[uid];
      }
      if (row) row.value += 1;
    });
  });

  return entries.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent = "text-slate-900", active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "text-left bg-white rounded-lg border border-slate-200/90 px-2 py-1.5 shadow-sm transition-all min-w-[68px] flex-1 max-w-[100px]",
      "hover:border-slate-300",
      active && "ring-1 ring-indigo-500 border-indigo-200 bg-indigo-50/50"
    )}
  >
    <div className="flex items-center justify-between gap-1 mb-0.5">
      <span className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 truncate leading-none">
        {label}
      </span>
      {Icon && <Icon className={cn("h-3 w-3 shrink-0 opacity-80", accent)} />}
    </div>
    <span className={cn("text-lg font-bold tabular-nums leading-none", accent)}>{value}</span>
  </button>
);

const PriorityBadge = ({ priority }) => {
  if (!priority) return null;
  const { bg, text } = getPriorityStyle(priority);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: bg, color: text }}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ name, color }) => {
  if (!name) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color || "#94A3B8" }}
      />
      {name}
    </span>
  );
};

const getFullAvatarUrl = (avatarUrl) => {
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

const AvatarStack = ({ members, onMemberClick }) => {
  if (!members?.length) return <span className="text-slate-300 text-xs">—</span>;
  const visible = members.slice(0, 4);
  const extra = members.length - visible.length;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => {
        const initials = getMemberInitials(m);
        const color = getAvatarColor(m);
        const avatarUrl = typeof m === "object" ? getFullAvatarUrl(m?.avatar_url) : null;
        return (
          <button
            key={i}
            onClick={() => onMemberClick && onMemberClick(m)}
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
            style={{ 
              background: avatarUrl ? "transparent" : color, 
              marginLeft: i === 0 ? 0 : -6 
            }}
            title={typeof m === "string" ? m : (m?.first_name + " " + m?.last_name) || m?.name || m?.username || ""}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>
        );
      })}
      {extra > 0 && (
        <div
          className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-500 text-[9px] font-bold"
          style={{ marginLeft: -6 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

// Mini Popup Component
const MemberPopup = ({ member, onClose }) => {
  if (!member) return null;

  const fullName = typeof member === "object" 
    ? (member.first_name + " " + member.last_name) 
    : member;
  const avatarUrl = typeof member === "object" ? getFullAvatarUrl(member?.avatar_url) : null;
  const initials = getMemberInitials(member);
  const color = getAvatarColor(member);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 min-w-[200px] relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="w-20 h-20 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
          style={{ background: avatarUrl ? "transparent" : color }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        
        <div className="text-center">
          <h3 className="font-bold text-slate-800 text-lg">{fullName}</h3>
          {typeof member === "object" && member.email && (
            <p className="text-xs text-slate-500 mt-1">{member.email}</p>
          )}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const TaskDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [workforce, setWorkforce] = useState({ workers: [], admins: [] });
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'reports'

  // Derived state
  const activeGroup = dashboardData?.groups?.find((g) => g.id === activeGroupId);
  const activeProject = activeGroup?.projects?.find((p) => p.id === activeProjectId);

  const projectTasks = activeProject?.tasks || [];

  const projectStats = useMemo(() => {
    let pending = 0;
    let hold = 0;
    let inProgress = 0;
    let completed = 0;
    projectTasks.forEach((t) => {
      const f = taskStatusFlags(t);
      if (f.completed) completed += 1;
      else if (f.hold) hold += 1;
      else if (f.pending) pending += 1;
      else if (f.inProgress) inProgress += 1;
    });
    return {
      total: projectTasks.length,
      pending,
      hold,
      inProgress,
      completed,
    };
  }, [projectTasks]);

  const filteredTasks = useMemo(() => {
    let list = projectTasks;
    if (filterPriority) {
      list = list.filter((t) => t.priority?.toLowerCase() === filterPriority);
    }
    if (statusFilter === "pending") {
      list = list.filter((t) => taskStatusFlags(t).pending);
    } else if (statusFilter === "hold") {
      list = list.filter((t) => taskStatusFlags(t).hold);
    } else if (statusFilter === "in_progress") {
      list = list.filter((t) => taskStatusFlags(t).inProgress);
    } else if (statusFilter === "completed") {
      list = list.filter((t) => taskStatusFlags(t).completed);
    }
    return list;
  }, [projectTasks, filterPriority, statusFilter]);

  // All tasks across all projects for reports
  const allTasks = useMemo(() => {
    if (!dashboardData?.groups) return [];
    return dashboardData.groups.flatMap(group => 
      (group.projects || []).flatMap(project => 
        (project.tasks || []).map(task => ({ ...task, projectName: project.name }))
      )
    );
  }, [dashboardData]);

  // Charts Data
  const tasksByStatusData = useMemo(() => {
    const statusMap = {};
    allTasks.forEach(task => {
      const statusName = task.status_name || task.status || "Unknown";
      const statusColor = task.status_color || "#94A3B8";
      if (!statusMap[statusName]) {
        statusMap[statusName] = { name: statusName, value: 0, color: statusColor };
      }
      statusMap[statusName].value += 1;
    });
    return Object.values(statusMap);
  }, [allTasks]);

  const tasksByEmployeeData = useMemo(
    () => buildTasksByEmployeeChart(allTasks, workforce.workers, workforce.admins),
    [allTasks, workforce.workers, workforce.admins]
  );

  const employeeChartHeight = Math.max(240, Math.min(520, tasksByEmployeeData.length * 32));

  const tasksByProjectData = useMemo(() => {
    const projMap = {};
    allTasks.forEach(task => {
      const projectName = task.projectName || "Unassigned";
      if (!projMap[projectName]) {
        projMap[projectName] = { name: projectName, value: 0 };
      }
      projMap[projectName].value += 1;
    });
    return Object.values(projMap);
  }, [allTasks]);

  const teamWorkloadData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      tasks: Math.floor(Math.random() * 15) + 5,
      hours: Math.floor(Math.random() * 40) + 10
    }));
  }, [allTasks]); // Placeholder, real data would use task dates

  const totalAllTasks = allTasks.length;
  const totalAllStats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let hold = 0;
    allTasks.forEach((t) => {
      const f = taskStatusFlags(t);
      if (f.completed) completed += 1;
      else if (f.hold) hold += 1;
      else if (f.pending) pending += 1;
      else if (f.inProgress) inProgress += 1;
    });
    return { completed, inProgress, pending, hold };
  }, [allTasks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, workerRes, adminRes] = await Promise.all([
          taskService.getDashboardTasks(),
          workerService.getAllWorkers().catch(() => ({ workers: [] })),
          adminService.getAllAdmins().catch(() => ({ admins: [] })),
        ]);
        setDashboardData(data);
        setWorkforce({
          workers: workerRes?.workers || [],
          admins: adminRes?.admins || [],
        });
        if (data?.groups?.length > 0) {
          const firstGroup = data.groups[0];
          setActiveGroupId(firstGroup.id);
          if (firstGroup.projects?.length > 0) {
            setActiveProjectId(firstGroup.projects[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGroupSelect = (groupId) => {
    setActiveGroupId(groupId);
    setFilterPriority(null);
    setStatusFilter(null);
    const group = dashboardData?.groups?.find((g) => g.id === groupId);
    setActiveProjectId(group?.projects?.[0]?.id || null);
  };

  const handleProjectSelect = (projectId) => {
    setActiveProjectId(projectId);
    setFilterPriority(null);
    setStatusFilter(null);
  };

  const togglePriorityFilter = (p) => {
    setFilterPriority((prev) => (prev === p ? null : p));
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">

      {/* ── Top Bar: Groups (only on Tasks tab) ─────────────────────────────────────────────────── */}
      {activeTab === "tasks" && (
        <div className="flex items-center gap-0 bg-white border-b border-slate-200 px-4 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 pr-4 mr-1 border-r border-slate-200 py-3 shrink-0">
            <LayoutDashboard className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">Tasks</span>
          </div>

          {dashboardData?.groups?.map((group) => {
            const color = group.name === "Ungrouped" ? "#6B7280" : getGroupColor(group.name);
            const isActive = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(group.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? "text-slate-900 border-indigo-600"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                {group.name}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {group.projects?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6 bg-white border-b border-slate-200 px-6">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-4 text-sm font-bold transition-colors relative ${
            activeTab === "tasks" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          Tasks
          {activeTab === "tasks" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`py-4 text-sm font-bold transition-colors relative ${
            activeTab === "reports" ? "text-slate-900" : "text-slate-400"
          }`}
        >
          Reports
          {activeTab === "reports" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
          )}
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Projects Sidebar (only on Tasks tab) ────────────────── */}
        {activeTab === "tasks" && (
          <div className="w-full md:w-52 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200">
            <div className="md:hidden px-4 py-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                Projects
              </label>
              <select
                value={activeProjectId || ""}
                onChange={(e) => handleProjectSelect(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {activeGroup?.projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.tasks?.length || 0})
                  </option>
                ))}
                {!activeGroup?.projects?.length && (
                  <option value="">No projects</option>
                )}
              </select>
            </div>

            <div className="hidden md:flex flex-col max-h-full overflow-hidden">
              <div className="px-3 pt-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">
                  Projects
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                {activeGroup?.projects?.map((project) => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <Folder
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-indigo-500" : "text-slate-400"
                        }`}
                      />
                      <span className="flex-1 truncate text-[13px]">{project.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                          isActive
                            ? "bg-indigo-200 text-indigo-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {project.tasks?.length || 0}
                      </span>
                    </button>
                  );
                })}

                {!activeGroup?.projects?.length && (
                  <p className="text-xs text-slate-400 italic px-2 py-4 text-center">
                    No projects
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "tasks" ? (
            // ── Tasks Tab Content ──────────────────────────────────────────────────────
            activeProject ? (
              <>
                <div className="shrink-0 bg-white border-b border-slate-200 px-2 py-1.5 overflow-x-auto overscroll-x-contain touch-pan-x">
                  <div className="flex gap-1.5 min-w-0 sm:min-w-max">
                    {[
                      { key: null, label: "All", value: projectStats.total, icon: CheckSquare },
                      { key: "pending", label: "Pending", value: projectStats.pending, icon: Hourglass, accent: "text-amber-600" },
                      { key: "hold", label: "On hold", value: projectStats.hold, icon: PauseCircle, accent: "text-orange-600" },
                      { key: "in_progress", label: "In progress", value: projectStats.inProgress, icon: Clock, accent: "text-indigo-600" },
                      { key: "completed", label: "Done", value: projectStats.completed, icon: CheckSquare, accent: "text-emerald-600" },
                    ].map(({ key, label, value, icon, accent }) => (
                      <StatCard
                        key={label}
                        label={label}
                        value={value}
                        icon={icon}
                        accent={accent}
                        active={statusFilter === key}
                        onClick={() => setStatusFilter((prev) => (prev === key ? null : key))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0 gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{activeProject.name}</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeGroup?.name} · {projectStats.total} task{projectStats.total !== 1 ? "s" : ""}
                      {statusFilter ? ` · filtered` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 font-medium">Priority:</span>
                    {["High", "Medium", "Low"].map((p) => {
                      const { bg, text } = getPriorityStyle(p);
                      const isOn = filterPriority === p.toLowerCase();
                      return (
                        <button
                          key={p}
                          onClick={() => togglePriorityFilter(p.toLowerCase())}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={
                            isOn
                              ? { background: bg, color: text, borderColor: text + "50" }
                              : { background: "white", color: "#94A3B8", borderColor: "#E2E8F0" }
                          }
                        >
                          {p}
                        </button>
                      );
                    })}
                    {filterPriority && (
                      <button
                        onClick={() => setFilterPriority(null)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-3 w-3" /> Clear priority
                      </button>
                    )}
                    {statusFilter && (
                      <button
                        onClick={() => setStatusFilter(null)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-3 w-3" /> Clear status
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[200px]">
                          Task
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[120px]">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">
                          Priority
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">
                          Start
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">
                          Due
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">
                          Hours
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[100px]">
                          Members
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={7}>
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                              <Inbox className="h-8 w-8" />
                              <p className="text-sm font-medium">No tasks match this filter</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task, idx) => (
                          <tr
                            key={task.id || idx}
                            className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900 text-[13px]">
                                {task.title || task.name}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge
                                name={task.status_name || task.status}
                                color={task.status_color}
                              />
                            </td>

                            <td className="px-4 py-3">
                              <PriorityBadge priority={task.priority} />
                            </td>

                            <td className="px-4 py-3">
                              {task.start_date ? (
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                  <Calendar className="h-3 w-3 text-slate-300" />
                                  {formatDate(task.start_date)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {task.due_date ? (
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                  <Calendar className="h-3 w-3 text-slate-300" />
                                  {formatDate(task.due_date)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {task.estimated_hours ? (
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                  <Clock className="h-3 w-3 text-slate-300" />
                                  {task.actual_hours || 0}h / {task.estimated_hours}h
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <AvatarStack 
                                members={task.members} 
                                onMemberClick={(member) => setSelectedMember(member)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-3">
                <Folder className="h-10 w-10 text-slate-200" />
                <p className="text-sm font-medium">Select a project to view tasks</p>
              </div>
            )
          ) : (
            // ── Reports Tab Content ──────────────────────────────────────────────────────
            <div className="flex-1 overflow-y-auto p-4">
              <div className="overflow-x-auto overscroll-x-contain touch-pan-x -mx-1 px-1 mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 min-w-[480px] lg:min-w-0">
                  <StatCard label="Total" value={totalAllTasks} icon={CheckSquare} />
                  <StatCard label="Completed" value={totalAllStats.completed} icon={TrendingUp} accent="text-emerald-600" />
                  <StatCard label="In progress" value={totalAllStats.inProgress} icon={BarChart3} accent="text-indigo-600" />
                  <StatCard label="Pending" value={totalAllStats.pending} icon={Hourglass} accent="text-amber-600" />
                  <StatCard label="On hold" value={totalAllStats.hold} icon={PauseCircle} accent="text-orange-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-slate-400" />
                      Tasks by status
                    </h3>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tasksByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {tasksByStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      Tasks by employee
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {tasksByEmployeeData.length} people
                    </span>
                  </div>
                  <div className="max-h-[520px] overflow-y-auto overflow-x-hidden pr-1">
                    <div style={{ height: employeeChartHeight, minHeight: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tasksByEmployeeData} layout="vertical" margin={{ left: 4, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120}
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Folder className="h-4 w-4 text-slate-400" />
                      Tasks by project
                    </h3>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tasksByProjectData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="#0891B2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      Team workload
                    </h3>
                  </div>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamWorkloadData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="tasks" name="Tasks" fill="#059669" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="hours" name="Est. Hours" fill="#D97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MemberPopup 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
};

export default TaskDashboardPage;
