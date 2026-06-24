const { readTodos, writeTodos, nextId } = require("../../lib/db");
const path = require("path");
const fs = require("fs");

// 加载 HTML
const HTML_PATH = path.join(__dirname, "..", "..", "public", "index.html");
let INDEX_HTML = "";
try { INDEX_HTML = fs.readFileSync(HTML_PATH, "utf-8"); } catch {}

function parseJSON(body) {
  try { return JSON.parse(body); } catch { return null; }
}

exports.handler = async (event) => {
  const pathname = event.path.replace(/^\/\.netlify\/functions\/api/, "") || "/";
  const method = event.httpMethod;
  const todos = readTodos();

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (method === "OPTIONS") return { statusCode: 204, headers, body: "" };

  try {
    // API 路由
    if (pathname === "/api/todos" || pathname === "/api/todos/") {
      if (method === "GET") {
        return { statusCode: 200, headers, body: JSON.stringify(todos) };
      }
      if (method === "POST") {
        const data = parseJSON(event.body || "{}");
        if (!data || !data.title || typeof data.title !== "string" || data.title.trim().length === 0)
          return { statusCode: 400, headers, body: JSON.stringify({ error: "标题不能为空" }) };
        const todo = {
          id: nextId(todos), title: data.title.trim(), completed: false,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        todos.push(todo); writeTodos(todos);
        return { statusCode: 201, headers, body: JSON.stringify(todo) };
      }
    }

    const match = pathname.match(/^\/api\/todos\/(\d+)\/?$/);
    if (match) {
      const id = parseInt(match[1]), idx = todos.findIndex((t) => t.id === id);
      if (idx === -1)
        return { statusCode: 404, headers, body: JSON.stringify({ error: "待办事项不存在" }) };

      if (method === "PUT") {
        const data = parseJSON(event.body || "{}");
        if (!data) return { statusCode: 400, headers, body: JSON.stringify({ error: "无效的请求数据" }) };
        if (data.title !== undefined) {
          if (typeof data.title !== "string" || data.title.trim().length === 0)
            return { statusCode: 400, headers, body: JSON.stringify({ error: "标题不能为空" }) };
          todos[idx].title = data.title.trim();
        }
        if (data.completed !== undefined) todos[idx].completed = Boolean(data.completed);
        todos[idx].updatedAt = new Date().toISOString();
        writeTodos(todos);
        return { statusCode: 200, headers, body: JSON.stringify(todos[idx]) };
      }

      if (method === "DELETE") {
        todos.splice(idx, 1); writeTodos(todos);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "删除成功" }) };
      }
    }

    // 非 API 请求 → 返回首页
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: INDEX_HTML,
    };
  } catch (err) {
    console.error("Netlify Function Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "服务器错误" }) };
  }
};
