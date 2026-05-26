import React, { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, message, Card, Typography, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;

const levelColor: Record<string, string> = { warning: 'orange', critical: 'red' };
const levelLabel: Record<string, string> = { warning: '警告', critical: '严重' };
const statusColor: Record<string, string> = { pending: 'processing', acknowledged: 'warning', resolved: 'success' };
const statusLabel: Record<string, string> = { pending: '待处理', acknowledged: '已确认', resolved: '已解决' };

export default function MonitorAlerts() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const load = () => {
    setLoading(true);
    api.get('/admin/monitor/alerts', {
      params: { page, pageSize, level: filterLevel, status: filterStatus },
    }).then(res => {
      const d = res.data.data;
      setData(d.items || d);
      setTotal(d.total || d.length || 0);
    }).catch(() => {
      setData([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [page, pageSize, filterLevel, filterStatus]);

  const onAcknowledge = async (id: number) => {
    await api.put(`/admin/monitor/alerts/${id}`, { status: 'acknowledged' });
    message.success('已确认');
    load();
  };

  const onResolve = async (id: number) => {
    await api.put(`/admin/monitor/alerts/${id}`, { status: 'resolved' });
    message.success('已解决');
    load();
  };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>告警中心</Title>}>
      <Space style={{ marginBottom: 16 }}>
        <Select allowClear placeholder="告警级别" style={{ width: 140 }} value={filterLevel} onChange={setFilterLevel}
          options={[{ value: 'warning', label: '警告' }, { value: 'critical', label: '严重' }]} />
        <Select allowClear placeholder="告警状态" style={{ width: 140 }} value={filterStatus} onChange={setFilterStatus}
          options={[{ value: 'pending', label: '待处理' }, { value: 'acknowledged', label: '已确认' }, { value: 'resolved', label: '已解决' }]} />
      </Space>

      <Table dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        scroll={{ x: 1000 }}
        columns={[
          { title: '时间', dataIndex: 'createdAt', width: 180 },
          { title: '监控项', dataIndex: 'itemName', width: 150 },
          {
            title: '级别', dataIndex: 'level', width: 80,
            render: (v: string) => <Tag color={levelColor[v] || 'default'}>{levelLabel[v] || v}</Tag>,
          },
          { title: '值', dataIndex: 'value', width: 100 },
          { title: '消息', dataIndex: 'message', ellipsis: true },
          {
            title: '状态', dataIndex: 'status', width: 90,
            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
          },
          {
            title: '操作', width: 160, fixed: 'right' as const, render: (_: any, r: any) => (
              <Space size="small">
                {r.status === 'pending' && (
                  <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => onAcknowledge(r.id)}>确认</Button>
                )}
                {(r.status === 'pending' || r.status === 'acknowledged') && (
                  <Button type="link" size="small" icon={<CloseOutlined />} onClick={() => onResolve(r.id)}>解决</Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
