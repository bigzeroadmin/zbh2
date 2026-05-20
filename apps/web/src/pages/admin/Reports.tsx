import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Button, Tabs, Descriptions, message } from 'antd';
import { BarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { Title } = Typography;

export default function Reports() {
  const [softwareReport, setSoftwareReport] = useState<any>(null);
  const [activationReport, setActivationReport] = useState<any>(null);
  const [assetReport, setAssetReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/reports/software-assets'),
      api.get('/admin/reports/activation'),
      api.get('/admin/reports/digital-assets'),
    ]).then(([sw, act, ast]) => {
      setSoftwareReport(sw.data.data);
      setActivationReport(act.data.data);
      setAssetReport(ast.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    const res = await api.get('/admin/reports/export');
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `正版化资产报表_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('报表已导出');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}><BarChartOutlined style={{ marginRight: 8 }} />资产报表</Title>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>导出完整报表</Button>
      </div>

      <Tabs items={[
        {
          key: 'software', label: '软件资产',
          children: softwareReport && (
            <div>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}><Card><Statistic title="软件总数" value={softwareReport.totalSoftware} /></Card></Col>
                <Col span={8}><Card><Statistic title="已发布" value={softwareReport.publishedCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={8}><Card><Statistic title="草稿" value={softwareReport.draftCount} valueStyle={{ color: '#faad14' }} /></Card></Col>
              </Row>
              <Card title="按分类统计">
                <Table dataSource={Object.entries(softwareReport.byCategory).map(([name, stats]: any) => ({ name, ...stats }))}
                  rowKey="name" pagination={false}
                  columns={[
                    { title: '分类', dataIndex: 'name' },
                    { title: '总数', dataIndex: 'total' },
                    { title: '已发布', dataIndex: 'published' },
                    { title: '草稿', dataIndex: 'draft' },
                  ]}
                />
              </Card>
            </div>
          ),
        },
        {
          key: 'activation', label: '激活码使用',
          children: activationReport && (
            <div>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}><Card><Statistic title="总发放次数" value={activationReport.totalGrants} /></Card></Col>
              </Row>
              <Card title="按产品统计">
                <Table dataSource={activationReport.productStats} rowKey="productId" pagination={false}
                  columns={[
                    { title: '产品', dataIndex: 'productName' },
                    { title: '码总量', dataIndex: 'totalCodes' },
                    { title: '可用', dataIndex: 'available', render: (v: number) => <Tag color="green">{v}</Tag> },
                    { title: '已发放', dataIndex: 'granted', render: (v: number) => <Tag color="blue">{v}</Tag> },
                    { title: '已作废', dataIndex: 'revoked', render: (v: number) => <Tag color="red">{v}</Tag> },
                    { title: '使用率', dataIndex: 'usageRate', render: (v: number) => `${v}%` },
                  ]}
                />
              </Card>
              {Object.keys(activationReport.monthlyGrants).length > 0 && (
                <Card title="月度发放趋势" style={{ marginTop: 16 }}>
                  <Table
                    dataSource={Object.entries(activationReport.monthlyGrants).sort().map(([month, count]) => ({ month, count }))}
                    rowKey="month" pagination={false}
                    columns={[
                      { title: '月份', dataIndex: 'month' },
                      { title: '发放数量', dataIndex: 'count' },
                    ]}
                  />
                </Card>
              )}
            </div>
          ),
        },
        {
          key: 'assets', label: '数字资产',
          children: assetReport && (
            <div>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}><Card><Statistic title="资产总数" value={assetReport.totalAssets} /></Card></Col>
                <Col span={6}><Card><Statistic title="资产总值" value={assetReport.totalValue / 100} prefix="¥" precision={2} /></Card></Col>
                <Col span={6}><Card><Statistic title="在用资产总值" value={assetReport.activeValue / 100} prefix="¥" precision={2} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="按状态统计">
                    <Table dataSource={Object.entries(assetReport.byStatus).map(([name, count]) => ({ name, count }))}
                      rowKey="name" pagination={false}
                      columns={[{ title: '状态', dataIndex: 'name' }, { title: '数量', dataIndex: 'count' }]}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="按分类统计">
                    <Table dataSource={Object.entries(assetReport.byCategory).map(([name, count]) => ({ name, count }))}
                      rowKey="name" pagination={false}
                      columns={[{ title: '分类', dataIndex: 'name' }, { title: '数量', dataIndex: 'count' }]}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
      ]} />
    </div>
  );
}
