import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Select, Tag, Input, Card, Typography, Space, message, Tabs } from 'antd';
import api from '../../lib/api';

const { TextArea } = Input;

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: '待处理', color: 'orange' }, assigned: { label: '已分配', color: 'blue' },
  in_progress: { label: '处理中', color: 'processing' }, resolved: { label: '已解决', color: 'green' },
  closed: { label: '已关闭', color: 'default' },
};
const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'default' }, medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' }, urgent: { label: '紧急', color: 'red' },
};
const typeLabels: Record<string, string> = { bug: '故障报修', request: '需求建议', question: '咨询提问', other: '其他' };

export default function TicketManage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const load = (status?: string) => {
    setLoading(true);
    const params = status ? { status } : {};
    api.get('/admin/tickets', { params }).then(r => setTickets(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/admin/users').then(r => setUsers(r.data.data));
  }, []);

  const openDetail = async (id: number) => {
    const res = await api.get(`/admin/tickets/${id}`);
    setCurrent(res.data.data);
    setDetailOpen(true);
    setReplyText('');
  };

  const updateTicket = async (id: number, updates: any) => {
    await api.put(`/admin/tickets/${id}`, updates);
    message.success('更新成功');
    load(statusFilter || undefined);
    if (current?.id === id) openDetail(id);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    await api.post(`/admin/tickets/${current.id}/reply`, { content: replyText });
    message.success('回复成功');
    openDetail(current.id);
  };

  const tabItems = [
    { key: '', label: '全部' },
    { key: 'open', label: '待处理' },
    { key: 'assigned', label: '已分配' },
    { key: 'in_progress', label: '处理中' },
    { key: 'resolved', label: '已解决' },
    { key: 'closed', label: '已关闭' },
  ];

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>工单管理</Typography.Title>}>
      <Tabs items={tabItems} onChange={(key) => { setStatusFilter(key); load(key || undefined); }} />
      <Table dataSource={tickets} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '标题', dataIndex: 'title', render: (v: string, r: any) => <a onClick={() => openDetail(r.id)}>{v}</a> },
          { title: '提交人', dataIndex: 'submitter', width: 100 },
          { title: '类型', dataIndex: 'type', width: 90, render: (v: string) => typeLabels[v] || v },
          { title: '优先级', dataIndex: 'priority', width: 70, render: (v: string) => <Tag color={priorityMap[v]?.color}>{priorityMap[v]?.label}</Tag> },
          { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
          { title: '时间', dataIndex: 'createdAt', width: 160, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
          {
            title: '操作', width: 200, render: (_: any, r: any) => (
              <Space size="small">
                <Select size="small" style={{ width: 90 }} value={r.status}
                  onChange={(v) => updateTicket(r.id, { status: v })}
                  options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
                <Select size="small" style={{ width: 100 }} placeholder="分配" value={r.assigneeId || undefined}
                  onChange={(v) => updateTicket(r.id, { assigneeId: v, status: 'assigned' })}
                  options={users.filter(u => u.role === 'admin').map((u: any) => ({ value: u.id, label: u.username }))} />
              </Space>
            ),
          },
        ]}
      />

      <Modal title={current?.title} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {current && (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Tag color={statusMap[current.status]?.color}>{statusMap[current.status]?.label}</Tag>
              <Tag color={priorityMap[current.priority]?.color}>{priorityMap[current.priority]?.label}</Tag>
            </Space>
            <Card size="small" style={{ marginBottom: 16, background: '#f9fbfd' }}>{current.description}</Card>
            {current.replies?.map((r: any) => (
              <Card key={r.id} size="small" style={{ marginBottom: 8 }}>
                <strong>{r.username}</strong>
                <div style={{ marginTop: 4 }}>{r.content}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>{new Date(r.createdAt).toLocaleString('zh-CN')}</div>
              </Card>
            ))}
            <div style={{ marginTop: 16 }}>
              <TextArea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="管理员回复..." />
              <Button type="primary" style={{ marginTop: 8 }} onClick={sendReply}>回复</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
