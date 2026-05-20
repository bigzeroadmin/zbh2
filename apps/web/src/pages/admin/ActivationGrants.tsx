import React, { useEffect, useState } from 'react';
import { Table, Card, Typography } from 'antd';
import api from '../../lib/api';

export default function ActivationGrants() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activation-grants').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>激活码发放记录</Typography.Title>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '用户', dataIndex: 'username' },
          { title: '产品', dataIndex: 'productName' },
          { title: '激活码', dataIndex: 'code6', render: (v: string) => <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{v}</span> },
          { title: '发放时间', dataIndex: 'grantedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
        ]}
      />
    </Card>
  );
}
