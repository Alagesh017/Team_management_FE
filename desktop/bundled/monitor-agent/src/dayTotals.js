const fs = require("fs");
const path = require("path");
const { app } = require("electron");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function localDateYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function storePath() {
  return path.join(app.getPath("userData"), "daily-activity-totals.json");
}

function loadDailyTotals() {
  const today = localDateYmd();
  try {
    const raw = fs.readFileSync(storePath(), "utf8");
    const data = JSON.parse(raw);
    if (data.localDate !== today) {
      return { localDate: today, active: 0, idle: 0, break: 0 };
    }
    return {
      localDate: today,
      active: Math.max(0, Number(data.active) || 0),
      idle: Math.max(0, Number(data.idle) || 0),
      break: Math.max(0, Number(data.break) || 0),
    };
  } catch (_) {
    return { localDate: today, active: 0, idle: 0, break: 0 };
  }
}

function saveDailyTotals(totals) {
  const payload = {
    localDate: localDateYmd(),
    active: Math.max(0, Number(totals.active) || 0),
    idle: Math.max(0, Number(totals.idle) || 0),
    break: Math.max(0, Number(totals.break) || 0),
  };
  fs.writeFileSync(storePath(), JSON.stringify(payload, null, 2));
  return payload;
}

/** Returns true if the calendar day rolled over and totals were reset. */
function ensureCurrentDay(totalsRef) {
  const today = localDateYmd();
  if (totalsRef.localDate === today) return false;
  totalsRef.localDate = today;
  totalsRef.active = 0;
  totalsRef.idle = 0;
  totalsRef.break = 0;
  saveDailyTotals(totalsRef);
  return true;
}

module.exports = {
  localDateYmd,
  loadDailyTotals,
  saveDailyTotals,
  ensureCurrentDay,
};
