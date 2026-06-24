const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { readTodos, writeTodos, nextId } = require("./lib/db");

const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

// ----- MIME types -----
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ----- API Router -----
function parseJSON(body) {
  try { return JSON.parse(body); }
  catch { return null; }
}

function handleAPI(req, res, parsed) {
  const method = req.method;
  const pathname = parsed.pathname;
  const todos = readTodos();

  function json(data, status = 200) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  }

  if (method === "GET" && pathname === "/api/todos") return json(todos);

  if (method === "POST" && pathname === "/api/todos") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = parseJSON(body);
      if (!data || !data.title || typeof data.title !== "string" || data.title.trim().length === 0)
        return json({ error: "标题不能为空" }, 400);
      const todo = {
        id: nextId(todos), title: data.title.trim(), completed: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      todos.push(todo);
      writeTodos(todos);
      json(todo, 201);
    });
    return;
  }

  const putMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (method === "PUT" && putMatch) {
    const id = parseInt(putMatch[1]);
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return json({ error: "待办事项不存在" }, 404);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = parseJSON(body);
      if (!data) return json({ error: "无效的请求数据" }, 400);
      if (data.title !== undefined) {
        if (typeof data.title !== "string" || data.title.trim().length === 0)
          return json({ error: "标题不能为空" }, 400);
        todos[idx].title = data.title.trim();
      }
      if (data.completed !== undefined) todos[idx].completed = Boolean(data.completed);
      todos[idx].updatedAt = new Date().toISOString();
      writeTodos(todos);
      json(todos[idx]);
    });
    return;
  }

  const delMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (method === "DELETE" && delMatch) {
    const id = parseInt(delMatch[1]);
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return json({ error: "待办事项不存在" }, 404);
    todos.splice(idx, 1);
    writeTodos(todos);
    json({ message: "删除成功" });
    return;
  }

  json({ error: "接口不存在" }, 404);
}

// ----- Static file server -----
function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (err2, data2) => {
        if (err2) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found"); return; }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data2);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// ----- Main Server -----
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (parsed.pathname.startsWith("/api/")) handleAPI(req, res, parsed);
  else serveStatic(res, parsed.pathname === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, parsed.pathname));
});

server.listen(PORT, () => {
  console.log(`✅ 待办清单应用已启动！ http://localhost:${PORT}`);
});
