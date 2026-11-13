const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const MAX_QUEUE = 200;

class EventQueue {
  constructor() {
    this.filePath = path.join(app.getPath("userData"), "monitor-event-queue.json");
    this.items = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      }
    } catch (_) {
      /* ignore corrupt queue */
    }
    return [];
  }

  _persist() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.items.slice(-MAX_QUEUE)));
  }

  push(item) {
    this.items.push(item);
    if (this.items.length > MAX_QUEUE) {
      this.items = this.items.slice(-MAX_QUEUE);
    }
    this._persist();
  }

  drain() {
    const copy = [...this.items];
    this.items = [];
    this._persist();
    return copy;
  }

  size() {
    return this.items.length;
  }
}

module.exports = { EventQueue };
