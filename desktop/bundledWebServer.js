const http = require("http");
const handler = require("serve-handler");
const { isPackagedApp } = require("./paths");

/** Fixed port so localStorage origin stays the same between app restarts. */
const DEFAULT_PORT = 17890;

let activeServer = null;
let activeUrl = null;

function getBundledWebPort() {
  const fromEnv = parseInt(process.env.BUNDLED_WEB_PORT || "", 10);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_PORT;
}

function startBundledWebServer(webRoot) {
  if (activeServer && activeUrl) {
    return Promise.resolve(activeUrl);
  }

  const port = getBundledWebPort();

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const devNoCache = !isPackagedApp();
      handler(req, res, {
        public: webRoot,
        headers: devNoCache
          ? [{ source: "**/*", headers: [{ key: "Cache-Control", value: "no-store" }] }]
          : [],
      });
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (!isPackagedApp()) {
          reject(
            new Error(
              `Port ${port} is in use. Quit Dce task manager completely (check the system tray), then run npm run desktop:app again.`
            )
          );
          return;
        }
        activeUrl = `http://127.0.0.1:${port}/`;
        resolve(activeUrl);
        return;
      }
      reject(err);
    });

    server.listen(port, "127.0.0.1", () => {
      activeServer = server;
      activeUrl = `http://127.0.0.1:${port}/`;
      resolve(activeUrl);
    });
  });
}

function stopBundledWebServer() {
  if (activeServer) {
    try {
      activeServer.close();
    } catch (_) {
      /* ignore */
    }
    activeServer = null;
    activeUrl = null;
  }
}

module.exports = { startBundledWebServer, getBundledWebPort, stopBundledWebServer };
