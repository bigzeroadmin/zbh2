import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Tag, message, Popconfirm, Card, Typography, Space, Drawer } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;
const { TextArea } = Input;

const collectMethodOptions = [
  { value: 'agent', label: 'Agent采集' },
  { value: 'snmp', label: 'SNMP' },
  { value: 'http', label: 'HTTP探测' },
  { value: 'icmp', label: 'ICMP' },
  { value: 'script', label: '脚本' },
  { value: 'wmi', label: 'WMI' },
];

const levelOptions = [
  { value: 'warning', label: '警告' },
  { value: 'critical', label: '严重' },
];

const compareOptions = [
  { value: 'gt', label: '大于 (>)' },
  { value: 'lt', label: '小于 (<)' },
  { value: 'eq', label: '等于 (=)' },
  { value: 'gte', label: '大于等于 (>=)' },
  { value: 'lte', label: '小于等于 (<=)' },
];

export default function MonitorItems() {
  const [data, setData] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  // Threshold drawer
  const [drawer, setDrawer] = useState<{ open: boolean; item?: any }>({ open: false });
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [thLoading, setThLoading] = useState(false);
  const [thModal, setThModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [thForm] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/monitor/items', { params: { page, pageSize } }),
      api.get('/admin/monitor/targets', { params: { pageSize: 999 } }),
    ]).then(([itemsRes, targetsRes]) => {
      const d = itemsRes.data.data;
      setData(d.items || d);
      setTotal(d.total || d.length || 0);
      const td = targetsRes.data.data;
      setTargets(td.items || td);
    }).catch(() => {
      setData([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [page, pageSize]);

  const targetMap = Object.fromEntries(targets.map((t: any) => [t.id, t.name]));

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/monitor/items/${modal.record.id}`, values);
    } else {
      await api.post('/admin/monitor/items', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/monitor/items/${id}`);
    message.success('已删除');
    load();
  };

  // Threshold operations
  const openDrawer = (item: any) => {
    setDrawer({ open: true, item });
    loadThresholds(item.id);
  };

  const loadThresholds = (itemId: number) => {
    setThLoading(true);
    api.get('/admin/monitor/thresholds', { params: { itemId } }).then(res => {
      setThresholds(res.data.data.items || res.data.data || []);
    }).catch(() => setThresholds([])).finally(() => setThLoading(false));
  };

  const onThSave = async () => {
    const values = await thForm.validateFields();
    values.itemId = drawer.item?.id;
    if (thModal.record) {
      await api.put(`/admin/monitor/thresholds/${thModal.record.id}`, values);
    } else {
      await api.post('/admin/monitor/thresholds', values);
    }
    message.success('阈值规则保存成功');
    setThModal({ open: false });
    loadThresholds(drawer.item!.id);
  };

  const onThDelete = async (id: number) => {
    await api.delete(`/admin/monitor/thresholds/${id}`);
    message.success('阈值规则已删除');
    loadThresholds(drawer.item!.id);
  };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>监控项管理</Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增监控项</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 1100 }}
        columns={[
          { title: '名称', dataIndex: 'name', width: 140 },
          { title: '键名', dataIndex: 'key', width: 150 },
          { title: '关联目标', dataIndex: 'targetId', width: 120, render: (v: number) => targetMap[v] || '-' },
          { title: '单位', dataIndex: 'unit', width: 80 },
          { title: '采集方式', dataIndex: 'collectMethod', width: 110, render: (v: string) => collectMethodOptions.find(o => o.value === v)?.label || v },
          { title: '间隔(秒)', dataIndex: 'interval', width: 90 },
          {
            title: '启用', dataIndex: 'enabled', width: 70,
            render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>,
          },
          {
            title: '操作', width: 200, fixed: 'right' as const, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => openDrawer(r)}>阈值规则</Button>
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      {/* New/Edit Item Modal */}
      <Modal title={modal.record ? '编辑监控项' : '新增监控项'} open={modal.open} width={600}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="targetId" label="关联目标" rules={[{ required: true, message: '请选择目标' }]}>
            <Select options={targets.map((t: any) => ({ value: t.id, label: t.name }))} placeholder="请选择目标" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="key" label="键名" rules={[{ required: true, message: '请输入键名' }]}><Input placeholder="如 cpu.usage, mem.free" /></Form.Item>
          <Space>
            <Form.Item name="unit" label="单位"><Input style={{ width: 120 }} placeholder="%, MB" /></Form.Item>
            <Form.Item name="collectMethod" label="采集方式" rules={[{ required: true }]}>
              <Select options={collectMethodOptions} style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="interval" label="采集间隔(秒)" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="enabled" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Threshold Drawer */}
      <Drawer title={`阈值规则 - ${drawer.item?.name || ''}`} width={640} open={drawer.open}
        onClose={() => setDrawer({ open: false })} extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { thForm.resetFields(); setThModal({ open: true }); }}>新增阈值</Button>
        }>
        <Table dataSource={thresholds} rowKey="id" loading={thLoading} pagination={false} size="small"
          columns={[
            { title: '级别', dataIndex: 'level', width: 80, render: (v: string) => <Tag color={v === 'critical' ? 'red' : 'orange'}>{v === 'critical' ? '严重' : '警告'}</Tag> },
            { title: '比较方式', dataIndex: 'operator', width: 100, render: (v: string) => compareOptions.find(o => o.value === v)?.label || v },
            { title: '阈值', dataIndex: 'value', width: 80 },
            { title: '持续时间(秒)', dataIndex: 'duration', width: 110 },
            { title: '响应措施', dataIndex: 'action', ellipsis: true },
            { title: '通知消息', dataIndex: 'notifyMessage', ellipsis: true },
            {
              title: '操作', width: 120, render: (_: any, r: any) => (
                <Space size="small">
                  <Button type="link" size="small" onClick={() => { thForm.setFieldsValue(r); setThModal({ open: true, record: r }); }}>编辑</Button>
                  <Popconfirm title="确认删除？" onConfirm={() => onThDelete(r.id)}>
                    <Button type="link" size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Drawer>

      {/* Threshold Modal */}
      <Modal title={thModal.record ? '编辑阈值规则' : '新增阈值规则'} open={thModal.open} width={520}
        onCancel={() => setThModal({ open: false })} onOk={onThSave}>
        <Form form={thForm} layout="vertical">
          <Space>
            <Form.Item name="level" label="级别" rules={[{ required: true }]}>
              <Select options={levelOptions} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="operator" label="比较方式" rules={[{ required: true }]}>
              <Select options={compareOptions} style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Form.Item name="value" label="阈值数值" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="持续时间(秒)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示立即触发" />
          </Form.Item>
          <Form.Item name="action" label="响应措施">
            <TextArea rows={2} placeholder="触发后执行的操作" />
          </Form.Item>
          <Form.Item name="notifyMessage" label="通知消息">
            <TextArea rows={2} placeholder="告警通知的内容模板" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
