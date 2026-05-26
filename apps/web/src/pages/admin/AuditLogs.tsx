import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, Tag, Card, Typography, Space, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const actionOptions = [
  { value: 'login', label: '登录' }, { value: 'logout', label: '登出' },
  { value: 'create', label: '创建' }, { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' }, { value: 'view', label: '查看' },
  { value: 'export', label: '导出' }, { value: 'config', label: '配置' },
];

const targetTypeOptions = [
  { value: 'user', label: '用户' }, { value: 'software', label: '软件' },
  { value: 'document', label: '文档' }, { value: 'activation', label: '激活' },
  { value: 'asset', label: '资产' }, { value: 'ticket', label: '工单' },
  { value: 'saas', label: '云服务' }, { value: 'faq', label: 'FAQ' },
  { value: 'system', label: '系统' }, { value: 'database', label: '数据库' },
  { value: 'device', label: '设备' }, { value: 'monitor', label: '监控' },
];

const resultColor: Record<string, string> = { success: 'green', failure: 'red' };
const resultLabel: Record<string, string> = { success: '成功', failure: '失败' };

export default function AuditLogs() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    const values = form.getFieldsValue();
    const params: any = { page, pageSize };
    if (values.username) params.username = values.username;
    if (values.action) params.action = values.action;
    if (values.targetType) params.targetType = values.targetType;
    if (values.timeRange?.[0]) params.startTime = values.timeRange[0].format('YYYY-MM-DD HH:mm:ss');
    if (values.timeRange?.[1]) params.endTime = values.timeRange[1].format('YYYY-MM-DD HH:mm:ss');

    api.get('/admin/monitor/audit-logs', { params }).then(res => {
      const d = res.data.data;
      setData(d.items || d);
      setTotal(d.total || d.length || 0);
    }).catch(() => { setData([]); setTotal(0); }).finally(() => setLoading(false));
  };
  useEffect(load, [page, pageSize]);

  const onSearch = () => { setPage(1); load(); };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>审计日志</Title>}>
      <Form form={form} layout="inline" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Form.Item name="username">
          <Input placeholder="用户名" allowClear style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="action">
          <Select allowClear placeholder="操作类型" style={{ width: 130 }} options={actionOptions} />
        </Form.Item>
        <Form.Item name="targetType">
          <Select allowClear placeholder="目标类型" style={{ width: 130 }} options={targetTypeOptions} />
        </Form.Item>
        <Form.Item name="timeRange">
          <RangePicker showTime style={{ width: 360 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
        </Form.Item>
      </Form>

      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 1100 }}
        columns={[
          { title: '时间', dataIndex: 'createdAt', width: 180 },
          { title: '用户', dataIndex: 'username', width: 120 },
          {
            title: '操作', dataIndex: 'action', width: 90,
            render: (v: string) => actionOptions.find(o => o.value === v)?.label || v,
          },
          {
            title: '目标类型', dataIndex: 'targetType', width: 100,
            render: (v: string) => targetTypeOptions.find(o => o.value === v)?.label || v,
          },
          { title: '目标名称', dataIndex: 'targetName', width: 160, ellipsis: true },
          { title: 'IP地址', dataIndex: 'ip', width: 140 },
          {
            title: '结果', dataIndex: 'result', width: 80,
            render: (v: string) => <Tag color={resultColor[v] || 'default'}>{resultLabel[v] || v}</Tag>,
          },
          { title: '详情', dataIndex: 'detail', ellipsis: true },
        ]}
      />
    </Card>
  );
}
