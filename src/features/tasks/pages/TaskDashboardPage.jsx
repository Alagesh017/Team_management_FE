import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { taskService } from "../services/taskService";

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

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, color }) => (
  <div className="bg-slate-50 rounded-lg px-4 py-3 flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </span>
    <span className={`text-2xl font-black ${color || "text-slate-900"}`}>
      {value}
    </span>
  </div>
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
  console.log("getFullAvatarUrl input:", avatarUrl);
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    console.log("Returning full URL:", avatarUrl);
    return avatarUrl;
  }
  const baseUrl = import.meta.env.VITE_API_URL;
  // If avatarUrl already starts with /src/assets or src/assets, just append to baseUrl
  let fullUrl;
  if (avatarUrl.startsWith('/src/assets')) {
    fullUrl = `${baseUrl}${avatarUrl}`;
  } else if (avatarUrl.startsWith('src/assets')) {
    fullUrl = `${baseUrl}/${avatarUrl}`;
  } else {
    fullUrl = `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }
  console.log("Returning constructed URL:", fullUrl);
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
        {/* Avatar */}
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
        
        {/* Name */}
        <div className="text-center">
          <h3 className="font-bold text-slate-800 text-lg">{fullName}</h3>
          {typeof member === "object" && member.email && (
            <p className="text-xs text-slate-500 mt-1">{member.email}</p>
          )}
        </div>

        {/* Close button */}
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
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Derived state
  const activeGroup = dashboardData?.groups?.find((g) => g.id === activeGroupId);
  const activeProject = activeGroup?.projects?.find((p) => p.id === activeProjectId);

  const filteredTasks = filterPriority
    ? (activeProject?.tasks || []).filter(
        (t) => t.priority?.toLowerCase() === filterPriority
      )
    : activeProject?.tasks || [];

  // Stats
  const totalTasks = activeProject?.tasks?.length || 0;
  const highCount = activeProject?.tasks?.filter(
    (t) => t.priority?.toLowerCase() === "high"
  ).length || 0;
  const mediumCount = activeProject?.tasks?.filter(
    (t) => t.priority?.toLowerCase() === "medium"
  ).length || 0;
  const lowCount = activeProject?.tasks?.filter(
    (t) => t.priority?.toLowerCase() === "low"
  ).length || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await taskService.getDashboardTasks();
        console.log("Dashboard data:", data);
        console.log("First group projects and tasks:", data?.groups?.[0]?.projects);
        setDashboardData(data);
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
    const group = dashboardData?.groups?.find((g) => g.id === groupId);
    setActiveProjectId(group?.projects?.[0]?.id || null);
  };

  const handleProjectSelect = (projectId) => {
    setActiveProjectId(projectId);
    setFilterPriority(null);
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

      {/* ── Top Bar: Groups ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 bg-white border-b border-slate-200 px-4 shrink-0 overflow-x-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-4 mr-1 border-r border-slate-200 py-3 shrink-0">
          <LayoutDashboard className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800 tracking-tight">Tasks</span>
        </div>

        {/* Group tabs */}
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

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Projects: Dropdown on small, Sidebar on medium+ ────────────────── */}
        <div className="w-full md:w-52 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200">
          {/* Small screens: Dropdown */}
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

          {/* Medium+ screens: Sidebar */}
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

        {/* ── Main: Table ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {activeProject ? (
            <>
              {/* Stats strip */}
              <div className="hidden lg:grid grid-cols-4 gap-3 px-5 py-3 bg-white border-b border-slate-200 shrink-0">
                <StatCard label="Total Tasks" value={totalTasks} />
                <StatCard label="High Priority" value={highCount} color="text-red-600" />
                <StatCard label="Medium Priority" value={mediumCount} color="text-amber-600" />
                <StatCard label="Low Priority" value={lowCount} color="text-emerald-600" />
              </div>

              {/* Table header bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0 gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeProject.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeGroup?.name} · {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Priority filters */}
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
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
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
                          {/* Task name + description */}
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

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusBadge
                              name={task.status_name || task.status}
                              color={task.status_color}
                            />
                          </td>

                          {/* Priority */}
                          <td className="px-4 py-3">
                            <PriorityBadge priority={task.priority} />
                          </td>

                          {/* Start date */}
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

                          {/* Due date */}
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

                          {/* Hours */}
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

                          {/* Members */}
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
            /* No project selected */
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-3">
              <Folder className="h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium">Select a project to view tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Member Popup */}
      <MemberPopup 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
};

export default TaskDashboardPage;
