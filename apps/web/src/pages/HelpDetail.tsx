import React, { useEffect, useState } from 'react';
import { Typography, Spin, Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';

const { Title } = Typography;

export default function HelpDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/help/${id}`).then((res) => setDoc(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/help')} style={{ marginBottom: 16, padding: 0 }}>
        返回文档列表
      </Button>
      <Spin spinning={loading}>
        {doc && (
          <Card>
            <Title level={3} style={{ color: '#1a3a5c' }}>{doc.title}</Title>
            <div style={{ marginTop: 16, lineHeight: 1.8 }}>
              <ReactMarkdown>{doc.body}</ReactMarkdown>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
}
