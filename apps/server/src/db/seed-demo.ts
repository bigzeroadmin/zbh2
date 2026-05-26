import { db, schema } from './index.js';
import { eq, and } from 'drizzle-orm';

function seedDemo() {
  // Resolve category IDs
  const swCats = db.select().from(schema.softwareCategories).all();
  const catId = (name: string) => swCats.find(c => c.name === name)?.id ?? swCats[0]?.id ?? 1;

  const helpCats = db.select().from(schema.helpCategories).all();
  const helpCatId = (name: string) => helpCats.find(c => c.name === name)?.id ?? helpCats[0]?.id ?? 1;

  // ─── 50 Software Items ─────────────────────────────
  const softwareData = [
    // 操作系统 (12)
    { title: 'Windows 11 专业版', description: '适用于企业用户的 Windows 11 专业版操作系统，包含 BitLocker、远程桌面、组策略等企业级功能。', categoryId: catId('操作系统'), version: '23H2', sort: 1 },
    { title: 'Windows 11 企业版', description: 'Windows 11 企业版，专为大型组织设计，具备高级安全性和管理功能。', categoryId: catId('操作系统'), version: '23H2', sort: 2 },
    { title: 'Windows 10 专业版', description: '稳定可靠的 Windows 10 专业版，适合需要兼容性的工作环境。', categoryId: catId('操作系统'), version: '22H2', sort: 3 },
    { title: 'Windows 10 企业版 LTSC', description: '长期服务通道版本，适合关键任务设备和专用工作站。', categoryId: catId('操作系统'), version: '2021', sort: 4 },
    { title: 'Windows Server 2022 标准版', description: '服务器操作系统，支持容器化、混合云和高级安全功能。', categoryId: catId('操作系统'), version: '2022', sort: 5 },
    { title: 'Windows Server 2022 数据中心版', description: '面向大规模虚拟化和云基础设施的数据中心版。', categoryId: catId('操作系统'), version: '2022', sort: 6 },
    { title: 'Ubuntu Desktop 24.04 LTS', description: 'Ubuntu 桌面版长期支持版本，适合开发人员和日常办公。', categoryId: catId('操作系统'), version: '24.04', sort: 7 },
    { title: 'Ubuntu Server 24.04 LTS', description: 'Ubuntu 服务器版，适用于云服务器和容器部署。', categoryId: catId('操作系统'), version: '24.04', sort: 8 },
    { title: 'CentOS Stream 9', description: '社区驱动的 Linux 发行版，RHEL 的上游版本。', categoryId: catId('操作系统'), version: '9', sort: 9 },
    { title: '银河麒麟桌面版 V10', description: '国产信创操作系统，通过安全认证，适合政府和企事业单位。', categoryId: catId('操作系统'), version: 'V10 SP1', sort: 10 },
    { title: '统信 UOS 桌面版', description: '国产统一操作系统，兼容多种硬件平台和国产应用。', categoryId: catId('操作系统'), version: 'V20', sort: 11 },
    { title: '中标麒麟服务器版', description: '国产服务器操作系统，适用于信创环境下的服务器部署。', categoryId: catId('操作系统'), version: 'V7.0', sort: 12 },

    // 办公软件 (14)
    { title: 'Microsoft Office 2024 专业增强版', description: '包含 Word、Excel、PowerPoint、Outlook、Access、Publisher 的完整办公套件。', categoryId: catId('办公软件'), version: '2024', sort: 1 },
    { title: 'Microsoft Office 2024 标准版', description: '包含 Word、Excel、PowerPoint、Outlook 的标准办公套件。', categoryId: catId('办公软件'), version: '2024', sort: 2 },
    { title: 'Microsoft Office 2021 专业增强版', description: '经典版本办公套件，适合不需要最新功能的稳定环境。', categoryId: catId('办公软件'), version: '2021', sort: 3 },
    { title: 'Microsoft 365 企业版', description: '基于订阅的办公套件，包含云协作和 Teams 沟通工具。', categoryId: catId('办公软件'), version: 'E3', sort: 4 },
    { title: 'WPS Office 2024 专业版', description: '国产办公软件，全面兼容 Microsoft Office 格式，轻量高效。', categoryId: catId('办公软件'), version: '2024', sort: 5 },
    { title: 'WPS Office 2024 教育版', description: '面向教育机构的 WPS 版本，提供特别授权和教育功能。', categoryId: catId('办公软件'), version: '2024', sort: 6 },
    { title: 'Adobe Acrobat Pro 2024', description: '专业 PDF 编辑、转换、签名和协作工具。', categoryId: catId('办公软件'), version: '2024', sort: 7 },
    { title: 'Adobe Acrobat Reader DC', description: '免费 PDF 阅读器，支持注释和基本表单填写。', categoryId: catId('办公软件'), version: '2024.1', sort: 8 },
    { title: 'Visio Professional 2024', description: '专业流程图、组织架构图和网络拓扑图绘制工具。', categoryId: catId('办公软件'), version: '2024', sort: 9 },
    { title: 'Project Professional 2024', description: '项目管理软件，支持甘特图、资源管理和进度跟踪。', categoryId: catId('办公软件'), version: '2024', sort: 10 },
    { title: '永中 Office 2024', description: '国产办公软件，具备文字处理、表格和演示功能。', categoryId: catId('办公软件'), version: '2024', sort: 11 },
    { title: '福昕高级PDF编辑器', description: '国产 PDF 编辑工具，支持编辑、转换、OCR 识别等。', categoryId: catId('办公软件'), version: '13.0', sort: 12 },
    { title: 'LibreOffice 社区版', description: '开源办公套件，包含 Writer、Calc、Impress 等组件。', categoryId: catId('办公软件'), version: '7.6', sort: 13 },
    { title: 'Microsoft Teams 桌面客户端', description: '企业即时通讯和视频会议工具，与 Office 365 深度集成。', categoryId: catId('办公软件'), version: '2024', sort: 14 },

    // 安全软件 (12)
    { title: '360 安全卫士极速版', description: '轻量级电脑安全防护工具，提供病毒查杀、系统优化和软件管理。', categoryId: catId('安全软件'), version: '15.0', sort: 1 },
    { title: '360 杀毒软件', description: '免费杀毒软件，双引擎查杀，实时监控系统安全。', categoryId: catId('安全软件'), version: '6.0', sort: 2 },
    { title: '火绒安全软件', description: '安静、不打扰的安全防护软件，专注病毒防御和系统防护。', categoryId: catId('安全软件'), version: '5.0', sort: 3 },
    { title: '卡巴斯基端点安全', description: '企业级端点安全解决方案，提供高级威胁防护和集中管理。', categoryId: catId('安全软件'), version: '12.0', sort: 4 },
    { title: '赛门铁克终端防护', description: '企业终端安全管理平台，支持 EDR 和高级威胁检测。', categoryId: catId('安全软件'), version: '14.3', sort: 5 },
    { title: '奇安信天擎终端安全', description: '国产终端安全管理系统，满足等保和信创要求。', categoryId: catId('安全软件'), version: '7.0', sort: 6 },
    { title: '深信服终端检测响应 EDR', description: '高级终端检测与响应平台，AI 驱动威胁分析。', categoryId: catId('安全软件'), version: '3.8', sort: 7 },
    { title: '天融信 TopDesk 终端安全', description: '一体化终端安全管理方案，支持资产管理和漏洞修复。', categoryId: catId('安全软件'), version: '6.0', sort: 8 },
    { title: '瑞星 ESM 终端安全管理', description: '国产企业级杀毒和终端管控平台。', categoryId: catId('安全软件'), version: '25.0', sort: 9 },
    { title: '数据防泄漏 DLP 客户端', description: '防止敏感数据通过USB、邮件、网络等途径泄露。', categoryId: catId('安全软件'), version: '4.2', sort: 10 },
    { title: '上网行为管理客户端', description: '管控员工上网行为，防止访问不安全网站，提升工作效率。', categoryId: catId('安全软件'), version: '3.5', sort: 11 },
    { title: 'VPN 安全接入客户端', description: '企业远程办公 VPN 客户端，支持 SSL/IPSec 隧道加密。', categoryId: catId('安全软件'), version: '8.0', sort: 12 },

    // 工具软件 (12)
    { title: '7-Zip 压缩工具', description: '开源压缩解压工具，支持 7z、ZIP、RAR 等多种格式。', categoryId: catId('工具软件'), version: '24.05', sort: 1 },
    { title: 'Notepad++ 文本编辑器', description: '轻量级文本和代码编辑器，支持语法高亮和插件扩展。', categoryId: catId('工具软件'), version: '8.6', sort: 2 },
    { title: 'PuTTY SSH 客户端', description: '免费 SSH 和 Telnet 客户端，用于远程服务器管理。', categoryId: catId('工具软件'), version: '0.80', sort: 3 },
    { title: 'FileZilla FTP 客户端', description: '开源 FTP/SFTP 客户端，支持断点续传和文件比较。', categoryId: catId('工具软件'), version: '3.67', sort: 4 },
    { title: 'VLC 媒体播放器', description: '功能强大的开源媒体播放器，支持几乎所有音视频格式。', categoryId: catId('工具软件'), version: '3.0.20', sort: 5 },
    { title: 'Everything 文件搜索', description: '极速文件名搜索工具，毫秒级定位硬盘上的任意文件。', categoryId: catId('工具软件'), version: '1.4', sort: 6 },
    { title: 'Snipaste 截图工具', description: '高效截图和贴图工具，支持像素级标注和历史记录。', categoryId: catId('工具软件'), version: '2.8', sort: 7 },
    { title: 'Git for Windows', description: '分布式版本控制工具，开发人员必备。', categoryId: catId('工具软件'), version: '2.44', sort: 8 },
    { title: 'Python 解释器', description: 'Python 编程语言运行环境，含 pip 包管理器。', categoryId: catId('工具软件'), version: '3.12.3', sort: 9 },
    { title: 'Node.js 运行时', description: 'JavaScript 服务端运行环境，适用于 Web 开发和自动化。', categoryId: catId('工具软件'), version: '20.12 LTS', sort: 10 },
    { title: 'TeamViewer 远程控制', description: '远程桌面控制和在线协作工具，支持跨平台连接。', categoryId: catId('工具软件'), version: '15.52', sort: 11 },
    { title: 'Beyond Compare 文件对比', description: '专业文件和文件夹对比工具，支持文本、表格和二进制比较。', categoryId: catId('工具软件'), version: '5.0', sort: 12 },
  ];

  let swInserted = 0;
  for (const item of softwareData) {
    const exists = db.select().from(schema.softwareItems)
      .where(eq(schema.softwareItems.title, item.title)).get();
    if (!exists) {
      db.insert(schema.softwareItems).values({ ...item, status: 'published' }).run();
      swInserted++;
    }
  }
  console.log(`Inserted ${swInserted} software items (total defined: ${softwareData.length})`);

  // ─── 50 Help Documents ─────────────────────────────
  const helpData = [
    // 安装指南 (18)
    { title: 'Windows 11 全新安装指南', categoryId: helpCatId('安装指南'), sort: 1, body: `# Windows 11 全新安装指南

## 准备工作

1. **备份数据**：安装前请将重要数据备份到外部存储设备或云端
2. **下载安装镜像**：从本平台下载 Windows 11 ISO 镜像文件
3. **制作启动U盘**：使用 Rufus 或微软官方工具制作 UEFI 启动U盘（至少 8GB）

## 安装步骤

### 第一步：设置 BIOS
- 重启电脑，按 F2/F12/Del 进入 BIOS
- 确保 Secure Boot 已开启
- 设置 U 盘为第一启动项
- 保存并退出

### 第二步：开始安装
1. 从 U 盘启动后，选择语言和区域设置
2. 点击「现在安装」
3. 输入产品密钥或选择「我没有产品密钥」（后续可通过平台激活）
4. 选择 Windows 11 专业版
5. 接受许可条款

### 第三步：分区设置
- 选择「自定义：仅安装 Windows」
- 删除旧分区（注意：这会清除所有数据）
- 选择未分配空间，点击「下一步」
- 系统将自动创建所需分区

### 第四步：初始设置
- 选择地区和键盘布局
- 连接网络
- 使用本地账户或微软账户登录
- 配置隐私设置

## 安装后建议
- 运行 Windows Update 安装最新补丁
- 安装硬件驱动程序
- 通过本平台获取激活码并激活系统` },
    { title: 'Windows 11 升级安装指南', categoryId: helpCatId('安装指南'), sort: 2, body: `# Windows 11 升级安装指南

## 系统要求检查

在升级前，请确认您的电脑满足 Windows 11 的最低硬件要求：

| 项目 | 最低要求 |
|------|---------|
| 处理器 | 1 GHz 以上，2核以上 64 位兼容处理器 |
| 内存 | 4 GB 以上 |
| 硬盘 | 64 GB 以上 |
| TPM | 可信平台模块 2.0 |
| 显卡 | DirectX 12 兼容 |

> 可使用微软 PC Health Check 工具检查兼容性。

## 升级步骤

1. 从本平台下载 Windows 11 安装助手
2. 右键以管理员身份运行
3. 接受许可条款
4. 工具将自动检查兼容性
5. 点击「安装」开始升级
6. 期间电脑将重启数次，请勿断电
7. 升级完成后检查驱动和应用兼容性

## 注意事项

- 升级过程大约需要 30-60 分钟
- 升级会保留您的个人文件和大部分应用
- 建议提前备份重要数据
- 升级后原激活状态将保留` },
    { title: 'Windows 10 安装指南', categoryId: helpCatId('安装指南'), sort: 3, body: `# Windows 10 安装指南

## 下载与准备

1. 从本平台「软件下载」页面下载 Windows 10 专业版镜像
2. 准备一个 8GB 以上的 U 盘
3. 使用微软 Media Creation Tool 制作安装 U 盘

## 安装流程

1. 插入安装 U 盘并重启电脑
2. 进入 BIOS 设置 U 盘启动
3. 按照安装向导操作
4. 选择「自定义安装」进行全新安装
5. 完成基本设置后进入桌面

## 驱动安装

安装完成后请按以下顺序安装驱动：
1. 芯片组驱动
2. 显卡驱动
3. 网卡驱动
4. 声卡驱动
5. 其他外设驱动

> 建议从硬件厂商官网下载最新驱动。` },
    { title: 'Office 2024 安装指南', categoryId: helpCatId('安装指南'), sort: 4, body: `# Microsoft Office 2024 安装指南

## 安装步骤

### 1. 下载安装包
从本平台「软件下载」→「办公软件」分类下载 Office 2024 安装程序。

### 2. 运行安装程序
- 双击下载的安装文件
- 如果出现 UAC 提示，点击「是」允许
- 安装程序将自动下载并安装所有组件

### 3. 等待安装完成
安装过程约需 10-20 分钟（取决于网速），期间请勿关闭安装窗口。

### 4. 首次启动
- 打开任意 Office 应用（如 Word）
- 系统会提示激活
- 选择「输入产品密钥」
- 从平台获取激活码并输入

## 安装常见问题

**Q: 安装时提示已有旧版本？**
A: 建议先卸载旧版 Office，然后重新安装。可使用微软官方卸载工具彻底清除。

**Q: 安装进度卡住不动？**
A: 请检查网络连接，或尝试关闭杀毒软件后重新安装。

**Q: 安装后缺少某个组件？**
A: 运行安装修复功能：控制面板 → 程序和功能 → Microsoft Office → 更改 → 联机修复。` },
    { title: 'WPS Office 安装指南', categoryId: helpCatId('安装指南'), sort: 5, body: `# WPS Office 安装指南

## 系统要求

- 操作系统：Windows 7/8/10/11
- 内存：2 GB 以上
- 硬盘空间：2 GB 以上
- .NET Framework 4.0 以上

## 安装步骤

1. 从平台下载 WPS Office 2024 专业版安装包
2. 右键以管理员身份运行安装程序
3. 选择安装路径（建议默认路径）
4. 勾选需要的组件：
   - WPS 文字（对应 Word）
   - WPS 表格（对应 Excel）
   - WPS 演示（对应 PowerPoint）
   - WPS PDF
5. 点击「安装」等待完成

## 配置建议

- 首次启动时选择「经典界面」以获得类似 Office 的操作体验
- 在设置中关闭广告推送和自动更新弹窗
- 绑定企业账号以使用云文档同步功能` },
    { title: 'Adobe Acrobat 安装指南', categoryId: helpCatId('安装指南'), sort: 6, body: `# Adobe Acrobat Pro 安装指南

## 安装前准备

- 确保系统已安装最新的 Windows 更新
- 关闭所有浏览器和 PDF 相关应用
- 确保有至少 4.5 GB 可用磁盘空间

## 安装流程

1. 下载安装包并解压
2. 运行 Setup.exe
3. 选择安装语言为「简体中文」
4. 选择安装路径
5. 等待安装完成（约 5-10 分钟）

## 设置为默认 PDF 阅读器

安装完成后，Acrobat 通常会自动设为默认 PDF 程序。如果没有：
1. 打开设置 → 应用 → 默认应用
2. 找到 .pdf 文件类型
3. 选择 Adobe Acrobat 作为默认应用` },
    { title: 'Visio 2024 安装指南', categoryId: helpCatId('安装指南'), sort: 7, body: `# Microsoft Visio 2024 安装指南

## 注意事项

Visio 需要独立安装，不包含在 Office 套件中。请从平台单独下载。

## 安装步骤

1. 下载 Visio Professional 2024 安装包
2. 确保已安装 Office 2024（推荐，但非必须）
3. 运行安装程序，按向导完成安装
4. 安装完成后使用平台提供的激活码激活

## 常用模板

安装后可使用以下常用模板：
- 基本流程图
- 跨职能流程图
- 组织结构图
- 网络拓扑图
- 平面布置图
- UML 类图` },
    { title: 'Python 开发环境安装指南', categoryId: helpCatId('安装指南'), sort: 8, body: `# Python 开发环境安装指南

## 安装 Python

1. 从平台下载 Python 3.12 安装包
2. 运行安装程序
3. **重要**：勾选「Add Python to PATH」
4. 选择「Customize installation」
5. 确认勾选 pip、tcl/tk、py launcher
6. 点击 Install

## 验证安装

打开命令提示符，输入：
\`\`\`
python --version
pip --version
\`\`\`

## 配置国内镜像源

\`\`\`
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

## 推荐 IDE

- VS Code + Python 扩展
- PyCharm 专业版` },
    { title: 'Node.js 开发环境安装指南', categoryId: helpCatId('安装指南'), sort: 9, body: `# Node.js 安装指南

## 安装步骤

1. 从平台下载 Node.js LTS 版本安装包
2. 运行安装程序，一路 Next 即可
3. 安装程序会自动配置 PATH 环境变量

## 验证安装

\`\`\`bash
node --version
npm --version
\`\`\`

## 配置国内镜像

\`\`\`bash
npm config set registry https://registry.npmmirror.com
\`\`\`

## 推荐工具

- nvm-windows：Node.js 版本管理器
- pnpm：高性能包管理器
- VS Code：代码编辑器` },
    { title: '7-Zip 安装与使用指南', categoryId: helpCatId('安装指南'), sort: 10, body: `# 7-Zip 安装与使用指南

## 安装

1. 从平台下载 7-Zip 安装包
2. 运行安装，选择安装路径
3. 安装完成后自动集成到右键菜单

## 基本使用

### 压缩文件
- 选中文件 → 右键 → 7-Zip → 添加到压缩包
- 选择压缩格式（推荐 7z 或 zip）
- 可设置密码保护

### 解压文件
- 右键压缩包 → 7-Zip → 解压到当前文件夹
- 或双击打开后拖拽文件

## 支持格式

压缩/解压：7z, XZ, BZIP2, GZIP, TAR, ZIP, WIM
仅解压：ARJ, CAB, CHM, CPIO, CramFS, DEB, DMG, FAT, HFS, ISO, LZH, LZMA, MBR, MSI, NSIS, NTFS, RAR, RPM, SquashFS, UDF, VHD, WIM, XAR, Z` },
    { title: 'VPN 客户端安装配置指南', categoryId: helpCatId('安装指南'), sort: 11, body: `# VPN 安全接入客户端安装指南

## 前提条件

- 已获得 VPN 账号（联系 IT 管理员）
- 电脑已联网

## 安装步骤

1. 从平台下载 VPN 客户端安装包
2. 以管理员身份运行安装程序
3. 安装完成后重启电脑

## 配置连接

1. 打开 VPN 客户端
2. 输入服务器地址（由 IT 管理员提供）
3. 输入用户名和密码
4. 点击「连接」

## 常见问题

- **连接超时**：检查网络，尝试切换移动网络
- **证书错误**：更新客户端到最新版本
- **频繁掉线**：调整 MTU 值或联系管理员` },
    { title: '火绒安全软件安装指南', categoryId: helpCatId('安装指南'), sort: 12, body: `# 火绒安全软件安装指南

## 为什么选择火绒

- 不弹广告、不捆绑软件
- 资源占用低，不拖慢电脑
- 专注安全防护核心功能

## 安装步骤

1. 从平台下载火绒安全软件
2. 双击运行安装程序
3. 选择安装路径
4. 点击「安装」等待完成

## 安装后配置

1. 打开火绒 → 设置 → 病毒防护 → 开启实时监控
2. 执行一次全盘扫描
3. 开启「自定义防护」规则
4. 配置弹窗拦截规则` },
    { title: '远程桌面配置指南', categoryId: helpCatId('安装指南'), sort: 13, body: `# Windows 远程桌面配置指南

## 被控端设置（被连接的电脑）

1. 右键「此电脑」→ 属性 → 远程设置
2. 勾选「允许远程连接到此计算机」
3. 点击「选择用户」添加允许连接的账户
4. 记录电脑的 IP 地址

## 控制端连接

1. 按 Win+R，输入 \`mstsc\` 打开远程桌面
2. 输入被控端 IP 地址
3. 输入用户名和密码
4. 点击「连接」

## 安全建议

- 使用强密码
- 修改默认的 3389 端口
- 配合 VPN 使用
- 开启网络级别身份验证（NLA）` },
    { title: 'Teams 安装与配置指南', categoryId: helpCatId('安装指南'), sort: 14, body: `# Microsoft Teams 安装指南

## 安装

1. 从平台下载 Teams 桌面客户端
2. 运行安装程序
3. 安装完成后自动启动

## 登录

使用单位分配的 Microsoft 365 账号登录。

## 基本功能

- **聊天**：一对一或群组即时通讯
- **会议**：发起或加入视频/音频会议
- **通话**：VOIP 网络电话
- **文件**：共享和协作编辑文件
- **应用**：集成第三方应用和工作流` },
    { title: '银河麒麟 V10 安装指南', categoryId: helpCatId('安装指南'), sort: 15, body: `# 银河麒麟桌面版 V10 安装指南

## 制作安装U盘

1. 下载银河麒麟 V10 ISO 镜像
2. 使用 dd 命令或 Rufus 制作启动U盘

## 安装流程

1. U盘启动后选择「安装银河麒麟操作系统」
2. 选择语言为「简体中文」
3. 配置磁盘分区（建议自动分区）
4. 设置用户名和密码
5. 等待安装完成并重启

## 安装后配置

- 更新系统：\`sudo apt update && sudo apt upgrade\`
- 安装常用软件：可从麒麟软件商店安装
- 配置打印机和网络
- 安装 WPS for Linux` },
    { title: 'Git 安装与基础配置', categoryId: helpCatId('安装指南'), sort: 16, body: `# Git for Windows 安装指南

## 安装

1. 从平台下载 Git for Windows
2. 运行安装程序
3. 关键选项：
   - 默认编辑器选择 VS Code 或 Notepad++
   - PATH 选择「Git from the command line and also from 3rd-party software」
   - 行尾转换选择「Checkout as-is, commit Unix-style line endings」

## 初始配置

\`\`\`bash
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
\`\`\`

## SSH 密钥配置

\`\`\`bash
ssh-keygen -t ed25519 -C "你的邮箱"
cat ~/.ssh/id_ed25519.pub
\`\`\`

将公钥添加到 GitLab/GitHub 的 SSH Keys 设置中。` },
    { title: 'Notepad++ 安装与配置', categoryId: helpCatId('安装指南'), sort: 17, body: `# Notepad++ 安装指南

## 安装

1. 从平台下载 Notepad++ 最新版
2. 运行安装，建议选择默认路径
3. 安装时可选插件组件

## 推荐配置

1. 设置 → 首选项 → 新建 → 编码选择 UTF-8
2. 安装实用插件：
   - Compare（文件对比）
   - JSON Viewer
   - XML Tools
3. 设置为 .txt/.log/.xml 的默认打开方式` },
    { title: 'FileZilla FTP 客户端使用指南', categoryId: helpCatId('安装指南'), sort: 18, body: `# FileZilla 安装与使用

## 安装

从平台下载安装包并按向导完成安装。

## 连接服务器

1. 打开 FileZilla
2. 在快速连接栏填入：
   - 主机：服务器地址
   - 用户名和密码
   - 端口：21（FTP）或 22（SFTP）
3. 点击「快速连接」

## 文件传输

- 左侧为本地文件，右侧为服务器文件
- 双击或拖拽即可传输
- 支持断点续传和队列管理` },

    // 激活说明 (16)
    { title: 'Windows 11 激活完整教程', categoryId: helpCatId('激活说明'), sort: 1, body: `# Windows 11 激活教程

## 获取激活码

1. 登录本平台
2. 进入「软件激活」页面
3. 选择「Windows 激活」
4. 点击「获取激活码」
5. 记录显示的 6 位激活码

## 使用激活客户端

1. 下载激活客户端（激活页面提供下载链接）
2. 右键以**管理员身份**运行激活客户端
3. 输入 6 位激活码
4. 点击「激活」按钮
5. 等待激活完成

## 验证激活状态

1. 打开设置 → 系统 → 激活
2. 查看激活状态应显示「Windows 已激活」
3. 或在命令提示符中运行：\`slmgr /xpr\`

## 常见问题

- **激活失败 0xC004F074**：请检查网络连接
- **激活码无效**：确认码未被使用过，且对应正确的产品
- **无法连接激活服务器**：检查防火墙设置` },
    { title: 'Windows 10 激活教程', categoryId: helpCatId('激活说明'), sort: 2, body: `# Windows 10 激活教程

## 操作步骤

1. 从平台获取 Windows 激活码（6位）
2. 下载并以管理员身份运行激活客户端
3. 输入激活码完成激活

## KMS 激活说明

本单位使用 KMS 批量激活方式：
- 激活后有效期 180 天
- 在单位网络内会自动续期
- 离开单位网络超过 180 天需重新激活

## 重新激活

如果系统提示需要重新激活：
1. 确保连接到单位网络
2. 以管理员身份打开命令提示符
3. 运行激活客户端
4. 输入新的激活码` },
    { title: 'Office 2024 激活教程', categoryId: helpCatId('激活说明'), sort: 3, body: `# Microsoft Office 2024 激活教程

## 方式一：通过平台激活

1. 登录平台获取 Office 激活码
2. 下载 Office 激活客户端
3. 关闭所有 Office 应用程序
4. 以管理员身份运行激活客户端
5. 输入 6 位激活码
6. 等待激活成功提示

## 方式二：手动输入密钥

1. 打开任意 Office 应用
2. 文件 → 账户 → 更改产品密钥
3. 输入完整的 25 位产品密钥
4. 点击激活

## 验证激活状态

打开 Word → 文件 → 账户，查看产品信息中的激活状态。` },
    { title: 'Office 2021 激活教程', categoryId: helpCatId('激活说明'), sort: 4, body: `# Microsoft Office 2021 激活教程

## 激活步骤

1. 确保 Office 2021 已正确安装
2. 从平台获取 Office 激活码
3. 下载并运行激活客户端
4. 按提示输入激活码完成激活

## 注意事项

- Office 2021 和 Office 2024 使用不同的激活码
- 请确认版本后再领取对应的激活码
- 如果之前安装过其他版本，请先彻底卸载` },
    { title: 'WPS Office 激活教程', categoryId: helpCatId('激活说明'), sort: 5, body: `# WPS Office 激活教程

## 激活方式

### 在线激活（推荐）
1. 登录平台获取 WPS 激活码
2. 打开 WPS 任意组件
3. 点击右上角头像 → 输入序列号
4. 输入 6 位激活码
5. 系统自动完成验证和激活

### 离线激活
1. 获取激活码后下载离线激活包
2. 运行离线激活工具
3. 输入激活码完成激活

## 激活状态查看

打开 WPS → 点击头像 → 关于 WPS，查看授权信息。` },
    { title: 'Visio 2024 激活教程', categoryId: helpCatId('激活说明'), sort: 6, body: `# Visio 2024 激活教程

Visio 的激活方式与 Office 相同，使用平台提供的激活客户端完成激活。

## 步骤

1. 安装 Visio Professional 2024
2. 从平台获取激活码
3. 运行激活客户端，选择「Visio」产品
4. 输入激活码
5. 激活完成` },
    { title: 'Project 2024 激活教程', categoryId: helpCatId('激活说明'), sort: 7, body: `# Project 2024 激活教程

## 激活步骤

1. 确认已安装 Project Professional 2024
2. 从平台获取激活码
3. 以管理员身份运行激活客户端
4. 选择 Project 产品
5. 输入 6 位激活码
6. 等待激活完成

激活成功后可在 Project → 文件 → 账户中确认。` },
    { title: '批量激活码使用说明', categoryId: helpCatId('激活说明'), sort: 8, body: `# 批量激活码使用说明

## 适用场景

当需要为多台电脑批量激活时，管理员可使用批量激活流程。

## 操作步骤

1. 管理员在后台批量导入激活码
2. 编写部署脚本（激活客户端支持命令行参数）
3. 通过域控组策略或远程管理工具分发
4. 激活客户端支持静默模式：\`activate.exe /code:XXXXXX /silent\`

## 激活码管理

- 管理员可在后台查看每个码的使用状态
- 支持按批次、产品筛选
- 发放记录完整审计可查` },
    { title: '激活失败排查指南', categoryId: helpCatId('激活说明'), sort: 9, body: `# 激活失败排查指南

## 常见错误及解决方案

### 错误：激活服务器无法连接
- 检查网络是否连通
- 确认防火墙未拦截激活客户端
- 尝试关闭 VPN 后重试

### 错误：激活码无效
- 确认码未被使用过（在平台「我的激活码」中查看）
- 确认产品类型匹配（Windows码不能激活Office）
- 确认码没有过期

### 错误：权限不足
- 必须以管理员身份运行激活客户端
- 右键 → 以管理员身份运行

### 错误：产品版本不匹配
- 确认安装的软件版本与激活码对应
- 例如 Office 2024 的码不能激活 Office 2021

## 仍然无法解决？

请提交工单，附上以下信息：
1. 完整的错误提示截图
2. 操作系统版本
3. 软件版本号
4. 使用的激活码` },
    { title: '激活码安全须知', categoryId: helpCatId('激活说明'), sort: 10, body: `# 激活码安全须知

## 请遵守以下规定

1. **一人一码**：每位用户每个产品仅可领取一个激活码
2. **禁止转让**：激活码仅供本人使用，不得转让给他人
3. **禁止外泄**：不得将激活码发布到互联网或分享给非本单位人员
4. **及时使用**：领取后请尽快完成激活

## 违规处理

- 发现转让或外泄行为，将收回激活码并禁用账号
- 严重者将上报主管部门处理

## 丢失处理

如果忘记已领取的激活码：
1. 登录平台 → 「我的激活码」页面查看
2. 或联系管理员协助查询` },
    { title: 'Windows Server 激活说明', categoryId: helpCatId('激活说明'), sort: 11, body: `# Windows Server 2022 激活说明

## 服务器激活流程

1. 以管理员身份登录服务器
2. 打开 PowerShell
3. 运行激活客户端
4. 输入从平台获取的激活码

## 命令行激活（可选）

\`\`\`powershell
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
slmgr /ato
\`\`\`

## 注意事项

- Server 标准版和数据中心版使用不同的密钥
- 确保服务器可访问 KMS 激活服务器
- 建议通过内网激活` },
    { title: 'Microsoft 365 激活说明', categoryId: helpCatId('激活说明'), sort: 12, body: `# Microsoft 365 激活说明

## 与传统 Office 的区别

Microsoft 365 采用账号订阅制，无需输入产品密钥。

## 激活步骤

1. 从管理员处获取 Microsoft 365 企业账号
2. 安装 Microsoft 365 应用
3. 打开 Word 等应用
4. 使用分配的账号（xxx@org.com）登录
5. 系统自动完成授权

## 账号管理

- 账号由 IT 管理员在 Microsoft 365 管理中心管理
- 如需申请，请通过平台「云服务」页面提交申请` },
    { title: 'Adobe Acrobat 激活说明', categoryId: helpCatId('激活说明'), sort: 13, body: `# Adobe Acrobat Pro 激活说明

## 激活方式

Adobe Acrobat 使用序列号激活：
1. 安装完成后打开 Acrobat
2. 帮助 → 激活
3. 输入序列号（24位）
4. 选择在线激活
5. 激活完成

> 序列号请联系管理员获取，不通过平台激活码系统。` },
    { title: '国产操作系统激活说明', categoryId: helpCatId('激活说明'), sort: 14, body: `# 国产操作系统激活说明

## 银河麒麟 V10

银河麒麟采用在线授权方式：
1. 联系管理员获取授权文件
2. 打开控制中心 → 授权管理
3. 导入授权文件
4. 重启系统生效

## 统信 UOS

1. 打开控制中心 → 系统信息 → 授权激活
2. 输入激活码或导入授权文件
3. 在线验证后完成激活

## 注意事项

国产系统激活码与 Windows 激活码不通用，请联系管理员单独获取。` },
    { title: '多台电脑激活同一产品说明', categoryId: helpCatId('激活说明'), sort: 15, body: `# 多台电脑激活说明

## 许可模式

本单位采用批量许可（Volume License）方式：
- 每个激活码对应一台设备
- 重装系统后需使用同一个码重新激活
- 更换电脑需使用新的激活码

## 重装后重新激活

如果是同一台电脑重装系统：
1. 登录平台查看「我的激活码」
2. 使用之前的激活码重新激活即可

## 更换电脑

需要为新电脑激活时：
1. 联系管理员回收旧电脑的激活码
2. 在平台领取新的激活码` },
    { title: '永中 Office 激活教程', categoryId: helpCatId('激活说明'), sort: 16, body: `# 永中 Office 激活教程

## 激活步骤

1. 安装永中 Office 2024
2. 打开任意组件
3. 帮助 → 产品激活
4. 输入序列号
5. 选择在线激活
6. 激活成功

序列号请联系管理员获取。` },

    // 常见问题 (16)
    { title: 'Office 打开文件很慢怎么办？', categoryId: helpCatId('常见问题'), sort: 1, body: `# Office 打开文件很慢的解决方法

## 可能原因及解决方案

### 1. 插件过多
- 文件 → 选项 → 加载项
- 禁用不必要的 COM 加载项

### 2. 文件过大
- 压缩文档中的图片：文件 → 信息 → 压缩图片
- 删除不需要的嵌入对象

### 3. 杀毒软件扫描
- 将 Office 程序添加到杀毒软件白名单

### 4. 硬件配置不足
- 建议内存 8GB 以上
- 使用 SSD 硬盘

### 5. 修复 Office
- 控制面板 → 程序和功能 → Microsoft Office → 更改 → 联机修复` },
    { title: 'Excel 公式不自动计算怎么办？', categoryId: helpCatId('常见问题'), sort: 2, body: `# Excel 公式不自动计算

## 解决方法

1. 检查计算模式：
   - 公式 → 计算选项 → 确保选择「自动」
   
2. 如果单元格显示公式文本而非结果：
   - 检查单元格格式是否为「文本」
   - 改为「常规」格式后重新输入公式

3. 按 Ctrl+\` 可切换公式显示和结果显示

4. 强制重新计算：按 Ctrl+Alt+F9` },
    { title: '打印机无法连接怎么处理？', categoryId: helpCatId('常见问题'), sort: 3, body: `# 打印机无法连接解决方案

## 排查步骤

### 1. 检查物理连接
- USB 打印机：检查 USB 线是否牢固
- 网络打印机：确认打印机已联网且亮灯正常

### 2. 重启打印服务
- Win+R 输入 \`services.msc\`
- 找到 Print Spooler 服务
- 右键 → 重新启动

### 3. 重新安装驱动
- 设备管理器 → 打印机 → 卸载设备
- 重新添加打印机

### 4. 网络打印机添加
- 设置 → 设备 → 打印机和扫描仪
- 添加打印机 → 我需要的打印机不在列表中
- 输入打印机 IP 地址：\\\\\\\\IP\\\\打印机名

## 仍然无法解决？

提交工单并附上：
1. 打印机型号
2. 连接方式（USB/网络）
3. 错误提示截图` },
    { title: '电脑运行速度慢怎么优化？', categoryId: helpCatId('常见问题'), sort: 4, body: `# 电脑运行速度优化指南

## 基本优化

### 1. 清理启动项
- 任务管理器 → 启动 → 禁用不必要的程序

### 2. 磁盘清理
- 在文件资源管理器中右键 C 盘 → 属性 → 磁盘清理
- 或使用存储感知：设置 → 系统 → 存储

### 3. 检查磁盘空间
- C 盘剩余空间应保持 20% 以上

### 4. 关闭视觉效果
- 此电脑 → 属性 → 高级系统设置 → 性能设置 → 调整为最佳性能

## 进阶优化

### 5. 升级硬件
- 将机械硬盘更换为 SSD（提升最明显）
- 增加内存到 16GB

### 6. 检查恶意软件
- 运行完整的杀毒扫描
- 使用 Windows 安全中心扫描` },
    { title: 'Windows 更新失败怎么办？', categoryId: helpCatId('常见问题'), sort: 5, body: `# Windows 更新失败解决方案

## 方法一：运行疑难解答
设置 → 更新和安全 → 疑难解答 → Windows 更新

## 方法二：清理更新缓存
1. 以管理员身份打开命令提示符
2. 依次运行：
\`\`\`
net stop wuauserv
net stop bits
rd /s /q C:\\Windows\\SoftwareDistribution
net start wuauserv
net start bits
\`\`\`
3. 重新检查更新

## 方法三：使用更新助手
从微软官网下载 Windows Update Assistant 强制更新。

## 方法四：手动下载补丁
1. 记录更新的 KB 编号
2. 访问 Microsoft Update Catalog
3. 搜索并下载对应补丁手动安装` },
    { title: '如何设置文件默认打开方式？', categoryId: helpCatId('常见问题'), sort: 6, body: `# 设置文件默认打开方式

## Windows 11/10

### 方法一：右键设置
1. 右键点击文件 → 打开方式 → 选择其他应用
2. 选择想要的程序
3. 勾选「始终使用此应用打开 .xxx 文件」
4. 点击「确定」

### 方法二：系统设置
1. 设置 → 应用 → 默认应用
2. 在搜索框中输入文件扩展名（如 .pdf）
3. 选择默认打开程序

## 常见文件类型建议

| 文件类型 | 推荐程序 |
|---------|---------|
| .pdf | Adobe Acrobat |
| .doc/.docx | Word / WPS |
| .xls/.xlsx | Excel / WPS |
| .txt | Notepad++ |
| .zip/.7z | 7-Zip |` },
    { title: '忘记 Windows 登录密码怎么办？', categoryId: helpCatId('常见问题'), sort: 7, body: `# 忘记 Windows 密码解决方案

## 微软账号登录

如果使用微软账号登录：
1. 在登录界面点击「我忘记了密码」
2. 通过绑定的手机或邮箱验证身份
3. 重置密码

## 本地账号

1. 尝试使用密码提示
2. 联系 IT 管理员使用管理员账号重置
3. 使用 PE 工具盘清除密码（需授权）

## 预防建议

- 设置安全问题作为密码找回方式
- 使用 PIN 码或 Windows Hello 作为备用登录方式
- 定期更新密码并记录在安全位置` },
    { title: '网络连接不稳定怎么排查？', categoryId: helpCatId('常见问题'), sort: 8, body: `# 网络连接不稳定排查指南

## 基本排查

### 1. 重启网络设备
拔掉路由器电源 → 等待 30 秒 → 重新通电

### 2. 重置网络设置
以管理员身份运行命令提示符：
\`\`\`
ipconfig /release
ipconfig /flushdns
ipconfig /renew
netsh winsock reset
\`\`\`

### 3. 检查 DNS
尝试使用公共 DNS：
- 首选：223.5.5.5
- 备选：114.114.114.114

### 4. 检查网卡驱动
- 设备管理器 → 网络适配器
- 更新或重新安装网卡驱动

## 无线网络额外检查

- 是否信号太弱？靠近路由器试试
- 是否信道拥挤？更换 Wi-Fi 信道
- 尝试切换 2.4GHz 和 5GHz 频段` },
    { title: 'Word 文档排版技巧', categoryId: helpCatId('常见问题'), sort: 9, body: `# Word 文档排版实用技巧

## 基本排版

### 样式的使用
- 使用「标题 1」「标题 2」等样式而非手动调整字号
- 好处：可自动生成目录，统一修改格式

### 段落设置
- 段前段后间距：设计 → 段落间距
- 行距：建议正文用 1.5 倍行距

## 高级排版

### 分节符
- 插入 → 分隔符 → 分节符
- 不同节可以设置不同的页眉页脚和页面方向

### 页眉页脚
- 双击页眉/页脚区域编辑
- 插入页码：插入 → 页码

### 目录
1. 使用标题样式标记各级标题
2. 引用 → 目录 → 自动目录
3. 更新目录：右键目录 → 更新域` },
    { title: '如何备份电脑数据？', categoryId: helpCatId('常见问题'), sort: 10, body: `# 电脑数据备份指南

## 备份策略：3-2-1 原则

- **3** 份数据副本
- **2** 种不同存储介质
- **1** 份异地备份

## Windows 自带备份

### 文件历史记录
设置 → 更新和安全 → 备份 → 使用文件历史记录进行备份

### 系统映像
控制面板 → 备份和还原 → 创建系统映像

## 推荐备份方案

| 数据类型 | 备份方式 | 频率 |
|---------|---------|------|
| 工作文档 | 云同步（OneDrive） | 实时 |
| 系统配置 | 系统还原点 | 每周 |
| 全盘 | 外部硬盘镜像 | 每月 |

## 重要提醒

- 定期检查备份是否可正常恢复
- 不要将备份存储在同一块硬盘上` },
    { title: 'Outlook 邮件收发异常排查', categoryId: helpCatId('常见问题'), sort: 11, body: `# Outlook 邮件收发异常解决

## 常见问题排查

### 无法发送邮件
1. 检查网络连接
2. 检查 SMTP 服务器设置
3. 确认账号密码正确
4. 检查发件箱是否有卡住的邮件

### 无法接收邮件
1. 检查收件箱规则是否误将邮件移动
2. 确认 POP3/IMAP 设置正确
3. 检查邮箱容量是否已满

### 配置建议
- 推荐使用 IMAP 而非 POP3
- 定期清理已删除邮件和垃圾箱
- 大附件建议使用云端链接分享` },
    { title: 'U盘无法识别怎么办？', categoryId: helpCatId('常见问题'), sort: 12, body: `# U盘无法识别解决方案

## 排查步骤

1. **换个 USB 口**：尝试插入不同的 USB 端口
2. **换台电脑**：确认是 U 盘问题还是电脑问题
3. **检查设备管理器**：
   - 查看是否有黄色感叹号
   - 右键 → 更新驱动程序
4. **磁盘管理**：
   - Win+R → diskmgmt.msc
   - 查看 U 盘是否显示但未分配盘符
   - 右键 → 更改驱动器号和路径
5. **数据恢复**：如有重要数据，联系 IT 管理员使用专业工具恢复` },
    { title: '如何连接投影仪/外接显示器？', categoryId: helpCatId('常见问题'), sort: 13, body: `# 连接投影仪/外接显示器

## 连接方式

1. **HDMI**：直接连接即可，即插即用
2. **VGA**：老式接口，需要 VGA 线
3. **Type-C/雷电**：使用转接器连接

## 显示模式切换

按 **Win + P** 可快速切换：
- 仅电脑屏幕
- 复制（两个屏幕显示相同内容）
- 扩展（两个屏幕独立显示）
- 仅第二屏幕

## 分辨率调整

设置 → 系统 → 显示 → 选择外接显示器 → 调整分辨率

## 常见问题

- **无信号**：检查线缆连接，尝试重新插拔
- **画面溢出**：调整分辨率或在投影仪上选择自动调整
- **无声音**：右键音量图标 → 声音设置 → 切换输出设备` },
    { title: '如何安全地使用公共 WiFi？', categoryId: helpCatId('常见问题'), sort: 14, body: `# 安全使用公共 WiFi 指南

## 风险提示

公共 WiFi 存在以下安全风险：
- 中间人攻击
- 数据窃取
- 虚假热点

## 安全建议

1. **使用 VPN**：连接公共 WiFi 前先开启单位 VPN
2. **检查 HTTPS**：确保访问的网站使用 HTTPS 加密
3. **关闭自动连接**：不要自动连接未知的 WiFi
4. **避免敏感操作**：不要在公共 WiFi 下登录银行或处理机密文件
5. **开启防火墙**：确保 Windows 防火墙处于开启状态
6. **忘记网络**：使用完后在设置中忘记该 WiFi 网络` },
    { title: '电脑突然蓝屏如何处理？', categoryId: helpCatId('常见问题'), sort: 15, body: `# 电脑蓝屏处理指南

## 应急处理

1. 记录蓝屏上的**停止代码**（如 CRITICAL_PROCESS_DIED）
2. 如果电脑自动重启，查看事件查看器中的错误日志

## 常见蓝屏代码

| 代码 | 可能原因 | 解决方法 |
|------|---------|---------|
| IRQL_NOT_LESS_OR_EQUAL | 驱动冲突 | 更新或回滚驱动 |
| CRITICAL_PROCESS_DIED | 系统文件损坏 | 运行 sfc /scannow |
| PAGE_FAULT_IN_NONPAGED_AREA | 内存问题 | 运行内存诊断工具 |
| KERNEL_DATA_INPAGE_ERROR | 硬盘故障 | 检查硬盘健康状态 |

## 通用解决步骤

1. 进入安全模式（重启时按 F8）
2. 卸载最近安装的软件或驱动
3. 运行系统文件检查：\`sfc /scannow\`
4. 运行 DISM 修复：\`DISM /Online /Cleanup-Image /RestoreHealth\`
5. 检查内存：Windows 内存诊断工具

## 如反复蓝屏

请提交工单并附上蓝屏代码，IT 人员将协助处理。` },
    { title: '如何加密和保护重要文件？', categoryId: helpCatId('常见问题'), sort: 16, body: `# 文件加密与保护指南

## Office 文档加密

### Word/Excel/PowerPoint
1. 文件 → 信息 → 保护文档 → 用密码进行加密
2. 设置打开密码
3. 保存文件

### PDF 加密
使用 Adobe Acrobat：
文件 → 属性 → 安全性 → 设置密码

## Windows 自带加密

### BitLocker（专业版以上）
1. 右键磁盘 → 启用 BitLocker
2. 选择解锁方式
3. 备份恢复密钥（重要！）

### EFS 文件加密
1. 右键文件 → 属性 → 高级
2. 勾选「加密内容以便保护数据」

## 压缩包加密

使用 7-Zip 创建加密压缩包：
1. 选中文件 → 右键 → 7-Zip → 添加到压缩包
2. 设置密码
3. 加密方式选择 AES-256` },
  ];

  let helpInserted = 0;
  for (const doc of helpData) {
    const exists = db.select().from(schema.helpDocuments)
      .where(eq(schema.helpDocuments.title, doc.title)).get();
    if (!exists) {
      db.insert(schema.helpDocuments).values({
        ...doc,
        status: 'published',
        publishedAt: new Date().toISOString(),
      }).run();
      helpInserted++;
    }
  }
  console.log(`Inserted ${helpInserted} help documents (total defined: ${helpData.length})`);

  // ─── 监控系统示例数据 ─────────────────────────────
  const allUsers = db.select().from(schema.users).all();
  const adminUser = allUsers.find(u => u.role === 'admin') ?? allUsers[0];
  const adminId = adminUser?.id ?? 1;

  // ─── 1. 监控目标 (monitorTargets) - 6个 ──────────
  const mtData = [
    { name: '正版化平台Web服务器', type: 'system' as const, host: '192.168.1.10', port: 8080, status: 'online' as const, description: '正版化平台主Web服务器' },
    { name: '数据库服务器', type: 'database' as const, host: '192.168.1.11', port: 3306, status: 'online' as const, description: 'MySQL主数据库服务器' },
    { name: 'KMS激活服务', type: 'service' as const, host: '192.168.1.12', port: 1688, status: 'online' as const, description: 'KMS批量激活服务' },
    { name: '文件存储服务器', type: 'system' as const, host: '192.168.1.13', port: 445, status: 'warning' as const, description: '文件共享存储服务器，磁盘空间紧张' },
    { name: '核心网络交换机', type: 'device' as const, host: '192.168.1.1', port: 161, status: 'online' as const, description: '核心层三层交换机' },
    { name: '边界防火墙', type: 'device' as const, host: '192.168.1.254', port: 443, status: 'online' as const, description: '边界安全防火墙设备' },
  ];
  let mtInserted = 0;
  for (const t of mtData) {
    if (!db.select().from(schema.monitorTargets).where(eq(schema.monitorTargets.name, t.name)).get()) {
      db.insert(schema.monitorTargets).values(t).run(); mtInserted++;
    }
  }
  console.log(`Inserted ${mtInserted} monitor targets`);
  const mTargets = db.select().from(schema.monitorTargets).all();
  const mtId = (n: string) => mTargets.find(t => t.name === n)?.id ?? 1;

  // ─── 2. 监控项 (monitorItems) - 15个 ──────────
  const miData = [
    { targetId: mtId('正版化平台Web服务器'), name: 'CPU使用率', key: 'cpu_usage', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('正版化平台Web服务器'), name: '内存使用率', key: 'mem_usage', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('正版化平台Web服务器'), name: '响应时间', key: 'response_time', unit: 'ms', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('数据库服务器'), name: '连接数', key: 'db_connections', unit: '个', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('数据库服务器'), name: '查询响应时间', key: 'query_time', unit: 'ms', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('数据库服务器'), name: '磁盘使用率', key: 'disk_usage', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('KMS激活服务'), name: '在线激活数', key: 'active_sessions', unit: '个', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('KMS激活服务'), name: '请求成功率', key: 'success_rate', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('文件存储服务器'), name: '磁盘使用率', key: 'disk_usage', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('文件存储服务器'), name: 'IO等待', key: 'io_wait', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('文件存储服务器'), name: '带宽使用', key: 'bandwidth', unit: 'MB/s', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('核心网络交换机'), name: '端口流量', key: 'port_traffic', unit: 'Mbps', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('核心网络交换机'), name: 'CPU使用率', key: 'cpu_usage', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('边界防火墙'), name: '并发连接数', key: 'concurrent_conn', unit: '个', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
    { targetId: mtId('边界防火墙'), name: '丢包率', key: 'drop_rate', unit: '%', collectMethod: 'auto' as const, collectInterval: 60, enabled: 1 },
  ];
  let miInserted = 0;
  for (const item of miData) {
    if (!db.select().from(schema.monitorItems).where(and(eq(schema.monitorItems.targetId, item.targetId), eq(schema.monitorItems.key, item.key))).get()) {
      db.insert(schema.monitorItems).values(item).run(); miInserted++;
    }
  }
  console.log(`Inserted ${miInserted} monitor items`);
  const mItems = db.select().from(schema.monitorItems).all();
  const mItemId = (tn: string, k: string) => {
    const tid = mtId(tn);
    return mItems.find(i => i.targetId === tid && i.key === k)?.id ?? 1;
  };

  // ─── 3. 阈值规则 (monitorThresholds) - 每项2条，共30条 ──────────
  const mthData = [
    // Web服务器 - CPU使用率
    { itemId: mItemId('正版化平台Web服务器', 'cpu_usage'), level: 'warning' as const, operator: 'gt' as const, value: 80, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('正版化平台Web服务器', 'cpu_usage'), level: 'critical' as const, operator: 'gt' as const, value: 95, action: '自动重启服务并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // Web服务器 - 内存使用率
    { itemId: mItemId('正版化平台Web服务器', 'mem_usage'), level: 'warning' as const, operator: 'gt' as const, value: 85, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('正版化平台Web服务器', 'mem_usage'), level: 'critical' as const, operator: 'gt' as const, value: 95, action: '自动清理缓存并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // Web服务器 - 响应时间
    { itemId: mItemId('正版化平台Web服务器', 'response_time'), level: 'warning' as const, operator: 'gt' as const, value: 1000, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('正版化平台Web服务器', 'response_time'), level: 'critical' as const, operator: 'gt' as const, value: 3000, action: '自动切换备用服务器', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 数据库 - 连接数
    { itemId: mItemId('数据库服务器', 'db_connections'), level: 'warning' as const, operator: 'gt' as const, value: 150, action: '发送邮件通知DBA', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('数据库服务器', 'db_connections'), level: 'critical' as const, operator: 'gt' as const, value: 200, action: '自动释放空闲连接并通知DBA', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 数据库 - 查询响应时间
    { itemId: mItemId('数据库服务器', 'query_time'), level: 'warning' as const, operator: 'gt' as const, value: 500, action: '发送邮件通知DBA', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('数据库服务器', 'query_time'), level: 'critical' as const, operator: 'gt' as const, value: 2000, action: '自动杀掉慢查询并通知DBA', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 数据库 - 磁盘使用率
    { itemId: mItemId('数据库服务器', 'disk_usage'), level: 'warning' as const, operator: 'gt' as const, value: 80, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('数据库服务器', 'disk_usage'), level: 'critical' as const, operator: 'gt' as const, value: 90, action: '自动清理日志并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // KMS - 在线激活数
    { itemId: mItemId('KMS激活服务', 'active_sessions'), level: 'warning' as const, operator: 'gt' as const, value: 500, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('KMS激活服务', 'active_sessions'), level: 'critical' as const, operator: 'gt' as const, value: 800, action: '自动扩展服务并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // KMS - 请求成功率（低于阈值告警）
    { itemId: mItemId('KMS激活服务', 'success_rate'), level: 'warning' as const, operator: 'lt' as const, value: 95, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已降至${value}${unit}，低于${level}阈值${threshold}' },
    { itemId: mItemId('KMS激活服务', 'success_rate'), level: 'critical' as const, operator: 'lt' as const, value: 90, action: '自动重启服务并通知管理员', notifyMessage: '${target}的${item}已降至${value}${unit}，低于${level}阈值${threshold}' },
    // 文件服务器 - 磁盘使用率
    { itemId: mItemId('文件存储服务器', 'disk_usage'), level: 'warning' as const, operator: 'gt' as const, value: 80, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('文件存储服务器', 'disk_usage'), level: 'critical' as const, operator: 'gt' as const, value: 90, action: '自动归档旧文件并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 文件服务器 - IO等待
    { itemId: mItemId('文件存储服务器', 'io_wait'), level: 'warning' as const, operator: 'gt' as const, value: 20, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('文件存储服务器', 'io_wait'), level: 'critical' as const, operator: 'gt' as const, value: 40, action: '自动限流并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 文件服务器 - 带宽使用
    { itemId: mItemId('文件存储服务器', 'bandwidth'), level: 'warning' as const, operator: 'gt' as const, value: 80, action: '发送邮件通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('文件存储服务器', 'bandwidth'), level: 'critical' as const, operator: 'gt' as const, value: 100, action: '自动限速并通知管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 交换机 - 端口流量
    { itemId: mItemId('核心网络交换机', 'port_traffic'), level: 'warning' as const, operator: 'gt' as const, value: 800, action: '发送邮件通知网络管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('核心网络交换机', 'port_traffic'), level: 'critical' as const, operator: 'gt' as const, value: 950, action: '自动QoS限流并通知网络管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 交换机 - CPU使用率
    { itemId: mItemId('核心网络交换机', 'cpu_usage'), level: 'warning' as const, operator: 'gt' as const, value: 70, action: '发送邮件通知网络管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('核心网络交换机', 'cpu_usage'), level: 'critical' as const, operator: 'gt' as const, value: 90, action: '自动切换备用路径并通知网络管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 防火墙 - 并发连接数
    { itemId: mItemId('边界防火墙', 'concurrent_conn'), level: 'warning' as const, operator: 'gt' as const, value: 50000, action: '发送邮件通知安全管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('边界防火墙', 'concurrent_conn'), level: 'critical' as const, operator: 'gt' as const, value: 80000, action: '自动启用DDoS防护并通知安全管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    // 防火墙 - 丢包率
    { itemId: mItemId('边界防火墙', 'drop_rate'), level: 'warning' as const, operator: 'gt' as const, value: 1, action: '发送邮件通知安全管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
    { itemId: mItemId('边界防火墙', 'drop_rate'), level: 'critical' as const, operator: 'gt' as const, value: 5, action: '自动切换备用链路并通知安全管理员', notifyMessage: '${target}的${item}已达到${value}${unit}，超过${level}阈值${threshold}' },
  ];
  let mthInserted = 0;
  for (const th of mthData) {
    if (!db.select().from(schema.monitorThresholds).where(and(eq(schema.monitorThresholds.itemId, th.itemId), eq(schema.monitorThresholds.level, th.level))).get()) {
      db.insert(schema.monitorThresholds).values(th).run(); mthInserted++;
    }
  }
  console.log(`Inserted ${mthInserted} monitor thresholds`);
  const mThresholds = db.select().from(schema.monitorThresholds).all();
  const mThId = (iid: number, level: string) => mThresholds.find(t => t.itemId === iid && t.level === level)?.id ?? 1;

  // ─── 4. 采集记录 (monitorRecords) - 200+条 ──────────
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * dayMs;
  const itemRanges: Record<string, { min: number; max: number; warn: number; crit: number; lowIsBad?: boolean }> = {
    cpu_usage: { min: 15, max: 60, warn: 80, crit: 95 },
    mem_usage: { min: 40, max: 70, warn: 85, crit: 95 },
    response_time: { min: 50, max: 500, warn: 1000, crit: 3000 },
    db_connections: { min: 20, max: 100, warn: 150, crit: 200 },
    query_time: { min: 10, max: 200, warn: 500, crit: 2000 },
    disk_usage: { min: 55, max: 78, warn: 80, crit: 90 },
    active_sessions: { min: 50, max: 300, warn: 500, crit: 800 },
    success_rate: { min: 96, max: 99.9, warn: 95, crit: 90, lowIsBad: true },
    io_wait: { min: 2, max: 15, warn: 20, crit: 40 },
    bandwidth: { min: 20, max: 60, warn: 80, crit: 100 },
    port_traffic: { min: 200, max: 600, warn: 800, crit: 950 },
    concurrent_conn: { min: 5000, max: 30000, warn: 50000, crit: 80000 },
    drop_rate: { min: 0.01, max: 0.5, warn: 1, crit: 5 },
  };
  const mRecords: { itemId: number; value: number; status: 'normal' | 'warning' | 'critical'; collectedAt: string }[] = [];
  // 伪随机生成器，保证每次运行数据一致
  let seed = 42;
  const pr = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (const item of mItems) {
    const range = itemRanges[item.key];
    if (!range) continue;
    let ts = now - sevenDaysMs;
    while (ts < now) {
      const r = pr();
      let value: number; let status: 'normal' | 'warning' | 'critical';
      if (r < 0.04) {
        // 4% critical异常值
        value = range.lowIsBad ? range.crit - pr() * 5 : range.crit + pr() * 5;
        status = 'critical';
      } else if (r < 0.10) {
        // 6% warning异常值
        value = range.lowIsBad ? range.warn - pr() * 3 : range.warn + pr() * 5;
        status = 'warning';
      } else {
        // 90% 正常值
        value = range.min + pr() * (range.max - range.min);
        status = 'normal';
      }
      value = Math.round(value * 100) / 100;
      mRecords.push({ itemId: item.id, value, status, collectedAt: new Date(ts).toISOString() });
      ts += (4 + pr() * 2) * 60 * 60 * 1000; // 4-6小时间隔
    }
  }
  // 仅在表为空时插入，避免重复
  const existingRecordCount = db.select().from(schema.monitorRecords).all().length;
  if (existingRecordCount === 0 && mRecords.length > 0) {
    db.insert(schema.monitorRecords).values(mRecords).run();
  }
  console.log(`Skipped/inserted ${mRecords.length} monitor records (existing: ${existingRecordCount})`);

  // ─── 5. 告警记录 (monitorAlerts) - 12条 ──────────
  // 4条 pending (1-2天前), 4条 acknowledged (3-4天前), 4条 resolved (5-7天前)
  const maData = [
    // pending - 最近1-2天
    { itemId: mItemId('正版化平台Web服务器', 'cpu_usage'), thresholdId: mThId(mItemId('正版化平台Web服务器', 'cpu_usage'), 'warning'), level: 'warning' as const, value: 85.3, message: '正版化平台Web服务器的CPU使用率已达到85.3%，超过warning阈值80', status: 'pending' as const, createdAt: new Date(now - 1 * dayMs + 3600000).toISOString() },
    { itemId: mItemId('文件存储服务器', 'disk_usage'), thresholdId: mThId(mItemId('文件存储服务器', 'disk_usage'), 'critical'), level: 'critical' as const, value: 92.1, message: '文件存储服务器的磁盘使用率已达到92.1%，超过critical阈值90', status: 'pending' as const, createdAt: new Date(now - 1.5 * dayMs).toISOString() },
    { itemId: mItemId('数据库服务器', 'query_time'), thresholdId: mThId(mItemId('数据库服务器', 'query_time'), 'warning'), level: 'warning' as const, value: 680, message: '数据库服务器的查询响应时间已达到680ms，超过warning阈值500ms', status: 'pending' as const, createdAt: new Date(now - 2 * dayMs + 7200000).toISOString() },
    { itemId: mItemId('边界防火墙', 'drop_rate'), thresholdId: mThId(mItemId('边界防火墙', 'drop_rate'), 'warning'), level: 'warning' as const, value: 1.8, message: '边界防火墙的丢包率已达到1.8%，超过warning阈值1%', status: 'pending' as const, createdAt: new Date(now - 2 * dayMs).toISOString() },
    // acknowledged - 3-4天前
    { itemId: mItemId('正版化平台Web服务器', 'response_time'), thresholdId: mThId(mItemId('正版化平台Web服务器', 'response_time'), 'warning'), level: 'warning' as const, value: 1200, message: '正版化平台Web服务器的响应时间已达到1200ms，超过warning阈值1000ms', status: 'acknowledged' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 3 * dayMs + 3600000).toISOString(), createdAt: new Date(now - 3 * dayMs).toISOString() },
    { itemId: mItemId('文件存储服务器', 'io_wait'), thresholdId: mThId(mItemId('文件存储服务器', 'io_wait'), 'critical'), level: 'critical' as const, value: 45.2, message: '文件存储服务器的IO等待已达到45.2%，超过critical阈值40%', status: 'acknowledged' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 3.5 * dayMs + 7200000).toISOString(), createdAt: new Date(now - 3.5 * dayMs).toISOString() },
    { itemId: mItemId('KMS激活服务', 'success_rate'), thresholdId: mThId(mItemId('KMS激活服务', 'success_rate'), 'warning'), level: 'warning' as const, value: 93.5, message: 'KMS激活服务的请求成功率已降至93.5%，低于warning阈值95%', status: 'acknowledged' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 4 * dayMs + 3600000).toISOString(), createdAt: new Date(now - 4 * dayMs).toISOString() },
    { itemId: mItemId('核心网络交换机', 'port_traffic'), thresholdId: mThId(mItemId('核心网络交换机', 'port_traffic'), 'warning'), level: 'warning' as const, value: 850, message: '核心网络交换机的端口流量已达到850Mbps，超过warning阈值800Mbps', status: 'acknowledged' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 4 * dayMs + 7200000).toISOString(), createdAt: new Date(now - 4 * dayMs).toISOString() },
    // resolved - 5-7天前
    { itemId: mItemId('正版化平台Web服务器', 'mem_usage'), thresholdId: mThId(mItemId('正版化平台Web服务器', 'mem_usage'), 'critical'), level: 'critical' as const, value: 96.8, message: '正版化平台Web服务器的内存使用率已达到96.8%，超过critical阈值95%', status: 'resolved' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 6 * dayMs + 3600000).toISOString(), resolvedBy: adminId, resolvedAt: new Date(now - 5.5 * dayMs).toISOString(), createdAt: new Date(now - 6 * dayMs).toISOString() },
    { itemId: mItemId('数据库服务器', 'db_connections'), thresholdId: mThId(mItemId('数据库服务器', 'db_connections'), 'warning'), level: 'warning' as const, value: 165, message: '数据库服务器的连接数已达到165个，超过warning阈值150个', status: 'resolved' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 6.5 * dayMs + 3600000).toISOString(), resolvedBy: adminId, resolvedAt: new Date(now - 6 * dayMs).toISOString(), createdAt: new Date(now - 6.5 * dayMs).toISOString() },
    { itemId: mItemId('文件存储服务器', 'bandwidth'), thresholdId: mThId(mItemId('文件存储服务器', 'bandwidth'), 'critical'), level: 'critical' as const, value: 112.5, message: '文件存储服务器的带宽使用已达到112.5MB/s，超过critical阈值100MB/s', status: 'resolved' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 7 * dayMs + 7200000).toISOString(), resolvedBy: adminId, resolvedAt: new Date(now - 6.5 * dayMs).toISOString(), createdAt: new Date(now - 7 * dayMs).toISOString() },
    { itemId: mItemId('边界防火墙', 'concurrent_conn'), thresholdId: mThId(mItemId('边界防火墙', 'concurrent_conn'), 'warning'), level: 'warning' as const, value: 55000, message: '边界防火墙的并发连接数已达到55000个，超过warning阈值50000个', status: 'resolved' as const, acknowledgedBy: adminId, acknowledgedAt: new Date(now - 7 * dayMs + 3600000).toISOString(), resolvedBy: adminId, resolvedAt: new Date(now - 6.8 * dayMs).toISOString(), createdAt: new Date(now - 7 * dayMs).toISOString() },
  ];
  let maInserted = 0;
  for (const a of maData) {
    if (!db.select().from(schema.monitorAlerts).where(eq(schema.monitorAlerts.message, a.message)).get()) {
      db.insert(schema.monitorAlerts).values(a).run(); maInserted++;
    }
  }
  console.log(`Inserted ${maInserted} monitor alerts`);

  // ─── 6. 报告模板 (monitorReportTemplates) - 2个 ──────────
  const allItemIds = mItems.map(i => i.id);
  const dbItemIds = mItems.filter(i => {
    const target = mTargets.find(t => t.id === i.targetId);
    return target?.type === 'database';
  }).map(i => i.id);
  const mrtData = [
    { name: '系统运行周报模板', description: '每周系统运行状态汇总报告模板', config: JSON.stringify({ itemIds: allItemIds, display: { cpu_usage: 'chart', mem_usage: 'chart', response_time: 'chart', db_connections: 'chart', query_time: 'chart', disk_usage: 'table', active_sessions: 'chart', success_rate: 'chart', io_wait: 'chart', bandwidth: 'chart', port_traffic: 'chart', concurrent_conn: 'chart', drop_rate: 'chart' } }), createdBy: adminId },
    { name: '数据库健康检查模板', description: '数据库服务器健康状态检查报告模板', config: JSON.stringify({ itemIds: dbItemIds, display: { db_connections: 'chart', query_time: 'chart', disk_usage: 'table' } }), createdBy: adminId },
  ];
  let mrtInserted = 0;
  for (const t of mrtData) {
    if (!db.select().from(schema.monitorReportTemplates).where(eq(schema.monitorReportTemplates.name, t.name)).get()) {
      db.insert(schema.monitorReportTemplates).values(t).run(); mrtInserted++;
    }
  }
  console.log(`Inserted ${mrtInserted} monitor report templates`);
  const mTemplates = db.select().from(schema.monitorReportTemplates).all();
  const weeklyTplId = mTemplates.find(t => t.name === '系统运行周报模板')?.id;
  const dbTplId = mTemplates.find(t => t.name === '数据库健康检查模板')?.id;

  // ─── 7. 监控报告 (monitorReports) - 3份 ──────────
  const mrData = [
    {
      title: '监控系统日报 - ' + new Date(now - dayMs).toISOString().slice(0, 10),
      type: 'daily' as const,
      startTime: new Date(now - dayMs).toISOString(),
      endTime: new Date(now).toISOString(),
      content: JSON.stringify({
        summary: { totalTargets: 6, onlineTargets: 5, warningTargets: 1, criticalTargets: 0, totalAlerts: 3, pendingAlerts: 2, resolvedAlerts: 1 },
        highlights: ['文件存储服务器磁盘使用率持续高位', 'Web服务器CPU使用率在下午出现告警'],
      }),
      templateId: weeklyTplId,
      createdBy: adminId,
    },
    {
      title: '系统运行周报 - ' + new Date(now - 7 * dayMs).toISOString().slice(0, 10) + ' 至 ' + new Date(now).toISOString().slice(0, 10),
      type: 'weekly' as const,
      startTime: new Date(now - 7 * dayMs).toISOString(),
      endTime: new Date(now).toISOString(),
      content: JSON.stringify({
        summary: { totalTargets: 6, uptime: '99.8%', totalAlerts: 12, warningAlerts: 8, criticalAlerts: 4, resolvedRate: '66.7%' },
        weeklyTrend: '本周系统整体运行平稳，文件存储服务器磁盘空间紧张需关注，建议尽快扩容。',
        topIssues: ['文件存储服务器磁盘使用率超90%', 'Web服务器内存使用率一次达到critical'],
      }),
      templateId: weeklyTplId,
      createdBy: adminId,
    },
    {
      title: '数据库健康月报 - ' + new Date(now - 30 * dayMs).toISOString().slice(0, 7),
      type: 'monthly' as const,
      startTime: new Date(now - 30 * dayMs).toISOString(),
      endTime: new Date(now).toISOString(),
      content: JSON.stringify({
        summary: { avgConnections: 85, maxConnections: 165, avgQueryTime: 120, maxQueryTime: 680, diskUsageTrend: '持续增长' },
        recommendations: ['建议清理历史数据释放磁盘空间', '优化慢查询SQL', '考虑升级数据库服务器硬件'],
      }),
      templateId: dbTplId,
      createdBy: adminId,
    },
  ];
  let mrInserted = 0;
  for (const r of mrData) {
    if (!db.select().from(schema.monitorReports).where(eq(schema.monitorReports.title, r.title)).get()) {
      db.insert(schema.monitorReports).values(r).run(); mrInserted++;
    }
  }
  console.log(`Inserted ${mrInserted} monitor reports`);

  // ─── 8. 审计日志 (auditLogs) - 50+条 ──────────
  const auditTemplates = [
    { username: 'admin', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '管理员登录系统', result: 'success' as const },
    { username: 'admin', action: 'logout' as const, targetType: 'user' as const, targetName: null as string | null, detail: '管理员退出系统', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'software' as const, targetName: 'Windows 11 专业版' as string | null, detail: '新增软件项', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'software' as const, targetName: 'Office 2024 专业增强版' as string | null, detail: '更新软件信息', result: 'success' as const },
    { username: 'admin', action: 'delete' as const, targetType: 'document' as const, targetName: '过期的安装指南' as string | null, detail: '删除过期文档', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'activation' as const, targetName: 'WIN-批量激活' as string | null, detail: '批量创建激活码', result: 'success' as const },
    { username: 'admin', action: 'view' as const, targetType: 'user' as const, targetName: null as string | null, detail: '查看用户列表', result: 'success' as const },
    { username: 'admin', action: 'export' as const, targetType: 'software' as const, targetName: null as string | null, detail: '导出软件清单', result: 'success' as const },
    { username: 'admin', action: 'config' as const, targetType: 'system' as const, targetName: null as string | null, detail: '修改系统配置', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'faq' as const, targetName: '如何重置密码' as string | null, detail: '新增FAQ条目', result: 'success' as const },
    { username: 'zhangsan', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户登录系统', result: 'success' as const },
    { username: 'zhangsan', action: 'view' as const, targetType: 'software' as const, targetName: 'WPS Office 2024' as string | null, detail: '查看软件详情', result: 'success' as const },
    { username: 'zhangsan', action: 'create' as const, targetType: 'activation' as const, targetName: 'OFFICE-激活' as string | null, detail: '申请激活码', result: 'success' as const },
    { username: 'zhangsan', action: 'logout' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户退出系统', result: 'success' as const },
    { username: 'lisi', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户登录系统', result: 'success' as const },
    { username: 'lisi', action: 'create' as const, targetType: 'ticket' as const, targetName: '打印机无法连接' as string | null, detail: '提交工单', result: 'success' as const },
    { username: 'lisi', action: 'view' as const, targetType: 'document' as const, targetName: 'Windows 11 安装指南' as string | null, detail: '查看帮助文档', result: 'success' as const },
    { username: 'lisi', action: 'export' as const, targetType: 'asset' as const, targetName: null as string | null, detail: '导出资产清单', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'monitor' as const, targetName: '文件存储服务器' as string | null, detail: '更新监控目标配置', result: 'success' as const },
    { username: 'admin', action: 'view' as const, targetType: 'monitor' as const, targetName: null as string | null, detail: '查看监控仪表板', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'asset' as const, targetName: 'Dell R740服务器' as string | null, detail: '新增资产', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'ticket' as const, targetName: 'TK-2026051' as string | null, detail: '更新工单状态', result: 'success' as const },
    { username: 'admin', action: 'delete' as const, targetType: 'faq' as const, targetName: '旧版FAQ条目' as string | null, detail: '删除过时FAQ', result: 'success' as const },
    { username: 'admin', action: 'config' as const, targetType: 'system' as const, targetName: null as string | null, detail: '修改邮件通知配置', result: 'success' as const },
    { username: 'zhangsan', action: 'view' as const, targetType: 'activation' as const, targetName: '我的激活码' as string | null, detail: '查看已领取的激活码', result: 'success' as const },
    { username: 'zhangsan', action: 'create' as const, targetType: 'ticket' as const, targetName: '激活失败求助' as string | null, detail: '提交工单', result: 'success' as const },
    { username: 'lisi', action: 'update' as const, targetType: 'saas' as const, targetName: 'Microsoft 365' as string | null, detail: '续订SaaS服务', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'document' as const, targetName: '新员工入职指南' as string | null, detail: '新增帮助文档', result: 'success' as const },
    { username: 'admin', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '管理员登录系统', result: 'success' as const },
    { username: 'admin', action: 'export' as const, targetType: 'activation' as const, targetName: null as string | null, detail: '导出激活码使用报表', result: 'success' as const },
    { username: 'lisi', action: 'logout' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户退出系统', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'user' as const, targetName: 'zhangsan' as string | null, detail: '重置用户密码', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'software' as const, targetName: '福昕PDF编辑器' as string | null, detail: '新增软件项', result: 'success' as const },
    { username: 'admin', action: 'config' as const, targetType: 'database' as const, targetName: null as string | null, detail: '数据库备份策略调整', result: 'success' as const },
    { username: 'zhangsan', action: 'view' as const, targetType: 'saas' as const, targetName: '云服务列表' as string | null, detail: '浏览云服务', result: 'success' as const },
    { username: 'admin', action: 'delete' as const, targetType: 'software' as const, targetName: '已下架软件' as string | null, detail: '删除下架软件', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'activation' as const, targetName: 'WIN-批量激活' as string | null, detail: '更新激活码批次', result: 'success' as const },
    { username: 'lisi', action: 'create' as const, targetType: 'activation' as const, targetName: 'WPS-激活' as string | null, detail: '申请WPS激活码', result: 'success' as const },
    { username: 'admin', action: 'view' as const, targetType: 'asset' as const, targetName: null as string | null, detail: '查看资产列表', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'device' as const, targetName: '核心交换机' as string | null, detail: '登记网络设备资产', result: 'success' as const },
    { username: 'zhangsan', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户登录系统', result: 'failure' as const },
    { username: 'admin', action: 'update' as const, targetType: 'asset' as const, targetName: '联想笔记本' as string | null, detail: '更新资产领用信息', result: 'success' as const },
    { username: 'admin', action: 'config' as const, targetType: 'system' as const, targetName: null as string | null, detail: '调整监控采集频率', result: 'success' as const },
    { username: 'lisi', action: 'view' as const, targetType: 'ticket' as const, targetName: null as string | null, detail: '查看工单列表', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'saas' as const, targetName: 'Adobe Creative Cloud' as string | null, detail: '新增SaaS服务', result: 'success' as const },
    { username: 'zhangsan', action: 'update' as const, targetType: 'ticket' as const, targetName: 'TK-2026052' as string | null, detail: '补充工单信息', result: 'success' as const },
    { username: 'admin', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '管理员登录系统', result: 'success' as const },
    { username: 'lisi', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '用户登录系统', result: 'failure' as const },
    { username: 'admin', action: 'export' as const, targetType: 'ticket' as const, targetName: null as string | null, detail: '导出工单统计报表', result: 'success' as const },
    { username: 'admin', action: 'delete' as const, targetType: 'asset' as const, targetName: '报废设备' as string | null, detail: '报废资产删除', result: 'success' as const },
    { username: 'admin', action: 'create' as const, targetType: 'faq' as const, targetName: '如何使用VPN' as string | null, detail: '新增FAQ条目', result: 'success' as const },
    { username: 'zhangsan', action: 'view' as const, targetType: 'document' as const, targetName: 'VPN安装指南' as string | null, detail: '查看帮助文档', result: 'success' as const },
    { username: 'admin', action: 'config' as const, targetType: 'system' as const, targetName: null as string | null, detail: '更新系统安全策略', result: 'success' as const },
    { username: 'admin', action: 'update' as const, targetType: 'monitor' as const, targetName: '数据库服务器' as string | null, detail: '调整监控阈值', result: 'success' as const },
    { username: 'lisi', action: 'export' as const, targetType: 'software' as const, targetName: null as string | null, detail: '导出软件使用统计', result: 'success' as const },
    { username: 'admin', action: 'login' as const, targetType: 'user' as const, targetName: null as string | null, detail: '管理员登录系统', result: 'failure' as const },
  ];
  const ipAddrs = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.5', '10.0.0.12', '172.16.0.50'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Firefox/125.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Safari/17.4',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0.0.0',
  ];
  // 仅在表为空时插入审计日志，避免重复
  const existingAuditCount = db.select().from(schema.auditLogs).all().length;
  let alInserted = 0;
  if (existingAuditCount === 0) {
    for (let i = 0; i < auditTemplates.length; i++) {
      const t = auditTemplates[i];
      const daysAgo = Math.floor(i * 30 / auditTemplates.length); // 时间分散在过去30天
      const createdAt = new Date(now - daysAgo * dayMs + (i % 8) * 3600000).toISOString();
      db.insert(schema.auditLogs).values({
        userId: adminId,
        username: t.username,
        action: t.action,
        targetType: t.targetType,
        targetId: null,
        targetName: t.targetName,
        detail: t.detail,
        ipAddress: ipAddrs[i % ipAddrs.length],
        userAgent: userAgents[i % userAgents.length],
        result: t.result,
        createdAt,
      }).run(); alInserted++;
    }
  }
  console.log(`Skipped/inserted ${alInserted} audit logs (existing: ${existingAuditCount})`);

  // ─── 9. 平台接入 (monitorPlatforms) - 2个 ──────────
  const mpData = [
    { name: '智能桌面运维系统', type: 'api' as const, endpoint: 'http://desktop-ops.internal/api/v1', status: 'active' as const, lastSyncAt: new Date(now - 2 * 3600000).toISOString(), description: '智能桌面运维管理平台，通过API同步设备状态和告警信息' },
    { name: 'OA办公系统', type: 'webhook' as const, endpoint: 'http://oa.internal/webhook/monitor', status: 'testing' as const, lastSyncAt: new Date(now - 24 * 3600000).toISOString(), description: 'OA办公自动化系统，通过Webhook接收监控告警通知' },
  ];
  let mpInserted = 0;
  for (const p of mpData) {
    if (!db.select().from(schema.monitorPlatforms).where(eq(schema.monitorPlatforms.name, p.name)).get()) {
      db.insert(schema.monitorPlatforms).values(p).run(); mpInserted++;
    }
  }
  console.log(`Inserted ${mpInserted} monitor platforms`);
}

seedDemo();
console.log('Demo data seeding complete');
