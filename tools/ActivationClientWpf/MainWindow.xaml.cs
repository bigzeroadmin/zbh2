using System.Windows;

namespace ActivationClientDemo;

public partial class MainWindow : Window
{
    private bool _isLoggedIn;

    public MainWindow()
    {
        InitializeComponent();
    }

    private void LoginButton_Click(object sender, RoutedEventArgs e)
    {
        var user = UserNameBox.Text?.Trim() ?? string.Empty;
        var pwd = PasswordBox.Password ?? string.Empty;

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

    private void ActivateWindowsButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        ShowDemoSuccess(
            "Windows 激活（演示）",
            "模拟 KMS 客户端已成功向本机请求 Windows 批量许可激活。\n\n（演示程序：未执行真实 slmgr /ato，未修改系统激活状态。）");
    }

    private void ActivateOfficeButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        ShowDemoSuccess(
            "Microsoft Office 激活（演示）",
            "模拟 KMS 客户端已成功向本机请求 Microsoft Office 批量许可激活。\n\n（演示程序：未调用 ospp.vbs 或联网验证。）");
    }

    private void ShowDemoSuccess(string title, string message)
    {
        MessageBox.Show(this, message, title, MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = $"[{DateTime.Now:HH:mm:ss}] {title} — 演示反馈：成功。";
    }
}
