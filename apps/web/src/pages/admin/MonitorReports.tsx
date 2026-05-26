import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, Card, Typography, Space, Tabs, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../lib/api';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function MonitorReports() {
  const [activeTab, setActiveTab] = useState('reports');

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportPage, setReportPage] = useState(1);
  const [reportLoading, setReportLoading] = useState(true);
  const [genModal, setGenModal] = useState(false);
  const [genForm] = Form.useForm();
  const [detailModal, setDetailModal] = useState<{ open: boolean; content?: any }>({ open: false });

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateTotal, setTemplateTotal] = useState(0);
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [tplModal, setTplModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [tplForm] = Form.useForm();

  const loadReports = () => {
    setReportLoading(true);
    api.get('/admin/monitor/reports', { params: { page: reportPage, pageSize: 20 } }).then(res => {
      const d = res.data.data;
      setReports(d.items || d);
      setReportTotal(d.total || d.length || 0);
    }).catch(() => { setReports([]); setReportTotal(0); }).finally(() => setReportLoading(false));
  };

  const loadTemplates = () => {
    setTemplateLoading(true);
    api.get('/admin/monitor/report-templates', { params: { page: templatePage, pageSize: 20 } }).then(res => {
      const d = res.data.data;
      setTemplates(d.items || d);
      setTemplateTotal(d.total || d.length || 0);
    }).catch(() => { setTemplates([]); setTemplateTotal(0); }).finally(() => setTemplateLoading(false));
  };

  useEffect(loadReports, [reportPage]);
  useEffect(loadTemplates, [templatePage]);

  const onGenerate = async () => {
    const values = await genForm.validateFields();
    const payload = {
      templateId: values.templateId,
      startTime: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
    };
    await api.post('/admin/monitor/reports/generate', payload);
    message.success('报告生成中');
    setGenModal(false);
    genForm.resetFields();
    loadReports();
  };

  const onReportDelete = async (id: number) => {
    await api.delete(`/admin/monitor/reports/${id}`);
    message.success('已删除');
    loadReports();
  };

  const onTplSave = async () => {
    const values = await tplForm.validateFields();
    if (tplModal.record) {
      await api.put(`/admin/monitor/report-templates/${tplModal.record.id}`, values);
    } else {
      await api.post('/admin/monitor/report-templates', values);
    }
    message.success('保存成功');
    setTplModal({ open: false });
    loadTemplates();
  };

  const onTplDelete = async (id: number) => {
    await api.delete(`/admin/monitor/report-templates/${id}`);
    message.success('已删除');
    loadTemplates();
  };

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>监控报告</Title>}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'reports',
          label: '报告列表',
          children: (
            <>
              <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}
                onClick={() => { genForm.resetFields(); setGenModal(true); }}>生成报告</Button>
              <Table dataSource={reports} rowKey="id" loading={reportLoading}
                pagination={{ current: reportPage, pageSize: 20, total: reportTotal, onChange: setReportPage }}
                scroll={{ x: 900 }}
                columns={[
                  { title: '报告名称', dataIndex: 'name', width: 200 },
                  { title: '模板', dataIndex: 'templateName', width: 150 },
                  { title: '开始时间', dataIndex: 'startTime', width: 180 },
                  { title: '结束时间', dataIndex: 'endTime', width: 180 },
                  { title: '生成时间', dataIndex: 'createdAt', width: 180 },
                  {
                    title: '操作', width: 160, render: (_: any, r: any) => (
                      <Space size="small">
                        <Button type="link" size="small" onClick={() => setDetailModal({ open: true, content: r.content })}>详情</Button>
                        <Popconfirm title="确认删除？" onConfirm={() => onReportDelete(r.id)}>
                          <Button type="link" size="small" danger>删除</Button>
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            </>
          ),
        },
        {
          key: 'templates',
          label: '报告模板',
          children: (
            <>
              <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}
                onClick={() => { tplForm.resetFields(); setTplModal({ open: true }); }}>新增模板</Button>
              <Table dataSource={templates} rowKey="id" loading={templateLoading}
                pagination={{ current: templatePage, pageSize: 20, total: templateTotal, onChange: setTemplatePage }}
                scroll={{ x: 800 }}
                columns={[
                  { title: '模板名称', dataIndex: 'name', width: 200 },
                  { title: '描述', dataIndex: 'description', ellipsis: true },
                  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
                  {
                    title: '操作', width: 160, render: (_: any, r: any) => (
                      <Space size="small">
                        <Button type="link" size="small" onClick={() => { tplForm.setFieldsValue(r); setTplModal({ open: true, record: r }); }}>编辑</Button>
                        <Popconfirm title="确认删除？" onConfirm={() => onTplDelete(r.id)}>
                          <Button type="link" size="small" danger>删除</Button>
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            </>
          ),
        },
      ]} />

      {/* Generate Report Modal */}
      <Modal title="生成报告" open={genModal} onCancel={() => setGenModal(false)} onOk={onGenerate}>
        <Form form={genForm} layout="vertical">
          <Form.Item name="templateId" label="选择模板" rules={[{ required: true, message: '请选择模板' }]}>
            <Select options={templates.map((t: any) => ({ value: t.id, label: t.name }))} placeholder="请选择模板" />
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围" rules={[{ required: true, message: '请选择时间范围' }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Report Detail Modal */}
      <Modal title="报告详情" open={detailModal.open} width={700}
        onCancel={() => setDetailModal({ open: false })} footer={null}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, maxHeight: 500, overflow: 'auto', fontSize: 13 }}>
          {detailModal.content ? JSON.stringify(detailModal.content, null, 2) : '无内容'}
        </pre>
      </Modal>

      {/* Template Modal */}
      <Modal title={tplModal.record ? '编辑模板' : '新增模板'} open={tplModal.open} width={600}
        onCancel={() => setTplModal({ open: false })} onOk={onTplSave}>
        <Form form={tplForm} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
          <Form.Item name="config" label="配置(JSON)" rules={[{ required: true, message: '请输入配置' }]}>
            <TextArea rows={8} placeholder='{"metrics": [], "interval": "1h"}' />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
