using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace ActivationClientDemo;

public sealed partial class MainWindow : Window
{
    private bool _isLoggedIn;

    public MainWindow()
    {
        InitializeComponent();
        AppWindow.Title = "KMS 激活演示客户端";
        if (AppWindow.Presenter is OverlappedPresenter p)
        {
            p.IsResizable = true;
            p.IsMaximizable = true;
        }
        AppWindow.Resize(new Windows.Graphics.SizeInt32(520, 720));
    }

    private void LoginButton_Click(object sender, RoutedEventArgs e)
    {
        var user = UserNameBox.Text?.Trim() ?? string.Empty;
        var pwd = PasswordBox.Password ?? string.Empty;

        // 演示：仅检查非空，不连接任何服务器
        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pwd))
        {
            StatusText.Text = "请输入用户名和密码（演示：任意非空即可）。";
            return;
        }

        _isLoggedIn = true;
        ActivateWindowsButton.IsEnabled = true;
        ActivateOfficeButton.IsEnabled = true;
        LoginButton.IsEnabled = false;
        UserNameBox.IsEnabled = false;
        PasswordBox.IsEnabled = false;
        LoginHint.Text = "已登录（演示）。可进行 KMS 激活演示。";
        StatusText.Text = $"欢迎，{user}。请点击上方按钮模拟激活。";
    }

    private async void ActivateWindowsButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        await ShowDemoSuccessAsync(
            "Windows 激活（演示）",
            "模拟 KMS 客户端已成功向本机请求 Windows 批量许可激活。\n\n（演示程序：未执行真实 slmgr /ato，未修改系统激活状态。）");
    }

    private async void ActivateOfficeButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        await ShowDemoSuccessAsync(
            "Microsoft Office 激活（演示）",
            "模拟 KMS 客户端已成功向本机请求 Microsoft Office 批量许可激活。\n\n（演示程序：未调用 ospp.vbs 或联网验证。）");
    }

    private async System.Threading.Tasks.Task ShowDemoSuccessAsync(string title, string message)
    {
        var dlg = new ContentDialog
        {
            Title = title,
            Content = new TextBlock { Text = message, TextWrapping = TextWrapping.Wrap, MaxWidth = 360 },
            CloseButtonText = "确定",
            XamlRoot = XamlRoot,
            DefaultButton = ContentDialogButton.Close,
        };
        await dlg.ShowAsync();
        StatusText.Text = $"[{System.DateTime.Now:HH:mm:ss}] {title} — 演示反馈：成功。";
    }
}
