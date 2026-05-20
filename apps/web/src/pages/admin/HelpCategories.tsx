import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../lib/api';

export default function HelpCategories() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/help-categories').then((r) => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = async () => {
    const values = await form.validateFields();
    if (modal.record) {
      await api.put(`/admin/help-categories/${modal.record.id}`, values);
    } else {
      await api.post('/admin/help-categories', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/help-categories/${id}`);
    message.success('已删除');
    load();
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>文档分类管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增分类</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sort', width: 80 },
          {
            title: '操作', width: 160, render: (_: any, r: any) => (
              <>
                <Button type="link" size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑分类' : '新增分类'} open={modal.open}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
