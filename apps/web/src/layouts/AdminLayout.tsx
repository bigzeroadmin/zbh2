import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  UserOutlined,
  HomeOutlined,
  FolderOutlined,
  MessageOutlined,
  DatabaseOutlined,
  CloudOutlined,
  BarChartOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAuth } from '../lib/auth';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin', label: <Link to="/admin">概览</Link>, icon: <HomeOutlined /> },
  {
    key: 'software',
    label: '软件管理',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/admin/software-categories', label: <Link to="/admin/software-categories">软件分类</Link> },
      { key: '/admin/software-items', label: <Link to="/admin/software-items">软件列表</Link> },
    ],
  },
  {
    key: 'help',
    label: '文档管理',
    icon: <FileTextOutlined />,
    children: [
      { key: '/admin/help-categories', label: <Link to="/admin/help-categories">文档分类</Link> },
      { key: '/admin/help-documents', label: <Link to="/admin/help-documents">文档列表</Link> },
    ],
  },
  {
    key: 'activation',
    label: '激活管理',
    icon: <SafetyCertificateOutlined />,
    children: [
      { key: '/admin/activation-products', label: <Link to="/admin/activation-products">激活产品</Link> },
      { key: '/admin/activation-codes', label: <Link to="/admin/activation-codes">激活码管理</Link>, icon: <KeyOutlined /> },
      { key: '/admin/activation-grants', label: <Link to="/admin/activation-grants">发放记录</Link>, icon: <FolderOutlined /> },
    ],
  },
  {
    key: 'asset',
    label: '数字资产',
    icon: <DatabaseOutlined />,
    children: [
      { key: '/admin/asset-categories', label: <Link to="/admin/asset-categories">资产分类</Link> },
      { key: '/admin/assets', label: <Link to="/admin/assets">资产管理</Link> },
    ],
  },
  { key: '/admin/saas', label: <Link to="/admin/saas">云服务管理</Link>, icon: <CloudOutlined /> },
  { key: '/admin/tickets', label: <Link to="/admin/tickets">工单管理</Link>, icon: <MessageOutlined /> },
  { key: '/admin/faq', label: <Link to="/admin/faq">AI知识库</Link>, icon: <RobotOutlined /> },
  { key: '/admin/reports', label: <Link to="/admin/reports">资产报表</Link>, icon: <BarChartOutlined /> },
  { key: '/admin/users', label: <Link to="/admin/users">用户管理</Link>, icon: <UserOutlined /> },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #e8f0f8' }}>
        <div style={{ padding: '16px 20px', fontWeight: 600, fontSize: 16, color: '#1a3a5c', borderBottom: '1px solid #e8f0f8' }}>
          管理后台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['software', 'help', 'activation', 'asset']}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8f0f8' }}>
          <span style={{ color: '#4a7a9b' }}>欢迎，{user.username}</span>
          <Link to="/" style={{ color: '#4da6e8' }}>返回门户</Link>
        </Header>
        <Content style={{ padding: 24, background: '#f0f7ff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
