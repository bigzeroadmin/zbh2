# KMS 激活演示客户端（WinUI 3）

面向 **Windows 10 / 11** 的演示程序：模拟「先登录 → 再 KMS 激活」流程。**不进行真实服务器校验**，**不调用 slmgr / ospp**，仅界面反馈「激活成功」。

## 环境要求

- Windows 10 1809+ 或 Windows 11（x64）
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- 建议安装 [Visual Studio 2022](https://visualstudio.microsoft.com/) 并勾选「**使用 C++ 的桌面开发**」与「**.NET 桌面开发**」（用于 Windows App SDK 本机工具链）

> 必须在 **Windows** 上编译；macOS / Linux 无法构建 WinUI 3。

## 编译调试

```powershell
cd tools\ActivationClientWinUI3
dotnet restore
dotnet build -c Debug
dotnet run -c Debug
```

## 发布为单个 exe（自包含）

```powershell
cd tools\ActivationClientWinUI3
dotnet publish -c Release -r win-x64 --self-contained true `
  /p:PublishSingleFile=true `
  /p:IncludeNativeLibrariesForSelfExtract=true `
  /p:EnableCompressionInSingleFile=true
```

输出目录：`bin\Release\net8.0-windows10.0.19041.0\win-x64\publish\ActivationClientDemo.exe`

说明：WinUI 3 单文件发布时，运行期可能将部分本机库解压到临时目录，属 .NET 单文件行为，仍为一个主 `exe` 入口。

## 演示逻辑

| 步骤 | 行为 |
|------|------|
| 登录 | 用户名、密码均**非空**即视为登录成功，**不联网** |
| 激活 Windows / Office | 弹出对话框提示「模拟 KMS 激活成功」，**不修改系统或 Office 激活状态** |

## 与 Web 平台的关系

本目录为**独立**演示客户端，可与正版化平台中的「激活客户端下载链接」对接；当前版本不读取平台下发的激活码，仅作 UI/流程演示。
