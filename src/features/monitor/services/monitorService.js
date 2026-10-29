import api from "../../../core/interceptors/axiosInterceptor";
import { withClientTime } from "../../../core/utils/clientTime";

const monitorService = {
  getPolicy: async () => {
    const { data } = await api.get("/monitor/policy");
    return data;
  },
  createPairingCode: async () => {
    const { data } = await api.post("/monitor/pairing/code", withClientTime({}));
    return data;
  },
  getMyToday: async () => {
    const { data } = await api.get("/monitor/me/today");
    return data;
  },
  getManagerLive: async () => {
    const { data } = await api.get("/monitor/manager/live");
    return data;
  },
  getDailyReport: async (params) => {
    const { data } = await api.get("/monitor/manager/reports/daily", { params });
    return data;
  },
  getTimeline: async (employeeId, date) => {
    const { data } = await api.get(`/monitor/manager/employees/${employeeId}/timeline`, {
      params: { date },
    });
    return data;
  },
  getAnalyticsOverview: async (date) => {
    const { data } = await api.get("/monitor/analytics/overview", {
      params: date ? { date } : {},
    });
    return data;
  },
  getUserInsight: async (userId, date) => {
    const { data } = await api.get(`/monitor/analytics/users/${userId}`, {
      params: date ? { date } : {},
    });
    return data;
  },
  revokeMyDevices: async () => {
    const { data } = await api.post("/monitor/devices/revoke-mine", withClientTime({}));
    return data;
  },
};

export default monitorService;

export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
