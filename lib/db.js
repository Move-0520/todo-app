const fs = require("fs");
const path = require("path");

// 在 Vercel 上用 /tmp，本地用 data/ 目录
const DATA_DIR = process.env.VERCEL
  ? "/tmp/data"
  : path.join(__dirname, "..", "data");

const DATA_FILE = path.join(DATA_DIR, "todos.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readTodos() {
  ensureDir();
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTodos(todos) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");
}

function nextId(todos) {
  return todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
}

module.exports = { readTodos, writeTodos, nextId, DATA_FILE };
