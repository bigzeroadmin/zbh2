import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Popconfirm, Card, Typography, Tag } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../lib/api';

export default function SoftwareItems() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/software-items'),
      api.get('/admin/software-categories'),
    ]).then(([items, cats]) => {
      setData(items.data.data);
      setCategories(cats.data.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/admin/upload', formData);
      onSuccess(res.data.data);
      message.success('上传成功');
    } catch (err) {
      onError(err);
    }
  };

  const onSave = async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (values.fileUpload?.[0]?.response) {
      payload.fileId = values.fileUpload[0].response.id;
    }
    delete payload.fileUpload;
    if (modal.record) {
      await api.put(`/admin/software-items/${modal.record.id}`, payload);
    } else {
      await api.post('/admin/software-items', payload);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/software-items/${id}`);
    message.success('已删除');
    load();
  };

  const catMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>软件列表管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增软件</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '标题', dataIndex: 'title' },
          { title: '分类', dataIndex: 'categoryId', render: (v: number) => catMap[v] || v },
          { title: '版本', dataIndex: 'version', width: 100 },
          { title: '排序', dataIndex: 'sort', width: 60 },
          { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => v === 'published' ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag> },
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
      <Modal title={modal.record ? '编辑软件' : '新增软件'} open={modal.open} width={600}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Select options={categories.map((c: any) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="version" label="版本号">
            <Input placeholder="如 2024.1" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select options={[{ value: 'draft', label: '草稿' }, { value: 'published', label: '发布' }]} />
          </Form.Item>
          <Form.Item name="fileUpload" label="上传安装包" valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
            <Upload customRequest={handleUpload} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
