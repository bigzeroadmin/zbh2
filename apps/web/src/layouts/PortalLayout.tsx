import React from 'react';
import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  MessageOutlined,
  CloudOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAuth } from '../lib/auth';

const { Header, Content, Footer } = Layout;

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { key: '/', label: <Link to="/">首页</Link>, icon: <AppstoreOutlined /> },
    { key: '/software', label: <Link to="/software">软件下载</Link>, icon: <AppstoreOutlined /> },
    { key: '/help', label: <Link to="/help">帮助文档</Link>, icon: <FileTextOutlined /> },
    { key: '/activation', label: <Link to="/activation">软件激活</Link>, icon: <SafetyCertificateOutlined /> },
    { key: '/cloud-services', label: <Link to="/cloud-services">云服务</Link>, icon: <CloudOutlined /> },
    { key: '/ai-chat', label: <Link to="/ai-chat">智能客服</Link>, icon: <RobotOutlined /> },
  ];

  const selectedKey = '/' + (location.pathname.split('/')[1] || '');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: '#e8f4fd', borderBottom: '1px solid #d0e8f7' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <SafetyCertificateOutlined style={{ fontSize: 24, color: '#2b7bbf', marginRight: 8 }} />
          <span style={{ fontSize: 18, fontWeight: 600, color: '#1a3a5c' }}>正版化软件管理平台</span>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ flex: 1, background: 'transparent', borderBottom: 'none' }}
        />
        <Space>
          {user ? (
            <Dropdown menu={{
              items: [
                ...(user.role === 'admin' ? [{ key: 'admin', label: '管理后台', icon: <SettingOutlined />, onClick: () => navigate('/admin') }] : []),
                { key: 'codes', label: '我的激活码', icon: <SafetyCertificateOutlined />, onClick: () => navigate('/my-codes') },
                { key: 'tickets', label: '我的工单', icon: <MessageOutlined />, onClick: () => navigate('/tickets') },
                { type: 'divider' as const },
                { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: () => logout().then(() => navigate('/')) },
              ],
            }}>
              <Button type="text" icon={<UserOutlined />}>{user.username}</Button>
            </Dropdown>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>登录</Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: 0 }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', color: '#8aa8c4', background: '#e8f4fd' }}>
        正版化软件管理平台 &copy; {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
