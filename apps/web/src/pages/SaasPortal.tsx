import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Spin, Table, Tag, Modal, message, Result } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const { Title, Paragraph, Text } = Typography;

interface Service {
  id: number;
  name: string;
  code: string;
  description: string;
  plans: { id: number; name: string; description: string }[];
}

export default function SaasPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [myAccounts, setMyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ accountName: string; password: string } | null>(null);

  useEffect(() => {
    api.get('/public/saas-services').then(r => setServices(r.data.data)).finally(() => setLoading(false));
    if (user) api.get('/me/saas-accounts').then(r => setMyAccounts(r.data.data));
  }, [user]);

  const handleApply = async (serviceId: number, planId?: number) => {
    if (!user) { navigate('/login?redirect=/cloud-services'); return; }
    try {
      const res = await api.post('/me/saas-apply', { serviceId, planId });
      setResult(res.data.data);
      api.get('/me/saas-accounts').then(r => setMyAccounts(r.data.data));
    } catch (err: any) {
      message.error(err.response?.data?.error || '申请失败');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Title level={2} style={{ color: '#1a3a5c', marginBottom: 8 }}>
        <CloudOutlined style={{ marginRight: 8 }} />云服务
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>一站式云账号申请，系统自动开通，即申即用。</Paragraph>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {services.map(s => (
            <Col xs={24} sm={12} key={s.id}>
              <Card title={s.name} hoverable>
                <Paragraph type="secondary">{s.description}</Paragraph>
                {s.plans.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {s.plans.map(p => (
                      <Tag key={p.id} color="blue" style={{ marginBottom: 4 }}>{p.name}</Tag>
                    ))}
                  </div>
                )}
                <Button type="primary" block onClick={() => handleApply(s.id, s.plans[0]?.id)}>申请开通</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {user && myAccounts.length > 0 && (
        <Card title="我的云服务账号" style={{ marginTop: 32 }}>
          <Table dataSource={myAccounts} rowKey="id" pagination={false}
            columns={[
              { title: '服务', dataIndex: 'serviceName' },
              { title: '套餐', dataIndex: 'planName', render: (v: string) => v || '-' },
              { title: '账号', dataIndex: 'accountName' },
              { title: '状态', dataIndex: 'status', render: (v: string) => v === 'active' ? <Tag color="green">活跃</Tag> : <Tag>{v}</Tag> },
              { title: '开通时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
            ]}
          />
        </Card>
      )}

      <Modal open={!!result} onCancel={() => setResult(null)} footer={<Button type="primary" onClick={() => setResult(null)}>我已记录</Button>} centered>
        {result && (
          <Result status="success" title="账号开通成功" subTitle={
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <p><Text strong>账号：</Text><Text code>{result.accountName}</Text></p>
              <p><Text strong>密码：</Text><Text code copyable>{result.password}</Text></p>
              <p><Text type="danger">请妥善保存密码，此窗口关闭后将无法再次查看。</Text></p>
            </div>
          } />
        )}
      </Modal>
    </div>
  );
}
