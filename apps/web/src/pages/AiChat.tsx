import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Spin, Tag, Space } from 'antd';
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';

const { Title, Text } = Typography;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  matches?: { id: number; question: string; category: string }[];
}

const quickQuestions = [
  'Windows 激活失败怎么办？',
  '如何下载正版软件？',
  '忘记登录密码怎么办？',
  '电脑蓝屏怎么处理？',
  '如何申请云服务账号？',
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是正版化软件管理平台的智能客服，请问有什么可以帮您？\n\n您可以直接输入问题，或点击下方常见问题快速提问。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await api.post('/public/ai-chat', { message: msg });
      const { reply, matches } = res.data.data;
      setMessages(prev => [...prev, { role: 'assistant', content: reply, matches }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Title level={2} style={{ color: '#1a3a5c', marginBottom: 24 }}>
        <RobotOutlined style={{ marginRight: 8 }} />智能客服
      </Title>

      <Card style={{ height: 500, overflowY: 'auto', marginBottom: 16, background: '#f9fbfd' }} bodyStyle={{ padding: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', marginBottom: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? '#4da6e8' : '#52c41a', color: '#fff', fontSize: 16, flexShrink: 0,
              margin: msg.role === 'user' ? '0 0 0 12px' : '0 12px 0 0',
            }}>
              {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
            </div>
            <div style={{
              background: msg.role === 'user' ? '#e8f4fd' : '#fff',
              padding: '12px 16px', borderRadius: 12, maxWidth: '75%', lineHeight: 1.6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
              {msg.matches && msg.matches.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {msg.matches.map(m => (
                    <Tag key={m.id} color="blue" style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => sendMessage(m.question)}>{m.question}</Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', padding: 12 }}><Spin tip="正在思考..." /></div>
        )}
        <div ref={bottomRef} />
      </Card>

      <Space wrap style={{ marginBottom: 12 }}>
        {quickQuestions.map(q => (
          <Tag key={q} color="blue" style={{ cursor: 'pointer', padding: '4px 12px' }}
            onClick={() => sendMessage(q)}>{q}</Tag>
        ))}
      </Space>

      <div style={{ display: 'flex', gap: 8 }}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={() => sendMessage()} loading={loading}
          style={{ height: 'auto' }}>发送</Button>
      </div>
    </div>
  );
}
