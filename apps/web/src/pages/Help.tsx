import React, { useEffect, useState } from 'react';
import { Typography, Spin, Empty, Collapse, List } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const { Title } = Typography;

interface HelpDoc {
  id: number;
  title: string;
  sort: number;
}

interface Category {
  id: number;
  name: string;
  documents: HelpDoc[];
}

export default function Help() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/help').then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Title level={2} style={{ color: '#1a3a5c', marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />帮助文档
      </Title>
      <Spin spinning={loading}>
        {categories.length === 0 && !loading && <Empty description="暂无文档" />}
        <Collapse
          defaultActiveKey={categories.map((c) => String(c.id))}
          items={categories.map((cat) => ({
            key: String(cat.id),
            label: <span style={{ fontWeight: 500, fontSize: 16 }}>{cat.name}</span>,
            children: cat.documents.length === 0 ? (
              <Empty description="该分类下暂无文档" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={cat.documents}
                renderItem={(doc) => (
                  <List.Item>
                    <Link to={`/help/${doc.id}`} style={{ color: '#4da6e8' }}>
                      <FileTextOutlined style={{ marginRight: 8 }} />{doc.title}
                    </Link>
                  </List.Item>
                )}
              />
            ),
          }))}
        />
      </Spin>
    </div>
  );
}
