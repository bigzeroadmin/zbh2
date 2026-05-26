# 激活客户端（WPF）

面向 **Windows 10 / 11** 的 WPF 程序：模拟「先登录 → 再激活」流程。**不进行真实服务器校验**，**不调用 slmgr / ospp**，仅界面反馈「激活成功」。

## 环境要求

- Windows 10 / 11（x64）
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

> 必须在 **Windows** 上编译运行；macOS / Linux 无法构建 WPF。

## 本地调试

```powershell
cd tools\ActivationClientWpf
dotnet restore
dotnet build -c Debug
dotnet run -c Debug
```

## 发布（自包含，可打 zip）

```powershell
cd tools\ActivationClientWpf
dotnet publish -c Release -r win-x64 --self-contained true
```

输出：`bin\Release\net8.0-windows\win-x64\publish\`（运行 `ActivationClientDemo.exe`）。

CI 会自动将 `publish` 目录打包为 `ActivationClientDemo-win-x64.zip`。

## 与 Web 平台

可与正版化平台「激活客户端下载链接」对接；当前版本不读取平台激活码，仅作 UI/流程模拟。
