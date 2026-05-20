import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, message, Typography, Empty, Space } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: '待处理', color: 'orange' },
  assigned: { label: '已分配', color: 'blue' },
  in_progress: { label: '处理中', color: 'processing' },
  resolved: { label: '已解决', color: 'green' },
  closed: { label: '已关闭', color: 'default' },
};
const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'default' }, medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' }, urgent: { label: '紧急', color: 'red' },
};
const typeLabels: Record<string, string> = { bug: '故障报修', request: '需求建议', question: '咨询提问', other: '其他' };

export default function Tickets() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login?redirect=/tickets'); return; }
    if (user) loadTickets();
  }, [user, authLoading]);

  const loadTickets = () => {
    setLoading(true);
    api.get('/me/tickets').then(r => setTickets(r.data.data)).finally(() => setLoading(false));
  };

  const onCreate = async () => {
    const values = await form.validateFields();
    await api.post('/me/tickets', values);
    message.success('工单提交成功');
    setCreateOpen(false);
    form.resetFields();
    loadTickets();
  };

  const openDetail = async (id: number) => {
    const res = await api.get(`/me/tickets/${id}`);
    setCurrent(res.data.data);
    setDetailOpen(true);
    setReplyText('');
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    await api.post(`/me/tickets/${current.id}/reply`, { content: replyText });
    message.success('回复成功');
    openDetail(current.id);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1a3a5c', margin: 0 }}>
          <MessageOutlined style={{ marginRight: 8 }} />我的工单
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreateOpen(true); }}>提交工单</Button>
      </div>
      <Card>
        <Table dataSource={tickets} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
          columns={[
            { title: '标题', dataIndex: 'title', render: (v: string, r: any) => <a onClick={() => openDetail(r.id)}>{v}</a> },
            { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => typeLabels[v] || v },
            { title: '优先级', dataIndex: 'priority', width: 80, render: (v: string) => <Tag color={priorityMap[v]?.color}>{priorityMap[v]?.label}</Tag> },
            { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
            { title: '提交时间', dataIndex: 'createdAt', width: 170, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
          ]}
        />
      </Card>

      <Modal title="提交工单" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={onCreate} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请填写标题' }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" initialValue="question">
            <Select options={[{ value: 'bug', label: '故障报修' }, { value: 'request', label: '需求建议' }, { value: 'question', label: '咨询提问' }, { value: 'other', label: '其他' }]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select options={[{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }, { value: 'urgent', label: '紧急' }]} />
          </Form.Item>
          <Form.Item name="description" label="详细描述" rules={[{ required: true, message: '请描述问题' }]}><TextArea rows={5} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={current?.title} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {current && (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Tag color={statusMap[current.status]?.color}>{statusMap[current.status]?.label}</Tag>
              <Tag color={priorityMap[current.priority]?.color}>{priorityMap[current.priority]?.label}</Tag>
              <Text type="secondary">{typeLabels[current.type]}</Text>
            </Space>
            <Card size="small" style={{ marginBottom: 16, background: '#f9fbfd' }}>
              <Text>{current.description}</Text>
              <div style={{ marginTop: 8 }}><Text type="secondary">{new Date(current.createdAt).toLocaleString('zh-CN')}</Text></div>
            </Card>
            {current.replies?.map((r: any) => (
              <Card key={r.id} size="small" style={{ marginBottom: 8, background: r.userId === user?.id ? '#f0f7ff' : '#fff' }}>
                <Text strong>{r.username}</Text>
                <div style={{ marginTop: 4 }}>{r.content}</div>
                <div style={{ marginTop: 4 }}><Text type="secondary" style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleString('zh-CN')}</Text></div>
              </Card>
            ))}
            {!['resolved', 'closed'].includes(current.status) && (
              <div style={{ marginTop: 16 }}>
                <TextArea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="输入回复内容..." />
                <Button type="primary" style={{ marginTop: 8 }} onClick={sendReply}>回复</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
