import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Card, Typography, Space, Popconfirm } from 'antd';
import { PlusOutlined, KeyOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const statusColors: Record<string, string> = { active: 'green', disabled: 'red', pending: 'orange', expired: 'default' };

export default function SaasManage() {
  const [services, setServices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [svcModal, setSvcModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [planModal, setPlanModal] = useState<{ open: boolean; serviceId?: number; record?: any }>({ open: false });
  const [acctModal, setAcctModal] = useState(false);
  const [svcForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const [acctForm] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/saas-services'),
      api.get('/admin/saas-accounts'),
      api.get('/admin/users'),
    ]).then(([s, a, u]) => {
      setServices(s.data.data);
      setAccounts(a.data.data);
      setUsers(u.data.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSaveSvc = async () => {
    const values = await svcForm.validateFields();
    if (svcModal.record) await api.put(`/admin/saas-services/${svcModal.record.id}`, values);
    else await api.post('/admin/saas-services', values);
    message.success('保存成功');
    setSvcModal({ open: false });
    load();
  };

  const onSavePlan = async () => {
    const values = await planForm.validateFields();
    values.serviceId = planModal.serviceId;
    if (planModal.record) await api.put(`/admin/saas-plans/${planModal.record.id}`, values);
    else await api.post('/admin/saas-plans', values);
    message.success('保存成功');
    setPlanModal({ open: false });
    load();
  };

  const onProvision = async () => {
    const values = await acctForm.validateFields();
    const res = await api.post('/admin/saas-accounts', values);
    message.success(`账号已开通，密码：${res.data.data.generatedPassword}`);
    setAcctModal(false);
    load();
  };

  const resetPassword = async (id: number) => {
    const res = await api.post(`/admin/saas-accounts/${id}/reset-password`);
    message.success(`新密码：${res.data.data.newPassword}`);
  };

  const toggleAccount = async (id: number, status: string) => {
    await api.put(`/admin/saas-accounts/${id}`, { status });
    message.success('状态已更新');
    load();
  };

  return (
    <div>
      <Card title={<Typography.Title level={5} style={{ margin: 0 }}>云服务管理</Typography.Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { svcForm.resetFields(); setSvcModal({ open: true }); }}>新增服务</Button>}
        style={{ marginBottom: 24 }}>
        <Table dataSource={services} rowKey="id" loading={loading} pagination={false}
          expandable={{
            expandedRowRender: (svc: any) => (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Button size="small" type="dashed" onClick={() => { planForm.resetFields(); setPlanModal({ open: true, serviceId: svc.id }); }}>添加套餐</Button>
                </div>
                {svc.plans?.map((p: any) => (
                  <Tag key={p.id} style={{ marginBottom: 4 }}>
                    {p.name} (最大用户: {p.maxUsers})
                    <Button type="link" size="small" onClick={() => { planForm.setFieldsValue(p); setPlanModal({ open: true, serviceId: svc.id, record: p }); }}>编辑</Button>
                  </Tag>
                ))}
              </div>
            ),
          }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: '名称', dataIndex: 'name' },
            { title: '编码', dataIndex: 'code', width: 100 },
            { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '启用' : '禁用'}</Tag> },
            {
              title: '操作', width: 80, render: (_: any, r: any) => (
                <Button type="link" size="small" onClick={() => { svcForm.setFieldsValue(r); setSvcModal({ open: true, record: r }); }}>编辑</Button>
              ),
            },
          ]}
        />
      </Card>

      <Card title={<Typography.Title level={5} style={{ margin: 0 }}>云服务账号</Typography.Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { acctForm.resetFields(); setAcctModal(true); }}>手动开通</Button>}>
        <Table dataSource={accounts} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: '服务', dataIndex: 'serviceName' },
            { title: '用户', dataIndex: 'username' },
            { title: '账号名', dataIndex: 'accountName' },
            { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag> },
            { title: '开通时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
            {
              title: '操作', width: 220, render: (_: any, r: any) => (
                <Space size="small">
                  <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => resetPassword(r.id)}>重置密码</Button>
                  {r.status === 'active' ? (
                    <Button type="link" size="small" danger onClick={() => toggleAccount(r.id, 'disabled')}>禁用</Button>
                  ) : (
                    <Button type="link" size="small" onClick={() => toggleAccount(r.id, 'active')}>启用</Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal title="新增/编辑服务" open={svcModal.open} onCancel={() => setSvcModal({ open: false })} onOk={onSaveSvc}>
        <Form form={svcForm} layout="vertical">
          <Form.Item name="name" label="服务名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label="服务编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          {svcModal.record && (
            <Form.Item name="status" label="状态">
              <Select options={[{ value: 'active', label: '启用' }, { value: 'disabled', label: '禁用' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal title="添加/编辑套餐" open={planModal.open} onCancel={() => setPlanModal({ open: false })} onOk={onSavePlan}>
        <Form form={planForm} layout="vertical">
          <Form.Item name="name" label="套餐名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input /></Form.Item>
          <Form.Item name="maxUsers" label="最大用户数" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="price" label="价格（分）" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="手动开通账号" open={acctModal} onCancel={() => setAcctModal(false)} onOk={onProvision}>
        <Form form={acctForm} layout="vertical">
          <Form.Item name="serviceId" label="选择服务" rules={[{ required: true }]}>
            <Select options={services.map((s: any) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="userId" label="选择用户" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={users.map((u: any) => ({ value: u.id, label: u.username }))} />
          </Form.Item>
          <Form.Item name="accountName" label="账号名（留空使用用户名）"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
