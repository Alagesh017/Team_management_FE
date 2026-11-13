const { getConfig } = require("../config.default");
const { clientTimeIso, clientTimeHeaders } = require("./clientTime");

class ApiClient {
  constructor(getCredentials) {
    this.getCredentials = getCredentials;
  }

  get baseUrl() {
    return getConfig().apiBaseUrl;
  }

  _headers(includeDeviceAuth = true) {
    const headers = {
      "Content-Type": "application/json",
      ...clientTimeHeaders(),
    };
    if (!includeDeviceAuth) return headers;
    const creds = this.getCredentials();
    if (!creds?.device_uuid || !creds?.device_token) {
      throw new Error("Device not paired");
    }
    headers.Authorization = `Device ${creds.device_uuid}:${creds.device_token}`;
    return headers;
  }

  async _json(res, fallbackMsg) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || `${fallbackMsg} (${res.status})`);
    return data;
  }

  async registerDevice(body) {
    const res = await fetch(`${this.baseUrl}/monitor/devices/register`, {
      method: "POST",
      headers: this._headers(false),
      body: JSON.stringify({
        ...body,
        client_time: clientTimeIso(),
      }),
    });
    return this._json(res, "Register failed");
  }

  async startSession(taskId) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/start`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({
        task_id: taskId ?? null,
        client_time: clientTimeIso(),
      }),
    });
    return this._json(res, "Start session failed");
  }

  async heartbeat(sessionId, payload) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/${sessionId}/heartbeat`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({
        ...payload,
        client_time: clientTimeIso(),
      }),
    });
    return this._json(res, "Heartbeat failed");
  }

  async postEvents(sessionId, events) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/${sessionId}/events`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({
        events,
        client_time: clientTimeIso(),
      }),
    });
    return this._json(res, "Events failed");
  }

  async endSession(sessionId) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/${sessionId}/end`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({ client_time: clientTimeIso() }),
    });
    return this._json(res, "End session failed");
  }

  async breakStart(sessionId) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/${sessionId}/break/start`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({ client_time: clientTimeIso() }),
    });
    return this._json(res, "Break start failed");
  }

  async breakEnd(sessionId) {
    const res = await fetch(`${this.baseUrl}/monitor/sessions/${sessionId}/break/end`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({ client_time: clientTimeIso() }),
    });
    return this._json(res, "Break end failed");
  }
}

module.exports = { ApiClient };
