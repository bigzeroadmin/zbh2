import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, message, Popconfirm, Card, Typography, Space, Tag } from 'antd';
import { PlusOutlined, ApiOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import api from '../../lib/api';

const { TextArea } = Input;

const providerOptions = [
  { label: 'Kimi (月之暗面)', value: 'kimi' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: '通义千问', value: 'qwen' },
  { label: '其他', value: 'other' },
];

const providerBaseUrlMap: Record<string, string> = {
  kimi: 'https://api.moonshot.cn/v1',
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  other: '',
};

export default function ModelConfig() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [testing, setTesting] = useState<number | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/admin/model-configs').then(r => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onProviderChange = (provider: string) => {
    const url = providerBaseUrlMap[provider];
    if (url) {
      form.setFieldsValue({ baseUrl: url });
    }
    // Set default model
    const modelMap: Record<string, string> = {
      kimi: 'moonshot-v1-8k',
      openai: 'gpt-3.5-turbo',
      deepseek: 'deepseek-chat',
      qwen: 'qwen-turbo',
    };
    if (modelMap[provider]) {
      form.setFieldsValue({ model: modelMap[provider] });
    }
  };

  const onSave = async () => {
    const values = await form.validateFields();
    // Convert enabled/isDefault from boolean to integer
    if (typeof values.enabled === 'boolean') values.enabled = values.enabled ? 1 : 0;
    if (typeof values.isDefault === 'boolean') values.isDefault = values.isDefault ? 1 : 0;

    if (modal.record) {
      // If apiKey is masked, don't send it
      if (values.apiKey && values.apiKey.includes('****')) {
        delete values.apiKey;
      }
      await api.put(`/admin/model-configs/${modal.record.id}`, values);
    } else {
      await api.post('/admin/model-configs', values);
    }
    message.success('保存成功');
    setModal({ open: false });
    load();
  };

  const onDelete = async (id: number) => {
    await api.delete(`/admin/model-configs/${id}`);
    message.success('已删除');
    load();
  };

  const onTest = async (id: number) => {
    setTesting(id);
    try {
      const res = await api.post(`/admin/model-configs/${id}/test`);
      if (res.data.success) {
        message.success(`连接成功！模型回复：${res.data.data.reply}`);
      } else {
        message.error(`连接失败：${res.data.error}`);
      }
    } catch (err: any) {
      message.error(`测试出错：${err.message}`);
    } finally {
      setTesting(null);
    }
  };

  const onSetDefault = async (id: number) => {
    await api.put(`/admin/model-configs/${id}`, { isDefault: 1 });
    message.success('已设为默认模型');
    load();
  };

  return (
    <Card title={<Typography.Title level={5} style={{ margin: 0 }}>AI模型配置</Typography.Title>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
        form.resetFields();
        form.setFieldsValue({ provider: 'kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', temperature: 0.7, maxTokens: 2048, enabled: true, isDefault: false });
        setModal({ open: true });
      }}>新增模型</Button>}>
      <Table dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: '名称', dataIndex: 'name', width: 150 },
          { title: '供应商', dataIndex: 'provider', width: 120, render: (v: string) => providerOptions.find(p => p.value === v)?.label || v },
          { title: '模型', dataIndex: 'model', width: 160 },
          { title: 'API Key', dataIndex: 'apiKey', width: 160, ellipsis: true },
          { title: 'Base URL', dataIndex: 'baseUrl', width: 200, ellipsis: true },
          {
            title: '状态', width: 100, render: (_: any, r: any) => (
              <Space>
                {r.enabled ? <Tag color="green" icon={<CheckCircleOutlined />}>启用</Tag> : <Tag color="red" icon={<StopOutlined />}>禁用</Tag>}
                {r.isDefault ? <Tag color="blue">默认</Tag> : null}
              </Space>
            ),
          },
          {
            title: '操作', width: 220, render: (_: any, r: any) => (
              <Space size="small">
                <Button type="link" size="small" onClick={() => { form.setFieldsValue({ ...r, enabled: !!r.enabled, isDefault: !!r.isDefault }); setModal({ open: true, record: r }); }}>编辑</Button>
                <Button type="link" size="small" icon={<ApiOutlined />} loading={testing === r.id} onClick={() => onTest(r.id)}>测试</Button>
                {!r.isDefault && <Button type="link" size="small" onClick={() => onSetDefault(r.id)}>设为默认</Button>}
                <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}><Button type="link" size="small" danger>删除</Button></Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={modal.record ? '编辑模型配置' : '新增模型配置'} open={modal.open} width={640}
        onCancel={() => setModal({ open: false })} onOk={onSave} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="配置名称" rules={[{ required: true, message: '请输入配置名称' }]}>
            <Input placeholder="如：Kimi生产环境" />
          </Form.Item>
          <Form.Item name="provider" label="供应商" rules={[{ required: true }]}>
            <Select options={providerOptions} onChange={onProviderChange} />
          </Form.Item>
          <Form.Item name="model" label="模型名称" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input placeholder="如：moonshot-v1-8k" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key" rules={modal.record ? [] : [{ required: true, message: '请输入API Key' }]}>
            <Input.Password placeholder={modal.record ? '留空则保持原值' : '请输入API Key'} />
          </Form.Item>
          <Form.Item name="baseUrl" label="Base URL" rules={[{ required: true }]}>
            <Input placeholder="API基础地址" />
          </Form.Item>
          <Form.Item name="systemPrompt" label="系统提示词">
            <TextArea rows={4} placeholder="设置AI助手的角色和行为，如：你是正版化软件管理平台的智能客服..." />
          </Form.Item>
          <Form.Item name="temperature" label="Temperature" initialValue={0.7}>
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxTokens" label="Max Tokens" initialValue={2048}>
            <InputNumber min={100} max={32768} step={256} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认模型" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
