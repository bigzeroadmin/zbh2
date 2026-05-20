import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Card, Typography, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'green' },
  archived: { label: '已回收', color: 'red' },
};

export default function HelpDocuments() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/help-documents'),
      api.get('/admin/help-categories'),
    ]).then(([docs, cats]) => {
      setData(docs.data.data);
      setCategories(cats.data.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/help-documents/${modal.record.id}`, values);
    } else {
      await api.post('/admin/help-documents', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/help-documents/${id}`);
    message.success('已删除');
    load();
  };

  const onStatusChange = async (id: number, status: string) => {
    await api.put(`/admin/help-documents/${id}`, { status });
    message.success('状态已更新');
    load();
  };

  const catMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>帮助文档管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增文档</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '标题', dataIndex: 'title' },
          { title: '分类', dataIndex: 'categoryId', render: (v: number) => catMap[v] || v },
          { title: '排序', dataIndex: 'sort', width: 60 },
          {
            title: '状态', dataIndex: 'status', width: 100,
            render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label || v}</Tag>,
          },
          {
            title: '操作', width: 260, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                {r.status === 'draft' && <Button type="link" size="small" onClick={() => onStatusChange(r.id, 'published')}>发布</Button>}
                {r.status === 'published' && <Button type="link" size="small" danger onClick={() => onStatusChange(r.id, 'archived')}>回收</Button>}
                {r.status === 'archived' && <Button type="link" size="small" onClick={() => onStatusChange(r.id, 'draft')}>恢复草稿</Button>}
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑文档' : '新增文档'} open={modal.open} width={700}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Select options={categories.map((c: any) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="body" label="内容 (Markdown)">
            <Input.TextArea rows={12} placeholder="支持 Markdown 格式" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select options={[
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '发布' },
              { value: 'archived', label: '回收' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
