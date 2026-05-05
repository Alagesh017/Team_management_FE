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
  Cell
} from "recharts";
import { 
  ChevronDown, 
  Filter, 
  MoreVertical, 
  ArrowUpRight,
  Calendar,
  LayoutGrid,
  Inbox,
  Users as UsersIcon,
  Maximize2,
  Upload
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
  { name: "Less than 15min", value: 67, color: "#000000" },
  { name: "15min - 45min", value: 33, color: "#e2e8f0" },
  { name: "45min - 1h", value: 0, color: "#f1f5f9" },
  { name: "1h - 2h", value: 0, color: "#f1f5f9" },
  { name: "More than 2h", value: 0, color: "#f1f5f9" },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 bg-slate-50/50 p-6 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Workload</h1>
          <span className="text-sm text-slate-400 mt-2">Data from up to 1 hour ago</span>
        </div>
        
        <div className="flex items-center gap-6 border-b border-slate-200 pb-2">
          <button className="text-sm font-semibold border-b-2 border-slate-900 pb-2 px-1">Default</button>
          <button className="text-sm font-medium text-blue-600 pb-2 px-1">Add view</button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Jul 28, 2025 → Aug 3, 2025</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium">
            <LayoutGrid className="h-4 w-4" />
            <span>All workspaces</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium">
            <Inbox className="h-4 w-4" />
            <span>All shared inboxes</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium">
            <UsersIcon className="h-4 w-4" />
            <span>All teammates</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="text-sm font-medium text-blue-600 px-2">More filters</button>
          <div className="ml-auto">
            <MoreVertical className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Key Metrics */}
        <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Key metrics</h3>
            <button className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded border">
              New conversations, +2 <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500 mb-1">New conversations</p>
                <h4 className="text-4xl font-bold text-slate-900">224</h4>
              </div>
              <div className="flex flex-col items-end text-emerald-500 font-bold">
                <ArrowUpRight className="h-5 w-5" />
                <span>+224</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500 mb-1">Reply time (avg)</p>
                <h4 className="text-4xl font-bold text-slate-900">7m 4s</h4>
              </div>
              <div className="flex flex-col items-end text-emerald-500 font-bold">
                <ArrowUpRight className="h-5 w-5" />
                <span>+7m 4s</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500 mb-1">First reply time (avg)</p>
                <h4 className="text-4xl font-bold text-slate-900">7m 4s</h4>
              </div>
              <div className="flex flex-col items-end text-emerald-500 font-bold">
                <ArrowUpRight className="h-5 w-5" />
                <span>+7m 4s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workload Over Time */}
        <div className="md:col-span-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Workload over time</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded border">
                New conversations <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded border">
                Compare <ChevronDown className="h-3 w-3" />
              </button>
              <Upload className="h-4 w-4 text-slate-400 ml-1" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#000000" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="h-3 w-3 rounded-full bg-slate-900"></div>
            <span className="text-xs text-slate-500 font-medium">New conversations</span>
          </div>
        </div>

        {/* Busiest Times */}
        <div className="md:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Busiest times</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded border">
                New conversations <ChevronDown className="h-3 w-3" />
              </button>
              <Upload className="h-4 w-4 text-slate-400 ml-1" />
              <Maximize2 className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <th key={day} className="font-medium text-slate-400 pb-2">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map(hour => (
                  <tr key={hour}>
                    <td className="text-right pr-2 text-slate-400 font-medium whitespace-nowrap">
                      {hour} {hour >= 9 && hour < 12 ? 'AM' : 'PM'}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => {
                      const value = Math.floor(Math.random() * 9);
                      let opacity = value / 10;
                      return (
                        <td 
                          key={day} 
                          className="w-10 h-8 rounded-sm font-medium"
                          style={{ 
                            backgroundColor: value > 5 ? '#1e293b' : value > 2 ? '#64748b' : '#f1f5f9',
                            color: value > 5 ? '#fff' : value > 2 ? '#fff' : '#94a3b8'
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
            <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-slate-100 via-slate-500 to-slate-900"></div>
            <span>8</span>
          </div>
        </div>

        {/* Efficiency Pie Chart */}
        <div className="md:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Efficiency</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded border">
                Reply time <ChevronDown className="h-3 w-3" />
              </button>
              <Upload className="h-4 w-4 text-slate-400 ml-1" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[200px] w-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={efficiencyData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {efficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase">Reply time (avg)</p>
                <p className="text-xl font-bold text-slate-900">7m 4s</p>
                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+7m 4s</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 w-full">
              {efficiencyData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-500 group-hover:text-slate-900 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
