import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Input, message, Card, Typography, Tag, Space } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const statusColors: Record<string, string> = { available: 'green', granted: 'blue', revoked: 'red' };
const statusLabels: Record<string, string> = { available: '可用', granted: '已发放', revoked: '已作废' };

export default function ActivationCodes() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importModal, setImportModal] = useState(false);
  const [form] = Form.useForm();

  const load = (p = page) => {
    setLoading(true);
    api.get('/admin/activation-codes', { params: { page: p, pageSize: 20 } }).then((r) => {
      setData(r.data.data.items);
      setTotal(r.data.data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/admin/activation-products').then((r) => setProducts(r.data.data));
    load();
  }, []);

  const onImport = async () => {
    const values = await form.validateFields();
    const codes = (values.codesText as string).split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean);
    if (codes.length === 0) {
      message.error('请输入至少一个激活码');
      return;
    }
    const res = await api.post('/admin/activation-codes/import', { productId: values.productId, codes });
    message.success(`导入成功，共 ${res.data.data.imported} 条`);
    setImportModal(false);
    form.resetFields();
    load();
  };

  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p.name]));

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>激活码管理</Typography.Title>}
      extra={<Button type="primary" icon={<ImportOutlined />} onClick={() => { form.resetFields(); setImportModal(true); }}>批量导入</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: (p) => { setPage(p); load(p); } }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '产品', dataIndex: 'productId', render: (v: number) => productMap[v] || v },
          { title: '激活码', dataIndex: 'code6', render: (v: string) => <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{v}</span> },
          { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={statusColors[v]}>{statusLabels[v] || v}</Tag> },
          { title: '批次', dataIndex: 'batchId' },
          { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
        ]}
      />
      <Modal title="批量导入激活码" open={importModal} onCancel={() => setImportModal(false)} onOk={onImport}>
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="选择产品" rules={[{ required: true }]}>
            <Select options={products.map((p: any) => ({ value: p.id, label: p.name }))} />
          </Form.Item>
          <Form.Item name="codesText" label="激活码（每行一个，6位）" rules={[{ required: true }]}>
            <Input.TextArea rows={8} placeholder={"ABC123\nDEF456\nGHI789"} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
