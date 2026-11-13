const fs = require("fs");
const path = require("path");

const desktopRoot = path.join(__dirname, "..");
const agentRoot = path.join(desktopRoot, "..", "..", "employee-monitor-agent");
const bundleRoot = path.join(desktopRoot, "bundled", "monitor-agent");

const pairs = [
  {
    from: path.join(agentRoot, "src"),
    to: path.join(bundleRoot, "src"),
  },
  {
    from: path.join(agentRoot, "config.default.js"),
    to: path.join(bundleRoot, "config.default.js"),
  },
];

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

for (const { from, to } of pairs) {
  if (!fs.existsSync(from)) {
    console.error("Missing monitor agent source:", from);
    process.exit(1);
  }
  if (fs.statSync(from).isDirectory()) {
    fs.rmSync(to, { recursive: true, force: true });
    copyRecursive(from, to);
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

console.log("Synced monitor agent into desktop/bundled/monitor-agent");
