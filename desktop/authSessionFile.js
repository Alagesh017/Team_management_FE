const fs = require("fs");
const path = require("path");
const { app } = require("electron");

function authSessionPath() {
  return path.join(app.getPath("userData"), "auth-session.json");
}

function loadAuthSessionFile() {
  try {
    const raw = fs.readFileSync(authSessionPath(), "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function saveAuthSessionFile(user) {
  fs.writeFileSync(authSessionPath(), JSON.stringify(user, null, 2), "utf8");
}

function clearAuthSessionFile() {
  try {
    if (fs.existsSync(authSessionPath())) {
      fs.unlinkSync(authSessionPath());
    }
  } catch (_) {
    /* ignore */
  }
}

module.exports = {
  loadAuthSessionFile,
  saveAuthSessionFile,
  clearAuthSessionFile,
};
