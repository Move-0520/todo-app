# 📋 待办清单应用

一个简洁、高效的待办事项管理应用，使用纯 Node.js 构建（零外部依赖）。

## ✨ 功能

- ✅ 添加待办事项
- ✅ 标记完成 / 取消完成
- ✅ 双击编辑标题
- ✅ 删除单个事项
- ✅ 全部 / 进行中 / 已完成 筛选
- ✅ 一键清除已完成事项
- ✅ 数据持久化（JSON 文件存储）
- ✅ 中文友好界面

## 🚀 快速启动

### 方法一：直接运行（推荐）

```bash
node server.js
```

### 方法二：使用 npm

```bash
npm start
```

启动后访问 **http://localhost:3000**

## 🗂️ 项目结构

```
todo-app/
├── server.js          # 服务器入口（API + 静态文件）
├── public/
│   └── index.html     # 前端页面
├── data/
│   └── todos.json     # 数据存储（自动创建）
├── package.json       # 项目配置
└── README.md
```

## 🌐 部署指南

### 部署到 Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 框架选择 **Other**
4. 构建命令留空，输出目录留空
5. 部署完成 ✅

### 部署到 Railway

1. 推送到 GitHub
2. 在 [Railway](https://railway.app) 导入
3. 启动命令设为 `node server.js`


### 部署到自己的服务器

```bash
# 使用 PM2 管理进程（需安装 pm2）
npm install -g pm2
pm2 start server.js --name todo-app
pm2 save
```

## 📝 API 接口

| 方法   | 路径              | 说明       |
| ------ | ----------------- | ---------- |
| GET    | `/api/todos`      | 获取全部   |
| POST   | `/api/todos`      | 新增       |
| PUT    | `/api/todos/:id`  | 更新       |
| DELETE | `/api/todos/:id`  | 删除       |

## 📄 技术栈

- **后端**: Node.js (HTTP 内置模块)
- **前端**: 原生 HTML + CSS + JavaScript
- **存储**: JSON 文件
- **依赖**: 零外部依赖
