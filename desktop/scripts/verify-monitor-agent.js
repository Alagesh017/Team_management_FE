const fs = require("fs");
const path = require("path");

const desktopRoot = path.join(__dirname, "..");
const bundleRoot = path.join(desktopRoot, "bundled", "monitor-agent");
const agentRoot = path.join(desktopRoot, "..", "..", "employee-monitor-agent");

const required = [
  path.join(bundleRoot, "config.default.js"),
  path.join(bundleRoot, "src", "monitorHost.js"),
  path.join(bundleRoot, "src", "apiClient.js"),
];

const missing = required.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error("");
  console.error("Desktop build blocked: bundled monitor agent is incomplete.");
  console.error("Bundle path:", bundleRoot);
  for (const p of missing) {
    console.error("  -", path.relative(bundleRoot, p));
  }
  if (!fs.existsSync(path.join(agentRoot, "src", "monitorHost.js"))) {
    console.error("");
    console.error("Also missing employee-monitor-agent at:", agentRoot);
  } else {
    console.error("");
    console.error("Run: node scripts/sync-monitor-agent.js");
  }
  process.exit(1);
}

console.log("Bundled monitor agent OK:", bundleRoot);
