import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const { Title } = Typography;

export default function MyCodes() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/my-codes');
      return;
    }
    if (user) {
      api.get('/me/activation-codes').then((res) => setData(res.data.data)).finally(() => setLoading(false));
    }
  }, [user, authLoading, navigate]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16, padding: 0 }}>
        返回首页
      </Button>
      <Title level={3} style={{ color: '#1a3a5c', marginBottom: 24 }}>我的激活码</Title>
      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={data}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '产品', dataIndex: 'productName', key: 'productName' },
              { title: '激活码', dataIndex: 'code6', key: 'code6', render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 4 }}>{v}</span> },
              { title: '领取时间', dataIndex: 'grantedAt', key: 'grantedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
            ]}
          />
        </Spin>
      </Card>
    </div>
  );
}
