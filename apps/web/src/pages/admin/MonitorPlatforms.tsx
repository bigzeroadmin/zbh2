import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Card, Typography, Space } from 'antd';
import { PlusOutlined, ApiOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;
const { TextArea } = Input;

const platformTypeOptions = [
  { value: 'webhook', label: 'Webhook' },
  { value: 'api', label: 'API' },
  { value: 'agent', label: 'Agent' },
];

const statusColor: Record<string, string> = { active: 'green', disabled: 'default', testing: 'processing' };
const statusLabel: Record<string, string> = { active: '已激活', disabled: '已禁用', testing: '测试中' };

export default function MonitorPlatforms() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();
  const [testing, setTesting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/monitor/platforms', { params: { page, pageSize } }).then(res => {
      const d = res.data.data;
      setData(d.items || d);
      setTotal(d.total || d.length || 0);
    }).catch(() => { setData([]); setTotal(0); }).finally(() => setLoading(false));
  };
  useEffect(load, [page, pageSize]);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/monitor/platforms/${modal.record.id}`, values);
    } else {
      await api.post('/admin/monitor/platforms', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/monitor/platforms/${id}`);
    message.success('已删除');
    load();
  };

  const onTest = async (id: number) => {
    setTesting(id);
    try {
      await api.post(`/admin/monitor/platforms/${id}/test`);
      message.success('连接测试成功');
    } catch {
      message.error('连接测试失败');
    } finally {
      setTesting(null);
    }
  };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>平台接入配置</Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增平台</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 1000 }}
        columns={[
          { title: '名称', dataIndex: 'name', width: 160 },
          {
            title: '类型', dataIndex: 'type', width: 100,
            render: (v: string) => platformTypeOptions.find(o => o.value === v)?.label || v,
          },
          { title: '接入地址', dataIndex: 'endpoint', width: 250, ellipsis: true },
          {
            title: '状态', dataIndex: 'status', width: 90,
            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
          },
          { title: '最后同步', dataIndex: 'lastSyncAt', width: 180 },
          {
            title: '操作', width: 220, fixed: 'right' as const, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" icon={<ApiOutlined />}
                  loading={testing === r.id} onClick={() => onTest(r.id)}>测试连接</Button>
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title={modal.record ? '编辑平台' : '新增平台'} open={modal.open} width={600}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select options={platformTypeOptions} placeholder="请选择类型" />
          </Form.Item>
          <Form.Item name="endpoint" label="接入地址" rules={[{ required: true, message: '请输入接入地址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="apiKey" label="API密钥"><Input.Password placeholder="可选" /></Form.Item>
          <Form.Item name="secret" label="密钥"><Input.Password placeholder="可选" /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
