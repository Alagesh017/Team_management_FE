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
const doPublish = process.argv.includes("--publish");
const builderArgs = [
  "electron-builder",
  ...(dirOnly ? ["--dir"] : ["--win"]),
  ...(doPublish ? ["--publish", "always"] : []),
  `--config.directories.output=${output}`,
];

const sync = spawnSync("node", ["scripts/sync-monitor-agent.js"], {
  cwd: desktopRoot,
  stdio: "inherit",
  shell: true,
});
if (sync.status !== 0) {
  process.exit(sync.status ?? 1);
}

const verify = spawnSync("node", ["scripts/verify-monitor-agent.js"], {
  cwd: desktopRoot,
  stdio: "inherit",
  shell: true,
});
if (verify.status !== 0) {
  process.exit(verify.status ?? 1);
}

const result = spawnSync("npx", builderArgs, {
  cwd: desktopRoot,
  stdio: "inherit",
  shell: true,
});

if (result.status === 0) {
  const setup = fs
    .readdirSync(path.join(desktopRoot, output), { withFileTypes: true })
    .flatMap((d) => {
      if (!d.isFile()) return [];
      if (!d.name.endsWith(".exe") || d.name.includes("unpacked")) return [];
      return [path.join(desktopRoot, output, d.name)];
    });
  fs.writeFileSync(
    path.join(desktopRoot, "LATEST-BUILD.txt"),
  [
      `Installer output: desktop/${output}/`,
      setup.length ? `Setup: ${setup[0]}` : "Setup: (run pack --dir only; no installer exe)",
      `Built: ${new Date().toISOString()}`,
    ].join("\n"),
    "utf8"
  );
  console.log("");
  console.log("==> Install this build:", path.join(desktopRoot, output));
  if (setup.length) console.log("==> Setup exe:", setup[0]);
  console.log("");
}

process.exit(result.status ?? 1);
