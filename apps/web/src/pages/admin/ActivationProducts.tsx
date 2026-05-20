import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, Typography } from 'antd';
import api from '../../lib/api';

export default function ActivationProducts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/activation-products').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/activation-products/${modal.record.id}`, values);
    } else {
      await api.post('/admin/activation-products', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>激活产品管理</Typography.Title>}
      extra={<Button type="primary" onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增产品</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '编码', dataIndex: 'code', width: 100 },
          { title: '名称', dataIndex: 'name' },
          { title: '描述', dataIndex: 'description' },
          { title: '客户端下载链接', dataIndex: 'clientDownloadUrl', ellipsis: true },
          {
            title: '操作', width: 80, render: (_: any, r: any) => (
              <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑产品' : '新增产品'} open={modal.open}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="产品编码" rules={[{ required: true }]}>
            <Input placeholder="如 WIN, OFFICE, WPS" />
          </Form.Item>
          <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="clientDownloadUrl" label="激活客户端下载链接">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
