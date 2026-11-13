const http = require("http");

/**
 * Local POST http://127.0.0.1:<port>/unpair — instant unpair when user logs out on web.
 */
function startLocalUnpairServer(port, onUnpair) {
  if (!port || port <= 0) return null;
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === "POST" && req.url === "/unpair") {
      Promise.resolve(onUnpair("Logged out on the web. Generate a new pairing code and enter it here."))
        .then(() => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("ok");
        })
        .catch(() => {
          res.writeHead(500);
          res.end("error");
        });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, "127.0.0.1", () => {
    /* ready */
  });
  server.on("error", () => {
    /* port in use — protocol fallback still works */
  });
  return server;
}

module.exports = { startLocalUnpairServer };
