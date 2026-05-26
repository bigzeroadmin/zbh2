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
            StatusText.Text = "请输入用户名和密码。";
            return;
        }

        _isLoggedIn = true;
        ActivateWindowsButton.IsEnabled = true;
        ActivateOfficeButton.IsEnabled = true;
        ActivateWpsButton.IsEnabled = true;
        LoginButton.IsEnabled = false;
        UserNameBox.IsEnabled = false;
        PasswordBox.IsEnabled = false;
        LoginHint.Text = "已登录。可进行产品激活。";
        StatusText.Text = $"欢迎，{user}。请点击上方按钮模拟激活。";
    }

    private void ActivateWindowsButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        ShowActivationSuccess(
            "Windows 激活",
            "已成功请求 Windows 批量许可激活。\n\n（未执行真实 slmgr /ato，未修改系统激活状态。）");
    }

    private void ActivateOfficeButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        ShowActivationSuccess(
            "Microsoft Office 激活",
            "已成功请求 Microsoft Office 批量许可激活。\n\n（未调用 ospp.vbs 或联网验证。）");
    }

    private void ActivateWpsButton_Click(object sender, RoutedEventArgs e)
    {
        if (!_isLoggedIn) return;
        ShowActivationSuccess(
            "WPS 激活",
            "已成功请求 WPS 批量许可激活。\n\n（未执行真实激活操作，未修改系统激活状态。）");
    }

    private void ShowActivationSuccess(string title, string message)
    {
        MessageBox.Show(this, message, title, MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = $"[{DateTime.Now:HH:mm:ss}] {title} — 激活反馈：成功。";
    }
}
