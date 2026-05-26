# 监控API

<cite>
**本文引用的文件**
- [apps/server/src/routes/monitor.ts](file://apps/server/src/routes/monitor.ts)
- [apps/server/src/db/schema.ts](file://apps/server/src/db/schema.ts)
- [apps/server/src/db/index.ts](file://apps/server/src/db/index.ts)
- [apps/server/src/middleware/audit.ts](file://apps/server/src/middleware/audit.ts)
- [apps/web/src/pages/admin/MonitorTargets.tsx](file://apps/web/src/pages/admin/MonitorTargets.tsx)
- [apps/web/src/pages/admin/MonitorItems.tsx](file://apps/web/src/pages/admin/MonitorItems.tsx)
- [apps/web/src/pages/admin/MonitorAlerts.tsx](file://apps/web/src/pages/admin/MonitorAlerts.tsx)
- [apps/web/src/pages/admin/MonitorReports.tsx](file://apps/web/src/pages/admin/MonitorReports.tsx)
- [apps/web/src/pages/admin/MonitorDashboard.tsx](file://apps/web/src/pages/admin/MonitorDashboard.tsx)
- [apps/web/src/lib/api.ts](file://apps/web/src/lib/api.ts)
- [apps/server/drizzle/meta/0002_snapshot.json](file://apps/server/drizzle/meta/0002_snapshot.json)
- [apps/server/src/db/seed-demo.ts](file://apps/server/src/db/seed-demo.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考量](#性能考量)
8. [故障排查指南](#故障排查指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介
本文件为 ZBH2 平台监控API的权威技术文档，覆盖监控目标管理、监控指标管理、阈值与告警、监控数据记录、监控报表与模板、平台接入与审计等能力。文档同时给出接口定义、数据模型、调用流程、示例场景与最佳实践，帮助开发者与运维人员快速上手并稳定运行。

## 项目结构
监控API由服务端路由层、数据库Schema层、审计中间件以及前端管理界面组成。服务端采用 Fastify + Drizzle ORM + better-sqlite3，数据库采用SQLite并启用WAL模式与外键约束；前端使用 Ant Design + Axios，提供目标、指标、阈值、告警、报表、仪表盘等管理界面。

```mermaid
graph TB
subgraph "前端"
UI_Targets["监控目标管理<br/>MonitorTargets.tsx"]
UI_Items["监控项管理<br/>MonitorItems.tsx"]
UI_Alerts["告警中心<br/>MonitorAlerts.tsx"]
UI_Reports["监控报告<br/>MonitorReports.tsx"]
UI_Dashboard["监控仪表盘<br/>MonitorDashboard.tsx"]
API_Client["API 客户端<br/>api.ts"]
end
subgraph "服务端"
Routes_Monitor["监控路由<br/>routes/monitor.ts"]
Middleware_Audit["审计日志<br/>middleware/audit.ts"]
DB_Index["数据库入口<br/>db/index.ts"]
DB_Schema["数据模型<br/>db/schema.ts"]
end
UI_Targets --> API_Client
UI_Items --> API_Client
UI_Alerts --> API_Client
UI_Reports --> API_Client
UI_Dashboard --> API_Client
API_Client --> Routes_Monitor
Routes_Monitor --> DB_Index
DB_Index --> DB_Schema
Routes_Monitor --> Middleware_Audit
```

**图表来源**
- [apps/web/src/pages/admin/MonitorTargets.tsx:1-110](file://apps/web/src/pages/admin/MonitorTargets.tsx#L1-L110)
- [apps/web/src/pages/admin/MonitorItems.tsx:1-232](file://apps/web/src/pages/admin/MonitorItems.tsx#L1-L232)
- [apps/web/src/pages/admin/MonitorAlerts.tsx:1-91](file://apps/web/src/pages/admin/MonitorAlerts.tsx#L1-L91)
- [apps/web/src/pages/admin/MonitorReports.tsx:1-189](file://apps/web/src/pages/admin/MonitorReports.tsx#L1-L189)
- [apps/web/src/pages/admin/MonitorDashboard.tsx:1-47](file://apps/web/src/pages/admin/MonitorDashboard.tsx#L1-L47)
- [apps/web/src/lib/api.ts:1-16](file://apps/web/src/lib/api.ts#L1-L16)
- [apps/server/src/routes/monitor.ts:1-595](file://apps/server/src/routes/monitor.ts#L1-L595)
- [apps/server/src/db/index.ts:1-16](file://apps/server/src/db/index.ts#L1-L16)
- [apps/server/src/db/schema.ts:216-330](file://apps/server/src/db/schema.ts#L216-L330)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

**章节来源**
- [apps/server/src/routes/monitor.ts:1-595](file://apps/server/src/routes/monitor.ts#L1-L595)
- [apps/server/src/db/schema.ts:216-330](file://apps/server/src/db/schema.ts#L216-L330)
- [apps/server/src/db/index.ts:1-16](file://apps/server/src/db/index.ts#L1-L16)
- [apps/web/src/lib/api.ts:1-16](file://apps/web/src/lib/api.ts#L1-L16)

## 核心组件
- 监控目标管理：增删改查监控目标，支持分页与类型筛选，提供状态查询。
- 监控项管理：为监控目标定义具体指标项，支持采集方法、采集间隔、启用状态等配置。
- 阈值与告警：为指标项配置阈值规则，支持多级别、多比较运算符、持续时间、响应动作与通知模板；支持告警确认与解决。
- 监控数据记录：采集值与状态的存储，支持按时间范围过滤与分页。
- 报表与模板：按时间区间生成统计摘要，支持模板化配置与导出。
- 平台接入：支持 webhook、API、agent 等类型平台接入，提供连通性测试。
- 审计日志：对监控相关的关键操作进行审计记录。

**章节来源**
- [apps/server/src/routes/monitor.ts:17-595](file://apps/server/src/routes/monitor.ts#L17-L595)
- [apps/server/src/db/schema.ts:216-330](file://apps/server/src/db/schema.ts#L216-L330)

## 架构总览
监控API采用“路由层-ORM层-数据库层-审计中间件”的分层架构。路由层负责REST接口与参数校验；ORM层负责数据持久化；数据库层采用SQLite并启用WAL模式；审计中间件统一记录操作日志。

```mermaid
sequenceDiagram
participant FE as "前端管理界面"
participant API as "API 客户端"
participant Route as "监控路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite(WAL)"
participant Audit as "审计中间件"
FE->>API : 发起HTTP请求
API->>Route : 路由处理(鉴权/参数)
Route->>ORM : 查询/插入/更新
ORM->>DB : 执行SQL
Route->>Audit : 记录审计日志
DB-->>ORM : 返回结果
ORM-->>Route : 结果对象
Route-->>API : JSON响应
API-->>FE : 展示数据/状态
```

**图表来源**
- [apps/server/src/routes/monitor.ts:1-595](file://apps/server/src/routes/monitor.ts#L1-L595)
- [apps/server/src/db/index.ts:1-16](file://apps/server/src/db/index.ts#L1-L16)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)
- [apps/web/src/lib/api.ts:1-16](file://apps/web/src/lib/api.ts#L1-L16)

## 详细组件分析

### 监控目标管理接口
- 接口概览
  - 获取目标列表：支持分页、每页大小限制、按类型筛选。
  - 新增目标：必填名称与类型，可选主机、端口、描述、状态、配置。
  - 更新目标：按ID更新，支持部分字段更新。
  - 删除目标：按ID删除。
  - 查询目标状态：返回目标ID、名称与当前状态。
- 关键字段
  - 类型枚举：device、system、database、service。
  - 状态枚举：online、offline、warning、critical。
- 示例场景
  - 添加目标：POST /api/admin/monitor/targets
  - 分页查询：GET /api/admin/monitor/targets?page=1&pageSize=20&type=server
  - 更新状态：PUT /api/admin/monitor/targets/:id
  - 查询状态：GET /api/admin/monitor/targets/:id/status

```mermaid
sequenceDiagram
participant UI as "监控目标管理界面"
participant API as "API 客户端"
participant Route as "目标路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
participant Audit as "审计中间件"
UI->>API : 提交新增/更新请求
API->>Route : POST/PUT /api/admin/monitor/targets
Route->>ORM : 插入/更新监控目标
ORM->>DB : 执行SQL
Route->>Audit : 记录审计日志(create/update)
DB-->>ORM : 返回受影响行
ORM-->>Route : 返回结果
Route-->>API : JSON响应(success/data)
API-->>UI : 刷新列表/提示成功
```

**图表来源**
- [apps/server/src/routes/monitor.ts:34-99](file://apps/server/src/routes/monitor.ts#L34-L99)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

**章节来源**
- [apps/server/src/routes/monitor.ts:17-106](file://apps/server/src/routes/monitor.ts#L17-L106)
- [apps/server/src/db/schema.ts:216-228](file://apps/server/src/db/schema.ts#L216-L228)

### 监控项管理接口
- 接口概览
  - 获取监控项列表：支持按目标ID筛选、分页。
  - 新增监控项：必填目标ID、名称、键名，可选单位、采集方法、采集间隔、启用状态。
  - 更新监控项：按ID更新，支持部分字段更新。
  - 删除监控项：按ID删除。
- 关键字段
  - 采集方法枚举：agent、snmp、http、icmp、script、wmi。
  - 采集间隔默认60秒，启用状态默认开启。
- 示例场景
  - 新增项：POST /api/admin/monitor/items
  - 按目标筛选：GET /api/admin/monitor/items?targetId=1&page=1&pageSize=20
  - 更新项：PUT /api/admin/monitor/items/:id

```mermaid
sequenceDiagram
participant UI as "监控项管理界面"
participant API as "API 客户端"
participant Route as "监控项路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
UI->>API : 提交新增/更新请求
API->>Route : POST/PUT /api/admin/monitor/items
Route->>ORM : 插入/更新监控项
ORM->>DB : 执行SQL
DB-->>ORM : 返回受影响行
ORM-->>Route : 返回结果
Route-->>API : JSON响应(success/data)
API-->>UI : 刷新列表/提示成功
```

**图表来源**
- [apps/server/src/routes/monitor.ts:108-164](file://apps/server/src/routes/monitor.ts#L108-L164)

**章节来源**
- [apps/server/src/routes/monitor.ts:108-164](file://apps/server/src/routes/monitor.ts#L108-L164)
- [apps/server/src/db/schema.ts:230-241](file://apps/server/src/db/schema.ts#L230-L241)

### 阈值与告警接口
- 阈值规则
  - 获取阈值：按监控项ID查询。
  - 新增阈值：必填监控项ID、级别、比较运算符、阈值，可选持续时间、响应动作、通知消息、启用状态。
  - 更新阈值：按ID更新，支持部分字段更新。
  - 删除阈值：按ID删除。
  - 比较运算符：gt、lt、eq、gte、lte。
  - 级别：warning、critical。
- 告警管理
  - 获取告警：支持按状态、级别筛选，分页。
  - 确认告警：PUT /api/admin/monitor/alerts/:id/acknowledge。
  - 解决告警：PUT /api/admin/monitor/alerts/:id/resolve。
  - 状态：pending、acknowledged、resolved。
- 示例场景
  - 新增阈值：POST /api/admin/monitor/thresholds
  - 确认告警：PUT /api/admin/monitor/alerts/:id/acknowledge
  - 解决告警：PUT /api/admin/monitor/alerts/:id/resolve

```mermaid
sequenceDiagram
participant Collector as "采集器/探针"
participant Route as "监控路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
Collector->>Route : 上报采集值
Route->>ORM : 写入monitor_records
ORM->>DB : INSERT monitor_records
Route->>ORM : 匹配阈值规则
ORM->>DB : INSERT monitor_alerts
DB-->>ORM : 返回告警ID
ORM-->>Route : 返回告警对象
Route-->>Collector : 告警已生成
```

**图表来源**
- [apps/server/src/routes/monitor.ts:166-288](file://apps/server/src/routes/monitor.ts#L166-L288)
- [apps/server/src/db/schema.ts:243-277](file://apps/server/src/db/schema.ts#L243-L277)

**章节来源**
- [apps/server/src/routes/monitor.ts:166-288](file://apps/server/src/routes/monitor.ts#L166-L288)
- [apps/server/src/db/schema.ts:243-277](file://apps/server/src/db/schema.ts#L243-L277)

### 监控数据记录接口
- 接口概览
  - 获取记录：支持按监控项ID筛选、按起止时间过滤、分页。
  - 状态枚举：normal、warning、critical。
- 示例场景
  - 按项查询：GET /api/admin/monitor/records?itemId=1
  - 时间范围查询：GET /api/admin/monitor/records?startTime=...&endTime=...

```mermaid
flowchart TD
Start(["请求进入"]) --> Parse["解析查询参数<br/>itemId/page/pageSize/start/end"]
Parse --> Build["构建查询条件"]
Build --> Exec["执行数据库查询"]
Exec --> Filter{"是否指定时间范围?"}
Filter --> |是| Apply["按时间过滤"]
Filter --> |否| Skip["跳过过滤"]
Apply --> Paginate["分页处理"]
Skip --> Paginate
Paginate --> Return["返回JSON响应"]
```

**图表来源**
- [apps/server/src/routes/monitor.ts:217-240](file://apps/server/src/routes/monitor.ts#L217-L240)

**章节来源**
- [apps/server/src/routes/monitor.ts:217-240](file://apps/server/src/routes/monitor.ts#L217-L240)
- [apps/server/src/db/schema.ts:256-262](file://apps/server/src/db/schema.ts#L256-L262)

### 监控报表与模板接口
- 报表生成
  - 必填：标题、类型、开始时间、结束时间。
  - 统计维度：按监控项聚合，计算最小值、最大值、平均值、告警示数。
  - 存储：生成摘要JSON并写入monitor_reports。
- 模板管理
  - 获取模板列表。
  - 新增/更新/删除模板。
- 示例场景
  - 生成报表：POST /api/admin/monitor/reports/generate
  - 查看报表：GET /api/admin/monitor/reports/:id
  - 管理模板：GET/POST/PUT/DELETE /api/admin/monitor/report-templates

```mermaid
sequenceDiagram
participant UI as "监控报告界面"
participant API as "API 客户端"
participant Route as "报表路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
UI->>API : 提交生成请求(标题/类型/时间范围)
API->>Route : POST /api/admin/monitor/reports/generate
Route->>ORM : 查询monitor_records(时间范围)
ORM->>DB : SELECT * FROM monitor_records
DB-->>ORM : 返回记录集
Route->>Route : 聚合统计(最小/最大/平均/告警示数)
Route->>ORM : INSERT INTO monitor_reports
ORM->>DB : 执行SQL
DB-->>ORM : 返回报表ID
ORM-->>Route : 返回报表对象
Route-->>API : JSON响应(success/data)
API-->>UI : 展示报表/模板
```

**图表来源**
- [apps/server/src/routes/monitor.ts:321-407](file://apps/server/src/routes/monitor.ts#L321-L407)
- [apps/server/src/db/schema.ts:279-299](file://apps/server/src/db/schema.ts#L279-L299)

**章节来源**
- [apps/server/src/routes/monitor.ts:321-407](file://apps/server/src/routes/monitor.ts#L321-L407)
- [apps/server/src/db/schema.ts:279-299](file://apps/server/src/db/schema.ts#L279-L299)

### 平台接入与连通性测试
- 支持类型：webhook、api、agent。
- 字段：名称、类型、端点、API Key、Secret、同步配置、状态、描述。
- 连通性测试：POST /api/admin/monitor/platforms/:id/test，模拟连接测试并临时更新状态为testing，随后恢复为active。
- 示例场景
  - 新增平台：POST /api/admin/monitor/platforms
  - 测试连通性：POST /api/admin/monitor/platforms/:id/test

```mermaid
sequenceDiagram
participant UI as "平台接入界面"
participant API as "API 客户端"
participant Route as "平台路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
UI->>API : 触发测试
API->>Route : POST /api/admin/monitor/platforms/ : id/test
Route->>ORM : 读取平台配置
ORM->>DB : SELECT * FROM monitor_platforms WHERE id=?
DB-->>ORM : 返回平台
Route->>Route : 模拟测试(连接/延迟/详情)
Route->>ORM : UPDATE status='testing'
ORM->>DB : 执行SQL
Route->>ORM : UPDATE status='active'
ORM->>DB : 执行SQL
Route-->>API : 返回测试结果
API-->>UI : 展示测试结果
```

**图表来源**
- [apps/server/src/routes/monitor.ts:489-593](file://apps/server/src/routes/monitor.ts#L489-L593)
- [apps/server/src/db/schema.ts:316-329](file://apps/server/src/db/schema.ts#L316-L329)

**章节来源**
- [apps/server/src/routes/monitor.ts:489-593](file://apps/server/src/routes/monitor.ts#L489-L593)
- [apps/server/src/db/schema.ts:316-329](file://apps/server/src/db/schema.ts#L316-L329)

### 审计日志与仪表盘
- 审计日志
  - 获取日志：支持按用户、动作、目标类型、时间范围筛选，分页。
  - 统计：按动作与目标类型统计数量。
- 仪表盘
  - 获取监控总览：目标总数、按状态分布、告警按状态与级别分布、最近告警。
- 示例场景
  - 获取审计统计：GET /api/admin/monitor/audit-logs/stats
  - 获取仪表盘：GET /api/admin/monitor/dashboard

```mermaid
sequenceDiagram
participant UI as "监控仪表盘/审计界面"
participant API as "API 客户端"
participant Route as "仪表盘/审计路由"
participant ORM as "Drizzle ORM"
participant DB as "SQLite"
UI->>API : 请求仪表盘/审计
API->>Route : GET /api/admin/monitor/dashboard
Route->>ORM : 统计monitor_targets/monitor_alerts
ORM->>DB : SELECT COUNT/Group By
DB-->>ORM : 返回统计结果
ORM-->>Route : 返回聚合数据
Route-->>API : JSON响应(data)
API-->>UI : 渲染卡片/表格
```

**图表来源**
- [apps/server/src/routes/monitor.ts:290-487](file://apps/server/src/routes/monitor.ts#L290-L487)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

**章节来源**
- [apps/server/src/routes/monitor.ts:290-487](file://apps/server/src/routes/monitor.ts#L290-L487)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

## 依赖关系分析
- 路由依赖Drizzle ORM与数据库Schema，统一通过db/index.ts初始化SQLite连接。
- 审计中间件logAudit贯穿关键写操作，确保可追溯。
- 前端通过api.ts封装基础URL与凭证，统一拦截错误。

```mermaid
graph LR
Routes["routes/monitor.ts"] --> Schema["db/schema.ts"]
Routes --> DBIndex["db/index.ts"]
Routes --> Audit["middleware/audit.ts"]
WebAPI["web/lib/api.ts"] --> Routes
WebUI_Targets["web/MonitorTargets.tsx"] --> WebAPI
WebUI_Items["web/MonitorItems.tsx"] --> WebAPI
WebUI_Alerts["web/MonitorAlerts.tsx"] --> WebAPI
WebUI_Reports["web/MonitorReports.tsx"] --> WebAPI
WebUI_Dashboard["web/MonitorDashboard.tsx"] --> WebAPI
```

**图表来源**
- [apps/server/src/routes/monitor.ts:1-595](file://apps/server/src/routes/monitor.ts#L1-L595)
- [apps/server/src/db/schema.ts:216-330](file://apps/server/src/db/schema.ts#L216-L330)
- [apps/server/src/db/index.ts:1-16](file://apps/server/src/db/index.ts#L1-L16)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)
- [apps/web/src/lib/api.ts:1-16](file://apps/web/src/lib/api.ts#L1-L16)

**章节来源**
- [apps/server/src/db/index.ts:1-16](file://apps/server/src/db/index.ts#L1-L16)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

## 性能考量
- 数据库
  - SQLite启用WAL模式与外键约束，提升并发读写稳定性。
  - monitor_records按collected_at排序，建议在该列建立索引以优化时间范围查询。
- 查询与分页
  - 默认分页大小上限100，避免超大结果集。
  - 对时间范围过滤采用内存过滤，建议在数据量增大时考虑数据库侧过滤或分区。
- 写入路径
  - 审计日志在写入监控目标/平台等关键操作后异步执行，不影响主流程。
- 建议
  - 对高频查询字段建立索引（如monitor_records.itemId、monitor_records.collected_at）。
  - 报表生成时限制时间范围，避免全表扫描。
  - 对于大量历史数据，建议定期归档或清理策略。

**章节来源**
- [apps/server/src/db/index.ts:7-12](file://apps/server/src/db/index.ts#L7-L12)
- [apps/server/src/routes/monitor.ts:7-11](file://apps/server/src/routes/monitor.ts#L7-L11)
- [apps/server/drizzle/meta/0002_snapshot.json:1400-1442](file://apps/server/drizzle/meta/0002_snapshot.json#L1400-L1442)

## 故障排查指南
- 常见错误
  - 参数缺失：新增/更新接口若缺少必填字段，返回400与错误信息。
  - 资源不存在：按ID操作时若资源不存在，返回404与错误信息。
  - 权限不足：路由使用requireAdmin中间件，未登录或非管理员将无法访问。
- 审计追踪
  - 通过审计日志接口查询操作记录，定位问题发生的时间、用户与目标。
- 告警处理
  - 使用确认/解决接口将告警状态流转，便于团队协作与闭环管理。
- 前端调试
  - 使用浏览器开发者工具查看网络请求与响应，结合UI提示定位问题。

**章节来源**
- [apps/server/src/routes/monitor.ts:34-99](file://apps/server/src/routes/monitor.ts#L34-L99)
- [apps/server/src/routes/monitor.ts:243-288](file://apps/server/src/routes/monitor.ts#L243-L288)
- [apps/server/src/middleware/audit.ts:1-28](file://apps/server/src/middleware/audit.ts#L1-L28)

## 结论
ZBH2监控API提供了从目标、指标、阈值、告警到报表与平台接入的完整能力，配合SQLite+WAL与Drizzle ORM，实现了简洁稳定的后端架构。通过审计日志与仪表盘，保障了可观测性与可追溯性。建议在生产环境中结合索引优化、时间范围限制与归档策略，进一步提升性能与可维护性。

## 附录

### 数据模型概览
```mermaid
erDiagram
MONITOR_TARGETS {
int id PK
string name
string type
string host
int port
string description
string status
text config
string created_at
string updated_at
}
MONITOR_ITEMS {
int id PK
int target_id FK
string name
string key
string unit
string collect_method
int collect_interval
int enabled
string created_at
string updated_at
}
MONITOR_THRESHOLDS {
int id PK
int item_id FK
string level
string operator
float value
int duration
string action
string notify_message
int enabled
string created_at
}
MONITOR_RECORDS {
int id PK
int item_id FK
float value
string status
string collected_at
}
MONITOR_ALERTS {
int id PK
int item_id FK
int threshold_id FK
string level
float value
string message
string status
int acknowledged_by FK
string acknowledged_at
int resolved_by FK
string resolved_at
string created_at
}
MONITOR_REPORT_TEMPLATES {
int id PK
string name
string description
text config
int created_by FK
string created_at
string updated_at
}
MONITOR_REPORTS {
int id PK
string title
string type
string start_time
string end_time
text content
int template_id FK
int created_by FK
string created_at
}
MONITOR_PLATFORMS {
int id PK
string name
string type
string endpoint
string api_key
string secret
text sync_config
string status
string last_sync_at
string description
string created_at
string updated_at
}
AUDIT_LOGS {
int id PK
int user_id FK
string username
string action
string target_type
string target_id
string target_name
text detail
string ip_address
string user_agent
string result
string created_at
}
MONITOR_TARGETS ||--o{ MONITOR_ITEMS : "拥有"
MONITOR_ITEMS ||--o{ MONITOR_THRESHOLDS : "定义"
MONITOR_ITEMS ||--o{ MONITOR_RECORDS : "产生"
MONITOR_THRESHOLDS ||--o{ MONITOR_ALERTS : "触发"
MONITOR_REPORT_TEMPLATES ||--o{ MONITOR_REPORTS : "模板"
USERS ||--o{ MONITOR_REPORTS : "创建者"
USERS ||--o{ AUDIT_LOGS : "用户"
```

**图表来源**
- [apps/server/src/db/schema.ts:216-330](file://apps/server/src/db/schema.ts#L216-L330)

### 请求/响应示例（路径引用）
- 新增监控目标
  - 请求：POST /api/admin/monitor/targets
  - 路径参考：[apps/server/src/routes/monitor.ts:34-58](file://apps/server/src/routes/monitor.ts#L34-L58)
- 分页查询监控项
  - 请求：GET /api/admin/monitor/items?page=1&pageSize=20
  - 路径参考：[apps/server/src/routes/monitor.ts:108-124](file://apps/server/src/routes/monitor.ts#L108-L124)
- 新增阈值规则
  - 请求：POST /api/admin/monitor/thresholds
  - 路径参考：[apps/server/src/routes/monitor.ts:175-191](file://apps/server/src/routes/monitor.ts#L175-L191)
- 生成监控报表
  - 请求：POST /api/admin/monitor/reports/generate
  - 路径参考：[apps/server/src/routes/monitor.ts:332-391](file://apps/server/src/routes/monitor.ts#L332-L391)
- 平台连通性测试
  - 请求：POST /api/admin/monitor/platforms/:id/test
  - 路径参考：[apps/server/src/routes/monitor.ts:566-593](file://apps/server/src/routes/monitor.ts#L566-L593)