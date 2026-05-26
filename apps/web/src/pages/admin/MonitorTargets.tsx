import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, message, Popconfirm, Card, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;

const statusColor: Record<string, string> = {
  online: 'green', offline: 'red', warning: 'orange', critical: 'red',
};
const statusLabel: Record<string, string> = {
  online: '在线', offline: '离线', warning: '警告', critical: '严重',
};

const targetTypeOptions = [
  { value: 'server', label: '服务器' },
  { value: 'network', label: '网络设备' },
  { value: 'application', label: '应用服务' },
  { value: 'database', label: '数据库' },
  { value: 'container', label: '容器' },
  { value: 'other', label: '其他' },
];

export default function MonitorTargets() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/monitor/targets', { params: { page, pageSize } }).then(res => {
      const d = res.data.data;
      setData(d.items || d);
      setTotal(d.total || d.length || 0);
    }).catch(() => {
      setData([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [page, pageSize]);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/monitor/targets/${modal.record.id}`, values);
    } else {
      await api.post('/admin/monitor/targets', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/monitor/targets/${id}`);
    message.success('已删除');
    load();
  };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>监控目标管理</Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增目标</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 900 }}
        columns={[
          { title: '名称', dataIndex: 'name', width: 160 },
          { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => targetTypeOptions.find(o => o.value === v)?.label || v },
          { title: '主机', dataIndex: 'host', width: 180 },
          { title: '端口', dataIndex: 'port', width: 80 },
          {
            title: '状态', dataIndex: 'status', width: 90,
            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
          },
          { title: '创建时间', dataIndex: 'createdAt', width: 180 },
          {
            title: '操作', width: 160, fixed: 'right' as const, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title={modal.record ? '编辑目标' : '新增目标'} open={modal.open} width={560}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select options={targetTypeOptions} placeholder="请选择类型" />
          </Form.Item>
          <Space>
            <Form.Item name="host" label="主机" rules={[{ required: true, message: '请输入主机' }]}><Input style={{ width: 300 }} /></Form.Item>
            <Form.Item name="port" label="端口"><InputNumber min={1} max={65535} style={{ width: 120 }} /></Form.Item>
          </Space>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
