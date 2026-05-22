# KMS 激活演示客户端（WinUI 3）

面向 **Windows 10 / 11** 的演示程序：模拟「先登录 → 再 KMS 激活」流程。**不进行真实服务器校验**，**不调用 slmgr / ospp**，仅界面反馈「激活成功」。

## 环境要求

- Windows 10 1809+ 或 Windows 11（x64）
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- 建议安装 [Visual Studio 2022](https://visualstudio.microsoft.com/) 并勾选「**使用 C++ 的桌面开发**」与「**.NET 桌面开发**」（用于 Windows App SDK 本机工具链）

> 必须在 **Windows** 上编译；macOS / Linux 无法构建 WinUI 3。  
> 工程已固定 **x64 / win-x64**（与 `WindowsAppSDKSelfContained` 自包含模式兼容，避免 AnyCPU 还原失败）。

## 编译调试

```powershell
cd tools\ActivationClientWinUI3
dotnet restore
dotnet build -c Debug
dotnet run -c Debug
```

## 发布（自包含目录，可再打成 zip）

```powershell
cd tools\ActivationClientWinUI3
dotnet publish -c Release -r win-x64 --self-contained true
```

输出目录：`bin\Release\net8.0-windows10.0.22621.0\win-x64\publish\`（内含 `ActivationClientDemo.exe` 及依赖 DLL，可直接复制或压缩分发）。

> .NET 8 使用可移植 RID（`win-x64`），勿使用已废弃的 `win10-x64`。参见 [NETSDK1083](https://learn.microsoft.com/dotnet/core/tools/sdk-errors/netsdk1083)。

## 演示逻辑

| 步骤 | 行为 |
|------|------|
| 登录 | 用户名、密码均**非空**即视为登录成功，**不联网** |
| 激活 Windows / Office | 弹出对话框提示「模拟 KMS 激活成功」，**不修改系统或 Office 激活状态** |

## 与 Web 平台的关系

本目录为**独立**演示客户端，可与正版化平台中的「激活客户端下载链接」对接；当前版本不读取平台下发的激活码，仅作 UI/流程演示。
