import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Button, Modal, Form, Select, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

interface Product {
  id: number;
  code: string;
  name: string;
  availableCount: number;
  grantedCount: number;
}

export default function ActivationGrants() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/activation-grants').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  };

  const loadRefs = () => {
    api.get('/admin/activation-products').then((r) => setProducts(r.data.data));
    api.get('/admin/users').then((r) => setUsers(r.data.data));
  };

  useEffect(() => {
    load();
    loadRefs();
  }, []);

  const openModal = () => {
    form.resetFields();
    loadRefs();
    setModalOpen(true);
  };

  const onGrant = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/activation-grants', values);
      message.success(`已为 ${res.data.data.username} 发放「${res.data.data.productName}」激活码：${res.data.data.code6}`);
      setModalOpen(false);
      load();
      loadRefs();
    } catch (err: any) {
      message.error(err.response?.data?.error || '发放失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onRevoke = async (id: number) => {
    try {
      await api.delete(`/admin/activation-grants/${id}`);
      message.success('已撤销发放，激活码已回收');
      load();
      loadRefs();
    } catch (err: any) {
      message.error(err.response?.data?.error || '撤销失败');
    }
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>激活码发放记录</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openModal}>发放激活码</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '用户', dataIndex: 'username' },
          { title: '产品', dataIndex: 'productName' },
          { title: '激活码', dataIndex: 'code6', render: (v: string) => <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{v}</span> },
          { title: '发放时间', dataIndex: 'grantedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
          {
            title: '操作', width: 90, render: (_: any, r: any) => (
              <Popconfirm title="确认撤销发放？" description="激活码将被回收并重新置为可用" onConfirm={() => onRevoke(r.id)}>
                <Button type="link" size="small" danger>撤销</Button>
              </Popconfirm>
            ),
          },
        ]}
      />
      <Modal title="发放激活码" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={onGrant} confirmLoading={submitting} okText="发放">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="userId" label="指定用户" rules={[{ required: true, message: '请选择用户' }]}>
            <Select
              showSearch
              placeholder="选择要发放给的用户"
              optionFilterProp="label"
              options={users.map((u) => ({ value: u.id, label: `${u.username}${u.role === 'admin' ? '（管理员）' : ''}`, disabled: u.status !== 'active' }))}
            />
          </Form.Item>
          <Form.Item name="productId" label="指定产品" rules={[{ required: true, message: '请选择产品' }]}>
            <Select
              placeholder="选择要发放的产品（Windows / Office 等）"
              options={products.map((p) => ({
                value: p.id,
                label: (
                  <Space>
                    <span>{p.name}</span>
                    <Tag color={p.availableCount > 0 ? 'green' : 'red'}>可用 {p.availableCount}</Tag>
                  </Space>
                ),
                disabled: p.availableCount === 0,
              }))}
            />
          </Form.Item>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            系统将自动从该产品的可用激活码中分配一个给指定用户，用户即可在「我的激活码」中查看并激活该产品。每位用户每个产品仅可发放一次。
          </Typography.Paragraph>
        </Form>
      </Modal>
    </Card>
  );
}
