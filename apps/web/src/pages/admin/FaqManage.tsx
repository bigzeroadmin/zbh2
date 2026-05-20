import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { TextArea } = Input;

export default function FaqManage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/faq').then(r => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/faq/${modal.record.id}`, values);
    } else {
      await api.post('/admin/faq', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/faq/${id}`);
    message.success('已删除');
    load();
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>AI知识库管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增FAQ</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '问题', dataIndex: 'question', ellipsis: true },
          { title: '分类', dataIndex: 'category', width: 100 },
          { title: '关键词', dataIndex: 'keywords', width: 150, ellipsis: true },
          { title: '排序', dataIndex: 'sort', width: 60 },
          {
            title: '操作', width: 140, render: (_: any, r: any) => (
              <>
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}><Button type="link" size="small" danger>删除</Button></Popconfirm>
              </>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑FAQ' : '新增FAQ'} open={modal.open} width={640}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="question" label="问题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="answer" label="答案" rules={[{ required: true }]}><TextArea rows={6} /></Form.Item>
          <Form.Item name="keywords" label="关键词（逗号分隔）"><Input placeholder="如：Windows,激活,失败" /></Form.Item>
          <Form.Item name="category" label="分类" initialValue="通用"><Input /></Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
