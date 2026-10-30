const http = require("http");
const handler = require("serve-handler");

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
      handler(req, res, { public: webRoot });
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
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

module.exports = { startBundledWebServer, getBundledWebPort };
