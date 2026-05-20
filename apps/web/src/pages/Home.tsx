import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Spin } from 'antd';
import { AppstoreOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const { Title, Paragraph } = Typography;

interface StatCard {
  title: string;
  icon: React.ReactNode;
  count: number;
  link: string;
  color: string;
}

export default function Home() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/public/software'),
      api.get('/public/help'),
      api.get('/public/activation-products'),
    ]).then(([sw, help, act]) => {
      const swItems = (sw.data.data as any[]).reduce((sum: number, cat: any) => sum + (cat.items?.length || 0), 0);
      const helpDocs = (help.data.data as any[]).reduce((sum: number, cat: any) => sum + (cat.documents?.length || 0), 0);
      setStats([
        { title: '正版软件', icon: <AppstoreOutlined />, count: swItems, link: '/software', color: '#4da6e8' },
        { title: '帮助文档', icon: <FileTextOutlined />, count: helpDocs, link: '/help', color: '#52c41a' },
        { title: '激活服务', icon: <SafetyCertificateOutlined />, count: act.data.data.length, link: '/activation', color: '#faad14' },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="portal-hero">
        <Title level={1} style={{ color: '#1a3a5c', marginBottom: 8 }}>正版化软件管理平台</Title>
        <Paragraph style={{ fontSize: 16, color: '#4a7a9b' }}>
          提供正版软件下载、使用帮助和一键激活服务
        </Paragraph>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            {stats.map((s) => (
              <Col xs={24} sm={8} key={s.title}>
                <Link to={s.link}>
                  <Card hoverable style={{ textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 40, color: s.color, marginBottom: 12 }}>{s.icon}</div>
                    <Title level={3} style={{ marginBottom: 4 }}>{s.count}</Title>
                    <Paragraph type="secondary">{s.title}</Paragraph>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </>
  );
}
