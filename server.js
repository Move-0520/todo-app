const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { readTodos, writeTodos, nextId } = require("./lib/db");

const PORT = process.env.PORT || 3000;

// 内嵌 HTML（这样 Railway 就不会检测为静态网站了）
const INDEX_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>待办清单</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px;color:#1e293b}
    .container{max-width:640px;margin:40px auto;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-radius:24px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.15)}
    header{text-align:center;margin-bottom:32px}
    header h1{font-size:2rem;font-weight:700;color:#1e293b;margin-bottom:4px}
    header p{color:#94a3b8;font-size:.95rem}
    .add-form{display:flex;gap:12px;margin-bottom:28px}
    .add-form input{flex:1;padding:12px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:1rem;outline:none;transition:border-color .2s}
    .add-form input:focus{border-color:#667eea}
    .add-form button{padding:12px 24px;background:#667eea;color:white;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
    .add-form button:hover{background:#5a67d8;transform:translateY(-1px);box-shadow:0 4px 12px rgba(102,126,234,0.4)}
    .add-form button:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
    .filter-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}
    .filter-buttons{display:flex;gap:6px}
    .filter-btn{padding:6px 14px;border:1.5px solid #e2e8f0;border-radius:8px;background:white;color:#64748b;font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s}
    .filter-btn:hover{border-color:#667eea;color:#667eea}
    .filter-btn.active{background:#667eea;color:white;border-color:#667eea}
    .filter-count{font-size:.85rem;color:#94a3b8}
    .filter-count strong{color:#667eea}
    .todo-list{display:flex;flex-direction:column;gap:8px}
    .todo-empty{text-align:center;padding:48px 20px;color:#94a3b8}
    .todo-empty .icon{font-size:3rem;margin-bottom:8px}
    .todo-empty p{font-size:1.05rem}
    .todo-item{display:flex;align-items:center;gap:12px;padding:14px 16px;background:white;border:1.5px solid #f1f5f9;border-radius:12px;transition:all .2s}
    .todo-item:hover{border-color:#e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .todo-item.completed{opacity:.7}
    .checkbox{width:22px;height:22px;border:2px solid #cbd5e1;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s}
    .checkbox:hover{border-color:#667eea}
    .checkbox.checked{background:#22c55e;border-color:#22c55e}
    .checkbox.checked::after{content:"✓";color:white;font-size:13px;font-weight:bold}
    .todo-title{flex:1;font-size:1rem;color:#1e293b;cursor:pointer;word-break:break-word}
    .todo-item.completed .todo-title{text-decoration:line-through;color:#94a3b8}
    .edit-input{flex:1;padding:6px 10px;border:2px solid #667eea;border-radius:8px;font-size:1rem;outline:none}
    .actions{display:flex;gap:4px;opacity:0;transition:opacity .2s}
    .todo-item:hover .actions{opacity:1}
    .action-btn{padding:6px;background:none;border:none;border-radius:8px;cursor:pointer;color:#94a3b8;transition:all .15s;display:flex;align-items:center;justify-content:center}
    .action-btn.edit:hover{background:#eef2ff;color:#667eea}
    .action-btn.delete:hover{background:#fef2f2;color:#ef4444}
    footer{text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9}
    .clear-btn{background:none;border:none;color:#94a3b8;font-size:.85rem;cursor:pointer;transition:color .2s}
    .clear-btn:hover{color:#ef4444}
    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:12px 24px;border-radius:12px;font-size:.9rem;opacity:0;transition:opacity .3s;pointer-events:none}
    .toast.show{opacity:1}
    .error-banner{display:none;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;color:#dc2626;font-size:.9rem;margin-bottom:16px}
    .error-banner.show{display:flex;justify-content:space-between;align-items:center}
    .error-banner button{background:none;border:none;color:#dc2626;text-decoration:underline;font-size:.9rem}
    .loading{text-align:center;padding:40px;color:#94a3b8}
    .spinner{display:inline-block;width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#667eea;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:8px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:640px){.container{padding:24px 16px;margin:20px auto;border-radius:16px}header h1{font-size:1.5rem}.add-form{flex-direction:column}.add-form button{width:100%}}
  </style>
</head>
<body>
  <div class="container">
    <header><h1>📋 待办清单</h1><p>管理你的日常任务，提高效率</p></header>
    <div class="error-banner" id="errorBanner"><span id="errorText"></span><button onclick="loadTodos()">重试</button></div>
    <form class="add-form" id="addForm">
      <input type="text" id="addInput" placeholder="添加新的待办事项..." autofocus />
      <button type="submit" id="addBtn">添加</button>
    </form>
    <div class="filter-bar">
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">全部</button>
        <button class="filter-btn" data-filter="active" onclick="setFilter('active')">进行中</button>
        <button class="filter-btn" data-filter="completed" onclick="setFilter('completed')">已完成</button>
      </div>
      <span class="filter-count" id="filterCount"></span>
    </div>
    <div id="todoList" class="todo-list"><div class="loading"><div class="spinner"></div><p>加载中...</p></div></div>
    <footer id="footer" style="display:none"><button class="clear-btn" onclick="clearCompleted()">清除已完成事项</button></footer>
  </div>
  <div class="toast" id="toast"></div>
  <script>
    let todos=[],currentFilter="all";
    const el=t=>document.getElementById(t),todoList=el("todoList"),addForm=el("addForm"),addInput=el("addInput"),addBtn=el("addBtn"),errorBanner=el("errorBanner"),errorText=el("errorText"),filterCount=el("filterCount"),footer=el("footer"),toast=el("toast");
    async function api(m,p,b){const o={method:m,headers:{"Content-Type":"application/json"}};if(b)o.body=JSON.stringify(b);const r=await fetch(p),d=await r.json();if(!r.ok)throw new Error(d.error||"请求失败");return d}
    function showToast(m){toast.textContent=m;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2500)}
    async function loadTodos(){todoList.innerHTML='<div class="loading"><div class="spinner"></div><p>加载中...</p></div>';errorBanner.classList.remove("show");try{todos=await api("GET","/api/todos");render()}catch(e){errorText.textContent="无法加载待办事项："+e.message;errorBanner.classList.add("show");todoList.innerHTML='<div class="todo-empty"><div class="icon">😢</div><p>加载失败</p></div>'}}
    addForm.addEventListener("submit",async e=>{e.preventDefault();const t=addInput.value.trim();if(!t)return;addBtn.disabled=true;addBtn.textContent="添加中...";try{const o=await api("POST","/api/todos",{title:t});todos.unshift(o);addInput.value="";addInput.focus();render();showToast("✅ 添加成功")}catch(e){showToast("❌ "+e.message)}finally{addBtn.disabled=false;addBtn.textContent="添加"}});
    async function toggleTodo(i){const t=todos.find(t=>t.id===i);if(!t)return;try{const u=await api("PUT",'/api/todos/'+i,{completed:!t.completed});Object.assign(t,u);render()}catch(e){showToast("❌ "+e.message)}}
    async function deleteTodo(i){if(!confirm("确定删除这个待办事项吗？"))return;try{await api("DELETE",'/api/todos/'+i);todos=todos.filter(t=>t.id!==i);render();showToast("🗑️ 已删除")}catch(e){showToast("❌ "+e.message)}}
    async function saveEdit(i,n){const t=n.trim();if(!t)return;try{const u=await api("PUT",'/api/todos/'+i,{title:t});const o=todos.find(t=>t.id===i);if(o)Object.assign(o,u);render()}catch(e){showToast("❌ "+e.message)}}
    function startEdit(i){const t=todos.find(t=>t.id===i);if(!t||t.completed)return;const items=document.querySelectorAll(".todo-item");for(const item of items){if(parseInt(item.dataset.id)===i){const titleEl=item.querySelector(".todo-title"),old=titleEl.textContent,inp=document.createElement("input");inp.type="text";inp.className="edit-input";inp.value=old;const finish=s=>{if(s&&inp.value.trim())saveEdit(i,inp.value);else render()};inp.addEventListener("keydown",e=>{if(e.key==="Enter")finish(true);if(e.key==="Escape")finish(false)});inp.addEventListener("blur",()=>finish(true));titleEl.replaceWith(inp);inp.focus();inp.select();break}}}
    async function clearCompleted(){const c=todos.filter(t=>t.completed);if(!c.length)return;if(!confirm("确定清除 "+c.length+" 项已完成事项？"))return;for(const t of c){try{await api("DELETE",'/api/todos/'+t.id)}catch{}}todos=todos.filter(t=>!t.completed);render();showToast("🧹 已清除完成事项")}
    function setFilter(f){currentFilter=f;document.querySelectorAll(".filter-btn").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));render()}
    function render(){const f=todos.filter(t=>{if(currentFilter==="active")return!t.completed;if(currentFilter==="completed")return t.completed;return true});const a=todos.filter(t=>!t.completed).length,d=todos.filter(t=>t.completed).length;filterCount.innerHTML=a>0?"还剩 <strong>"+a+"</strong> 项待完成":todos.length>0?"全部完成 🎉":"";footer.style.display=d>0?"block":"none";if(!f.length){const e=currentFilter==="all"?"📝":currentFilter==="active"?"🎉":"📭",m=currentFilter==="all"?"还没有待办事项，添加一个吧！":currentFilter==="active"?"所有事项都已完成！太棒了 🎉":"还没有已完成的事项";todoList.innerHTML='<div class="todo-empty"><div class="icon">'+e+"</div><p>"+m+"</p></div>";return}todoList.innerHTML=f.map(t=>'<div class="todo-item'+(t.completed?" completed":"")+'" data-id="'+t.id+'"><div class="checkbox'+(t.completed?" checked":"")+'" onclick="toggleTodo('+t.id+')"></div><span class="todo-title" ondblclick="startEdit('+t.id+')">'+esc(t.title)+'</span><div class="actions">'+(t.completed?"":'<button class="action-btn edit" onclick="startEdit('+t.id+')" title="编辑"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>')+'<button class="action-btn delete" onclick="deleteTodo('+t.id+')" title="删除"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></div>').join("")}
    function esc(t){const d=document.createElement("div");d.textContent=t;return d.innerHTML}
    loadTodos();
  </script>
</body>
</html>`;

// ----- API Router -----
function parseJSON(body) {
  try { return JSON.parse(body); }
  catch { return null; }
}

function handleAPI(req, res, parsed) {
  const method = req.method;
  const pathname = parsed.pathname;
  const todos = readTodos();
  function json(data, status) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  }
  if (method === "GET" && pathname === "/api/todos") return json(todos, 200);
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
    const id = parseInt(putMatch[1]), idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return json({ error: "待办事项不存在" }, 404);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = parseJSON(body);
      if (!data) return json({ error: "无效的请求数据" }, 400);
      if (data.title !== undefined) {
        if (typeof data.title !== "string" || data.title.trim().length === 0) return json({ error: "标题不能为空" }, 400);
        todos[idx].title = data.title.trim();
      }
      if (data.completed !== undefined) todos[idx].completed = Boolean(data.completed);
      todos[idx].updatedAt = new Date().toISOString();
      writeTodos(todos);
      json(todos[idx], 200);
    });
    return;
  }
  const delMatch = pathname.match(/^\/api\/todos\/(\d+)$/);
  if (method === "DELETE" && delMatch) {
    const id = parseInt(delMatch[1]), idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return json({ error: "待办事项不存在" }, 404);
    todos.splice(idx, 1); writeTodos(todos);
    return json({ message: "删除成功" }, 200);
  }
  json({ error: "接口不存在" }, 404);
}

// ----- Main Server -----
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (parsed.pathname.startsWith("/api/")) return handleAPI(req, res, parsed);
  // 所有非 API 请求都返回首页
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(INDEX_HTML);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("✅ 待办清单应用已启动! http://localhost:" + PORT);
});

