import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Spin, Modal, message, Result } from 'antd';
import { SafetyCertificateOutlined, WindowsOutlined, FileWordOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const { Title, Paragraph } = Typography;

const productIcons: Record<string, React.ReactNode> = {
  WIN: <WindowsOutlined style={{ fontSize: 48 }} />,
  OFFICE: <FileWordOutlined style={{ fontSize: 48 }} />,
  WPS: <FileOutlined style={{ fontSize: 48 }} />,
};

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  clientDownloadUrl: string;
}

export default function Activation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimResult, setClaimResult] = useState<{ code6: string; already: boolean } | null>(null);

  useEffect(() => {
    api.get('/public/activation-products').then((res) => setProducts(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleClaim = async (productId: number) => {
    if (!user) {
      navigate('/login?redirect=/activation');
      return;
    }
    try {
      const res = await api.post('/me/activation-codes/claim', { productId });
      setClaimResult({ code6: res.data.data.code6, already: res.data.data.alreadyClaimed });
    } catch (err: any) {
      message.error(err.response?.data?.error || '领取失败');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Title level={2} style={{ color: '#1a3a5c', marginBottom: 8 }}>
        <SafetyCertificateOutlined style={{ marginRight: 8 }} />软件激活
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        选择需要激活的产品，登录后即可获取 6 位激活码。下载对应激活客户端完成激活。
      </Paragraph>
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {products.map((p) => (
            <Col xs={24} sm={8} key={p.id}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <div style={{ color: '#4da6e8', marginBottom: 16 }}>
                  {productIcons[p.code] || <SafetyCertificateOutlined style={{ fontSize: 48 }} />}
                </div>
                <Title level={4}>{p.name}</Title>
                <Paragraph type="secondary">{p.description}</Paragraph>
                <Button type="primary" block onClick={() => handleClaim(p.id)} style={{ marginBottom: 8 }}>
                  获取激活码
                </Button>
                {p.clientDownloadUrl && (
                  <Button block href={p.clientDownloadUrl} target="_blank">下载激活客户端</Button>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
      <Modal
        open={!!claimResult}
        onCancel={() => setClaimResult(null)}
        footer={<Button type="primary" onClick={() => setClaimResult(null)}>确定</Button>}
        centered
      >
        {claimResult && (
          <Result
            status="success"
            title={claimResult.already ? '您已领取过激活码' : '激活码领取成功'}
            subTitle={
              <div style={{ fontSize: 32, fontFamily: 'monospace', letterSpacing: 8, color: '#1a3a5c', marginTop: 8 }}>
                {claimResult.code6}
              </div>
            }
          />
        )}
      </Modal>
    </div>
  );
}
