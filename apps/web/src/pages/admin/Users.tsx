import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Card, Typography, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

export default function Users() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      const payload: Record<string, unknown> = {};
      if (values.role) payload.role = values.role;
      if (values.status) payload.status = values.status;
      if (values.password) payload.password = values.password;
      await api.put(`/admin/users/${modal.record.id}`, payload);
    } else {
      await api.post('/admin/users', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success('已删除');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>用户管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增用户</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '用户名', dataIndex: 'username' },
          { title: '角色', dataIndex: 'role', width: 100, render: (v: string) => v === 'admin' ? <Tag color="blue">管理员</Tag> : <Tag>普通用户</Tag> },
          { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => v === 'active' ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag> },
          { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
          {
            title: '操作', width: 160, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" onClick={() => { form.setFieldsValue({ ...r, password: '' }); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑用户' : '新增用户'} open={modal.open}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          {!modal.record && (
            <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="password" label={modal.record ? '新密码（留空不修改）' : '密码'} rules={modal.record ? [] : [{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="user">
            <Select options={[{ value: 'user', label: '普通用户' }, { value: 'admin', label: '管理员' }]} />
          </Form.Item>
          {modal.record && (
            <Form.Item name="status" label="状态">
              <Select options={[{ value: 'active', label: '启用' }, { value: 'disabled', label: '禁用' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}
