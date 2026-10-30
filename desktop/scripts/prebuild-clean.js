const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/** Must match package.json → build.directories.output */
const OUTPUT_DIR_NAME = "installer-output";
const outputDir = path.join(__dirname, "..", OUTPUT_DIR_NAME);
const legacyReleaseDir = path.join(__dirname, "..", "release");

function killWindowsLockingProcesses() {
  if (process.platform !== "win32") return;
  const images = ["Dce task manager.exe", "Team Manager.exe", "electron.exe"];
  for (const img of images) {
    try {
      execSync(`taskkill /F /IM "${img}" /T`, { stdio: "ignore", windowsHide: true });
    } catch (_) {
      /* not running */
    }
  }
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* wait for file handles to release */
  }
}

function tryRemoveDir(dir) {
  if (!fs.existsSync(dir)) return true;

  const maxAttempts = 6;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    } catch (_) {
      sleep(400);
    }
  }
  return false;
}

killWindowsLockingProcesses();
sleep(600);

const cleaned = tryRemoveDir(outputDir);
if (cleaned) {
  console.log(`Cleaned desktop/${OUTPUT_DIR_NAME} for fresh build.`);
} else {
  const fallback = `${OUTPUT_DIR_NAME}-${Date.now()}`;
  const fallbackPath = path.join(__dirname, "..", fallback);
  fs.mkdirSync(fallbackPath, { recursive: true });
  fs.writeFileSync(
    path.join(__dirname, "..", ".builder-output-dir"),
    fallback,
    "utf8"
  );
  console.warn("");
  console.warn(`Could not clean desktop/${OUTPUT_DIR_NAME} (files in use).`);
  console.warn(`Build will use desktop/${fallback} instead.`);
  console.warn("Quit Team Manager from the tray when you can, then delete old folders manually.");
  console.warn("");
  process.exit(0);
}

if (fs.existsSync(path.join(__dirname, "..", ".builder-output-dir"))) {
  fs.unlinkSync(path.join(__dirname, "..", ".builder-output-dir"));
}

if (fs.existsSync(legacyReleaseDir)) {
  console.log(
    "Note: desktop/release/ is unused (old path). You can delete it after quitting Team Manager."
  );
}
