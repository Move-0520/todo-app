const { readTodos, writeTodos, nextId } = require("../lib/db");

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === "GET") {
      const todos = readTodos();
      return res.status(200).json(todos);
    }

    if (req.method === "POST") {
      const { title } = req.body || {};
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "标题不能为空" });
      }
      const todos = readTodos();
      const todo = {
        id: nextId(todos),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      todos.push(todo);
      writeTodos(todos);
      return res.status(201).json(todo);
    }

    res.status(404).json({ error: "接口不存在" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
};
