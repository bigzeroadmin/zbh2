import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { DesktopOutlined, CheckCircleOutlined, AlertOutlined, DatabaseOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;

const statusColor: Record<string, string> = {
  online: 'green', offline: 'red', warning: 'orange', critical: 'red',
};
const statusLabel: Record<string, string> = {
  online: '在线', offline: '离线', warning: '警告', critical: '严重',
};

export default function MonitorDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/monitor/dashboard').then(res => {
      setDashboard(res.data.data);
    }).catch(() => {
      setDashboard({ totalTargets: 0, onlineTargets: 0, pendingAlerts: 0, todayRecords: 0, recentAlerts: [], targetStatuses: [] });
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>监控总览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="目标总数" value={dashboard?.totalTargets || 0} prefix={<DesktopOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="在线数" value={dashboard?.onlineTargets || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="告警数" value={dashboard?.pendingAlerts || 0} prefix={<AlertOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="今日采集记录" value={dashboard?.todayRecords || 0} prefix={<DatabaseOutlined />} /></Card>
        </Col>
      </Row>

      <Card title="最近告警" style={{ marginBottom: 24 }}>
        <Table
          dataSource={dashboard?.recentAlerts || []}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '时间', dataIndex: 'createdAt', width: 180 },
            { title: '监控项', dataIndex: 'itemName', width: 150 },
            {
              title: '级别', dataIndex: 'level', width: 90,
              render: (v: string) => <Tag color={v === 'critical' ? 'red' : 'orange'}>{v === 'critical' ? '严重' : '警告'}</Tag>,
            },
            { title: '值', dataIndex: 'value', width: 100 },
            { title: '消息', dataIndex: 'message', ellipsis: true },
            {
              title: '状态', dataIndex: 'status', width: 90,
              render: (v: string) => {
                const m: Record<string, { color: string; label: string }> = {
                  pending: { color: 'processing', label: '待处理' },
                  acknowledged: { color: 'warning', label: '已确认' },
                  resolved: { color: 'success', label: '已解决' },
                };
                const s = m[v] || { color: 'default', label: v };
                return <Tag color={s.color}>{s.label}</Tag>;
              },
            },
          ]}
        />
      </Card>

      <Card title="各目标状态概览">
        <Table
          dataSource={dashboard?.targetStatuses || []}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '名称', dataIndex: 'name', width: 200 },
            { title: '类型', dataIndex: 'type', width: 120 },
            { title: '主机', dataIndex: 'host', width: 180 },
            {
              title: '状态', dataIndex: 'status', width: 100,
              render: (v: string) => <Tag color={statusColor[v] || 'default'}>{statusLabel[v] || v}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
