const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const desktopRoot = path.join(__dirname, "..");
let output = "installer-output";

const overrideFile = path.join(desktopRoot, ".builder-output-dir");
if (fs.existsSync(overrideFile)) {
  output = fs.readFileSync(overrideFile, "utf8").trim() || output;
}

const dirOnly = process.argv.includes("--dir");
const builderArgs = [
  "electron-builder",
  ...(dirOnly ? ["--dir"] : ["--win"]),
  `--config.directories.output=${output}`,
];

const result = spawnSync("npx", builderArgs, {
  cwd: desktopRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
