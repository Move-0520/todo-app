const { readTodos, writeTodos } = require("../../lib/db");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  const todoId = parseInt(req.query.id);

  try {
    const todos = readTodos();
    const idx = todos.findIndex((t) => t.id === todoId);
    if (idx === -1) return res.status(404).json({ error: "待办事项不存在" });

    if (req.method === "PUT") {
      const { title, completed } = req.body || {};
      if (title !== undefined) {
        if (typeof title !== "string" || title.trim().length === 0)
          return res.status(400).json({ error: "标题不能为空" });
        todos[idx].title = title.trim();
      }
      if (completed !== undefined) todos[idx].completed = Boolean(completed);
      todos[idx].updatedAt = new Date().toISOString();
      writeTodos(todos);
      return res.status(200).json(todos[idx]);
    }

    if (req.method === "DELETE") {
      todos.splice(idx, 1);
      writeTodos(todos);
      return res.status(200).json({ message: "删除成功" });
    }

    res.status(404).json({ error: "接口不存在" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "服务器错误" });
  }
};
