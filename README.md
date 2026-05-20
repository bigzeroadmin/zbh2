# 正版化软件管理平台

基于 Node.js + React + SQLite 的正版化软件管理 B/S 平台，提供软件分类下载、帮助文档浏览、Windows/Office/WPS 激活码发放，以及完整的管理后台。

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装与启动

```bash
# 安装依赖
pnpm install

# 初始化数据库（生成表结构 + 种子数据）
pnpm db:migrate
pnpm db:seed

# 同时启动后端和前端开发服务器
pnpm dev
```

启动后：

- 前端门户：http://localhost:5273
- 后端 API：http://localhost:7500
- 前端开发服务器已配置代理，`/api` 请求自动转发到后端

### 默认管理员账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin  | admin123 | 管理员 |

> 首次部署后请立即修改默认密码。

## CI 构建

推送至 `main` / `master` 分支或提交 PR 时，[GitHub Actions](https://github.com/bigzeroadmin/zbh2/actions) 会自动执行：

- **Node.js**：安装依赖并执行 `pnpm build`，上传 `web-dist` 与 `server-dist` 构建产物
- **Windows**：使用仓库根目录 [`global.json`](global.json) 固定 **.NET 8 SDK**（避免 runner 默认 .NET 10 与 WinUI / `win10-*` RID 不兼容），再编译 WinUI3 演示客户端并上传 `ActivationClientDemo-win-x64.zip`

## 项目结构

```
├── apps/
│   ├── server/          # Fastify 后端 API
│   │   ├── src/
│   │   │   ├── db/      # Drizzle schema、迁移、种子
│   │   │   ├── middleware/  # Session 鉴权
│   │   │   └── routes/  # 路由（public/admin/auth/activation/upload）
│   │   └── drizzle/     # SQL 迁移文件
│   └── web/             # React + Vite 前端
│       └── src/
│           ├── layouts/  # 门户布局 / 管理后台布局
│           ├── pages/    # 页面组件
│           ├── lib/      # API 客户端、Auth Context
│           └── theme.ts  # Ant Design 淡蓝主题
├── packages/
│   └── shared/          # 前后端共享的 Zod Schema 和类型
├── tools/
│   └── ActivationClientWinUI3/  # WinUI3 KMS 演示激活客户端（需在 Windows 上编译）
└── data/                # SQLite 数据库和上传文件（已 gitignore）
```

## 功能概览

### 门户（匿名可浏览）

- **首页**：展示平台统计概览
- **软件下载**：按分类浏览已发布的正版软件，支持直接下载
- **帮助文档**：按分类浏览帮助文档（Markdown 渲染）
- **软件激活**：查看激活产品，登录后获取 6 位激活码，下载激活客户端

### 管理后台（需管理员登录）

- 软件分类与软件条目 CRUD、排序、发布状态管理
- 帮助文档分类与文档 CRUD、发布/回收生命周期管理
- 激活产品管理、激活码批量导入、发放记录审计
- 用户管理（创建、角色分配、启用/禁用、密码重置）
- 文件上传管理

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18, Ant Design 5, React Router 6, Vite |
| 后端 | Fastify 5, Drizzle ORM |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | httpOnly Cookie Session, argon2id 密码哈希 |
| 构建 | pnpm monorepo |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `7500` | 后端监听端口 |
| `DATABASE_URL` | `../../data/app.sqlite` | SQLite 文件路径 |

## 数据备份

SQLite 数据文件和上传的文件存储在 `data/` 目录下（已在 `.gitignore` 中排除）：

- `data/app.sqlite` — 数据库文件
- `data/uploads/` — 上传的软件包和文件

备份时需要同时备份这两个位置。

## 二期扩展：OIDC 对接

当前使用本地账号体系。二期将对接统一身份认证（OIDC），扩展点：

- 在 `apps/server/src/middleware/` 中增加 OIDC 适配层
- 用户表增加 `external_subject` 字段绑定 OIDC sub
- 登录路由增加 `/auth/oidc` 和 `/auth/oidc/callback`
- 本地账号可作为管理员 fallback 保留
