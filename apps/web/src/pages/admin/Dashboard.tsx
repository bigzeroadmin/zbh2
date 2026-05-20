import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { AppstoreOutlined, FileTextOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState({ software: 0, docs: 0, codes: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/admin/software-items'),
      api.get('/admin/help-documents'),
      api.get('/admin/activation-codes?pageSize=1'),
      api.get('/admin/users'),
    ]).then(([sw, docs, codes, users]) => {
      setStats({
        software: sw.data.data.length,
        docs: docs.data.data.length,
        codes: codes.data.data.total || 0,
        users: users.data.data.length,
      });
    });
  }, []);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>管理概览</Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="软件数" value={stats.software} prefix={<AppstoreOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="文档数" value={stats.docs} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="激活码总量" value={stats.codes} prefix={<KeyOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="用户数" value={stats.users} prefix={<UserOutlined />} /></Card>
        </Col>
      </Row>
    </div>
  );
}
