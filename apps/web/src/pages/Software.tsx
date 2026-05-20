import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Button, Spin, Empty, Collapse } from 'antd';
import { DownloadOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '../lib/api';

const { Title, Paragraph } = Typography;

interface SoftwareItem {
  id: number;
  title: string;
  description: string;
  version: string;
  fileId: number | null;
  sort: number;
}

interface Category {
  id: number;
  name: string;
  items: SoftwareItem[];
}

export default function Software() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/software').then((res) => {
      setCategories(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Title level={2} style={{ color: '#1a3a5c', marginBottom: 24 }}>
        <AppstoreOutlined style={{ marginRight: 8 }} />软件下载
      </Title>
      <Spin spinning={loading}>
        {categories.length === 0 && !loading && <Empty description="暂无软件" />}
        <Collapse
          defaultActiveKey={categories.map((c) => String(c.id))}
          items={categories.map((cat) => ({
            key: String(cat.id),
            label: <span style={{ fontWeight: 500, fontSize: 16 }}>{cat.name}</span>,
            children: cat.items.length === 0 ? (
              <Empty description="该分类下暂无软件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="card-grid" style={{ padding: 0 }}>
                {cat.items.map((item) => (
                  <Card key={item.id} size="small" hoverable>
                    <Title level={5} style={{ marginBottom: 4 }}>{item.title}</Title>
                    {item.version && <Tag color="blue">v{item.version}</Tag>}
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginTop: 8, marginBottom: 12 }}>
                      {item.description || '暂无描述'}
                    </Paragraph>
                    {item.fileId && (
                      <Button type="primary" icon={<DownloadOutlined />} href={`/api/public/download/${item.fileId}`} block>
                        下载
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            ),
          }))}
        />
      </Spin>
    </div>
  );
}
