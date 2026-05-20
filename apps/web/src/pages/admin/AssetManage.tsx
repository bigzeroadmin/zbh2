import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, message, Popconfirm, Card, Typography, Space, Tabs } from 'antd';
import { PlusOutlined, SwapOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const statusMap: Record<string, { label: string; color: string }> = {
  in_stock: { label: '库存中', color: 'green' }, in_use: { label: '使用中', color: 'blue' },
  maintenance: { label: '维护中', color: 'orange' }, retired: { label: '已退役', color: 'default' },
  scrapped: { label: '已报废', color: 'red' },
};
const actionLabels: Record<string, string> = {
  check_out: '出库（领用）', check_in: '入库', maintenance: '送修', return: '归还', retire: '退役', scrap: '报废',
};

export default function AssetManage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [opModal, setOpModal] = useState<{ open: boolean; asset?: any }>({ open: false });
  const [form] = Form.useForm();
  const [opForm] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/assets'),
      api.get('/admin/asset-categories'),
      api.get('/admin/users'),
    ]).then(([a, c, u]) => {
      setAssets(a.data.data);
      setCategories(c.data.data);
      setUsers(u.data.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const catMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));
  const userMap = Object.fromEntries(users.map((u: any) => [u.id, u.username]));

  const onSave = async () => {
    const values = await form.validateFields();
    if (values.purchaseDate) values.purchaseDate = values.purchaseDate.format('YYYY-MM-DD');
    if (values.warrantyExpiry) values.warrantyExpiry = values.warrantyExpiry.format('YYYY-MM-DD');
    if (modal.record) {
      await api.put(`/admin/assets/${modal.record.id}`, values);
    } else {
      await api.post('/admin/assets', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onOperate = async () => {
    const values = await opForm.validateFields();
    await api.post(`/admin/assets/${opModal.asset.id}/operate`, values);
    message.success('操作成功');
    setOpModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/assets/${id}`);
    message.success('已删除');
    load();
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>数字资产管理</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal({ open: true }); }}>新增资产</Button>}>
      <Table dataSource={assets} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} scroll={{ x: 1100 }}
        columns={[
          { title: '资产编号', dataIndex: 'assetCode', width: 110 },
          { title: '名称', dataIndex: 'name', width: 150 },
          { title: '分类', dataIndex: 'categoryId', width: 90, render: (v: number) => catMap[v] || '-' },
          { title: '品牌/型号', width: 130, render: (_: any, r: any) => [r.brand, r.model].filter(Boolean).join(' ') || '-' },
          { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
          { title: '使用人', dataIndex: 'assigneeId', width: 90, render: (v: number) => userMap[v] || '-' },
          { title: '位置', dataIndex: 'location', width: 100, ellipsis: true },
          {
            title: '操作', width: 200, fixed: 'right' as const, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" icon={<SwapOutlined />}
                  onClick={() => { opForm.resetFields(); setOpModal({ open: true, asset: r }); }}>操作</Button>
                <Button type="link" size="small" onClick={() => { form.setFieldsValue({ ...r }); setModal({ open: true, record: r }); }}>编辑</Button>
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title={modal.record ? '编辑资产' : '新增资产'} open={modal.open} width={640}
        onCancel={() => setModal({ open: false })} onOk={onSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="assetCode" label="资产编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="categoryId" label="分类">
            <Select allowClear options={categories.map((c: any) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Space>
            <Form.Item name="brand" label="品牌"><Input /></Form.Item>
            <Form.Item name="model" label="型号"><Input /></Form.Item>
            <Form.Item name="serialNumber" label="序列号"><Input /></Form.Item>
          </Space>
          <Space>
            <Form.Item name="purchasePrice" label="采购价格（分）"><InputNumber min={0} style={{ width: 200 }} /></Form.Item>
            <Form.Item name="location" label="存放位置"><Input /></Form.Item>
          </Space>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`资产操作：${opModal.asset?.name || ''}`} open={opModal.open}
        onCancel={() => setOpModal({ open: false })} onOk={onOperate}>
        <Form form={opForm} layout="vertical">
          <Form.Item name="action" label="操作类型" rules={[{ required: true }]}>
            <Select options={Object.entries(actionLabels).map(([k, v]) => ({ value: k, label: v }))} />
          </Form.Item>
          <Form.Item name="targetUserId" label="目标用户（出库/领用时选择）">
            <Select allowClear options={users.map((u: any) => ({ value: u.id, label: u.username }))} />
          </Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
