import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronDown,
  MoreVertical,
  ArrowUpRight,
  Calendar,
  LayoutGrid,
  Inbox,
  Users as UsersIcon,
  Maximize2,
  Upload,
} from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";

const workloadData = [
  { name: "Mon, Jul 28", conversations: 18 },
  { name: "Tue, Jul 29", conversations: 35 },
  { name: "Wed, Jul 30", conversations: 30 },
  { name: "Thu, Jul 31", conversations: 48 },
  { name: "Fri, Aug 1", conversations: 40 },
  { name: "Sat, Aug 2", conversations: 32 },
  { name: "Sun, Aug 3", conversations: 30 },
];

const efficiencyData = [
  { name: "Less than 15min", value: 67, color: "#6366f1" },
  { name: "15min - 45min", value: 33, color: "#c7d2fe" },
  { name: "45min - 1h", value: 0, color: "#e7e9f0" },
  { name: "1h - 2h", value: 0, color: "#e7e9f0" },
  { name: "More than 2h", value: 0, color: "#e7e9f0" },
];

// ---------- Neumorphic design tokens ----------
const BG = "#ffffff";

const NEU_RAISED =
  "rounded-[28px] bg-[#ffffff] p-5 sm:p-6 transition-all duration-300 " +
  "shadow-[8px_8px_16px_#d9dbe3,-8px_-8px_16px_#ffffff] " +
  "hover:shadow-[10px_10px_20px_#d9dbe3,-10px_-10px_20px_#ffffff]";

const NEU_INSET =
  "rounded-2xl bg-[#ffffff] shadow-[inset_5px_5px_10px_#d9dbe3,inset_-5px_-5px_10px_#ffffff]";

const NEU_PILL =
  "flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-[#ffffff] " +
  "shadow-[4px_4px_8px_#d9dbe3,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d9dbe3,inset_-3px_-3px_6px_#ffffff] " +
  "transition-shadow duration-200 whitespace-nowrap";

const NEU_CHIP =
  "flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-600 px-2.5 py-1.5 rounded-xl bg-[#ffffff] " +
  "shadow-[3px_3px_6px_#d9dbe3,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d9dbe3,inset_-2px_-2px_4px_#ffffff] " +
  "transition-shadow duration-200";

const NEU_ICON_BTN =
  "h-9 w-9 flex items-center justify-center rounded-full bg-[#ffffff] text-slate-500 " +
  "shadow-[4px_4px_8px_#d9dbe3,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#d9dbe3,inset_-3px_-3px_6px_#ffffff] transition-shadow duration-200";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="space-y-5 sm:space-y-6 p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Workload
            </h1>
            <span className="text-xs sm:text-sm text-slate-500">
              Data from up to 1 hour ago
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-300/60 pb-2 overflow-x-auto scrollbar-none">
            <button className="text-sm font-semibold text-slate-800 border-b-2 border-indigo-500 pb-2 px-1 whitespace-nowrap">
              Default
            </button>
            <button className="text-sm font-medium text-indigo-600 pb-2 px-1 whitespace-nowrap">
              Add view
            </button>
          </div>

          {/* Filters Bar — neumorphic pills, wraps on small screens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <div className={NEU_PILL}>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Jul 28, 2025 → Aug 3, 2025</span>
              <span className="inline sm:hidden">Jul 28 → Aug 3</span>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </div>
            <button className={NEU_PILL}>
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>All workspaces</span>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            </button>
            <button className={`${NEU_PILL} hidden sm:flex`}>
              <Inbox className="h-4 w-4 shrink-0" />
              <span>All shared inboxes</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            <button className={`${NEU_PILL} hidden md:flex`}>
              <UsersIcon className="h-4 w-4 shrink-0" />
              <span>All teammates</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            <button className="text-xs sm:text-sm font-medium text-indigo-600 px-1 sm:px-2 whitespace-nowrap">
              More filters
            </button>
            <div className="ml-auto">
              <button className={NEU_ICON_BTN}>
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main responsive grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-12">
          {/* Key Metrics */}
          <div className={`${NEU_RAISED} xl:col-span-4`}>
            <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
              <h3 className="font-bold text-slate-800">Key metrics</h3>
              <button className={NEU_CHIP}>
                <span className="truncate">New conversations, +2</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
              </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {[
                { label: "New conversations", value: "224", delta: "+224" },
                { label: "Reply time (avg)", value: "7m 4s", delta: "+7m 4s" },
                { label: "First reply time (avg)", value: "7m 4s", delta: "+7m 4s" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`${NEU_INSET} flex justify-between items-end p-4`}
                >
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 mb-1">
                      {metric.label}
                    </p>
                    <h4 className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {metric.value}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end text-emerald-500 font-bold">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">{metric.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workload Over Time */}
          <div className={`${NEU_RAISED} md:col-span-2 xl:col-span-8`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
              <h3 className="font-bold text-slate-800">Workload over time</h3>
              <div className="flex items-center gap-2">
                <button className={NEU_CHIP}>
                  <span>New conversations</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className={`${NEU_CHIP} hidden sm:flex`}>
                  <span>Compare</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className={NEU_ICON_BTN.replace("h-9 w-9", "h-8 w-8")}>
                  <Upload className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={`${NEU_INSET} p-3 sm:p-4`}>
              <div className="h-[220px] sm:h-[280px] lg:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workloadData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(100,116,139,0.15)"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      dy={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2c2f38",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-slate-500 font-medium">
                New conversations
              </span>
            </div>
          </div>

          {/* Busiest Times */}
          <div className={`${NEU_RAISED} xl:col-span-6`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
              <h3 className="font-bold text-slate-800">Busiest times</h3>
              <div className="flex items-center gap-2">
                <button className={NEU_CHIP}>
                  <span>New conversations</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className={NEU_ICON_BTN.replace("h-9 w-9", "h-8 w-8")}>
                  <Upload className="h-3.5 w-3.5" />
                </button>
                <button className={NEU_ICON_BTN.replace("h-9 w-9", "h-8 w-8")}>
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={`${NEU_INSET} p-3 sm:p-4 overflow-x-auto`}>
              <table className="w-full text-[10px] sm:text-xs text-center border-separate border-spacing-1 min-w-[420px]">
                <thead>
                  <tr>
                    <th className="w-10 sm:w-12"></th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <th key={day} className="font-medium text-slate-400 pb-2">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((hour) => (
                    <tr key={hour}>
                      <td className="text-right pr-2 text-slate-400 font-medium whitespace-nowrap">
                        {hour} {hour >= 9 && hour < 12 ? "AM" : "PM"}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const value = Math.floor(Math.random() * 9);
                        const filled = value > 2;
                        return (
                          <td
                            key={day}
                            className={`w-8 h-7 sm:w-10 sm:h-8 rounded-lg font-medium transition-transform hover:scale-105 ${
                              filled
                                ? "shadow-[2px_2px_4px_#d9dbe3,-2px_-2px_4px_#ffffff]"
                                : "shadow-[inset_2px_2px_4px_#d9dbe3,inset_-2px_-2px_4px_#ffffff]"
                            }`}
                            style={{
                              backgroundColor:
                                value > 5
                                  ? "#6366f1"
                                  : value > 2
                                  ? "#a5b4fc"
                                  : "#ffffff",
                              color: value > 2 ? "#fff" : "#94a3b8",
                            }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-medium text-slate-400">
              <span>0</span>
              <div className={`${NEU_INSET} h-1.5 w-20 sm:w-24 rounded-full overflow-hidden`}>
                <div className="h-full w-full bg-gradient-to-r from-slate-300 via-indigo-300 to-indigo-600"></div>
              </div>
              <span>8</span>
            </div>
          </div>

          {/* Efficiency Pie Chart */}
          <div className={`${NEU_RAISED} xl:col-span-6`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
              <h3 className="font-bold text-slate-800">Efficiency</h3>
              <div className="flex items-center gap-2">
                <button className={NEU_CHIP}>
                  <span>Reply time</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className={NEU_ICON_BTN.replace("h-9 w-9", "h-8 w-8")}>
                  <Upload className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div
                className={`h-[170px] w-[170px] sm:h-[210px] sm:w-[210px] relative shrink-0 rounded-full shadow-[inset_6px_6px_12px_#d9dbe3,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center`}
              >
                <div className="h-[150px] w-[150px] sm:h-[185px] sm:w-[185px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={efficiencyData}
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {efficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase">
                    Reply time (avg)
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    7m 4s
                  </p>
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+7m 4s</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                {efficiencyData.map((item) => (
                  <div
                    key={item.name}
                    className={`${NEU_INSET} flex items-center justify-between group px-3 py-2`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-800 transition-colors truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 shrink-0 ml-2">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;