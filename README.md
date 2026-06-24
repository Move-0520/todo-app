# 📋 待办清单应用

一个简洁、高效的待办事项管理应用，使用纯 Node.js 构建（零外部依赖）。
兼容 **Vercel** 和 **Railway** 等平台部署。

## ✨ 功能

- ✅ **添加** — 快速添加待办事项
- ✅ **完成** — 点击圆圈标记完成/取消
- ✅ **编辑** — 双击标题直接编辑
- ✅ **删除** — 鼠标悬停显示删除按钮
- ✅ **筛选** — 全部 / 进行中 / 已完成
- ✅ **清理** — 一键清除已完成事项
- ✅ **持久化** — 数据保存到文件/数据库，重启不丢失

## 🚀 本地运行

```bash
node server.js
# 或
npm start
```

访问 **http://localhost:3000**

## 🗂️ 项目结构

```
todo-app/
├── server.js          # 本地开发服务器
├── api/               # Vercel serverless 函数
│   ├── todos.js       #   GET / POST /api/todos
│   └── todos/[id].js  #   PUT / DELETE /api/todos/:id
├── lib/
│   └── db.js          # 数据库模块（JSON 文件读写）
├── public/
│   └── index.html     # 前端页面（响应式设计）
├── data/
│   └── todos.json     # 数据存储（自动创建）
├── vercel.json        # Vercel 部署配置
├── package.json
└── README.md
```

## 🌐 部署到 GitHub + Vercel

### 第一步：创建 GitHub 仓库

1. 打开 [github.com/new](https://github.com/new)
2. 仓库名填 `todo-app`，选择 **Public**（公开）
3. 不要勾选任何初始化选项（README、.gitignore、License）
4. 点击 **Create repository**

### 第二步：推送代码

创建好后，在页面会看到一段命令。复制下面这段到终端执行（**在项目目录打开终端**）：

```bash
git remote add origin https://github.com/你的用户名/todo-app.git
git branch -M main
git push -u origin main
```

> 💡 把 `你的用户名` 换成你的 GitHub 用户名

### 第三步：部署到 Vercel

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 选择 **Import Git Repository**
3. 授权 GitHub，选择 `todo-app` 仓库
4. 框架自动检测为 **Node.js**，不要改任何设置
5. 点击 **Deploy** → 等 1 分钟
6. ✅ 部署完成！会得到一个 `todo-app.vercel.app` 域名

### 可选：绑定自定义域名

在 Vercel 项目面板 → **Domains** → 输入你的域名 → 按提示配置 DNS

---

## 📄 API 文档

| 方法   | 路径              | Body                  | 说明       |
| ------ | ----------------- | --------------------- | ---------- |
| GET    | `/api/todos`      | —                     | 获取全部   |
| POST   | `/api/todos`      | `{"title": "xxx"}`    | 新增       |
| PUT    | `/api/todos/:id`  | `{"completed": true}` | 更新       |
| DELETE | `/api/todos/:id`  | —                     | 删除       |

## 📝 技术栈

- **后端**: Node.js (HTTP 内置模块 / Vercel Serverless Functions)
- **前端**: 原生 HTML + CSS + JavaScript
- **存储**: JSON 文件（本地）/ `/tmp`（Vercel）
- **依赖**: 零外部依赖
