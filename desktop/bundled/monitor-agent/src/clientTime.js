function pad2(n) {
  return String(n).padStart(2, "0");
}

function clientTimeIso() {
  return new Date().toISOString();
}

/** Local calendar date for daily summary bucketing (matches user PC, not UTC). */
function clientLocalDateYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function clientTimeHeaders() {
  return {
    "X-Client-Time": clientTimeIso(),
    "X-Client-Local-Date": clientLocalDateYmd(),
  };
}

module.exports = { clientTimeIso, clientLocalDateYmd, clientTimeHeaders };
