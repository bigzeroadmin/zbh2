import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Input, Button, Typography, Spin, Tag, Space, List, Modal, message } from 'antd';
import { RobotOutlined, SendOutlined, UserOutlined, PlusOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';

const { Title, Text } = Typography;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
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
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/public/ai-chat/conversations');
      setConversations(res.data.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const startNewChat = () => {
    setMessages([{ role: 'assistant', content: '您好！我是正版化软件管理平台的智能客服，请问有什么可以帮您？' }]);
    setConversationId(null);
  };

  const loadConversation = async (id: number) => {
    try {
      const res = await api.get(`/public/ai-chat/conversations/${id}/messages`);
      const msgs = res.data.data || [];
      setMessages(msgs.map((m: any) => ({ role: m.role, content: m.content })));
      setConversationId(id);
      setShowHistory(false);
    } catch {
      message.error('加载对话失败');
    }
  };

  const deleteConversation = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.delete(`/public/ai-chat/conversations/${id}`);
      if (conversationId === id) startNewChat();
      loadConversations();
      message.success('对话已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    // Use functional updates to avoid stale state
    let assistantIdx = -1;
    setMessages(prev => {
      const withUser = [...prev, { role: 'user' as const, content: msg }];
      assistantIdx = withUser.length;
      return [...withUser, { role: 'assistant' as const, content: '' }];
    });
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/public/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversationId }),
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      // Check if response is SSE stream
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullReply = '';
        let newConvId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                fullReply = parsed.error;
                setMessages(prev => {
                  const updated = [...prev];
                  if (assistantIdx >= 0 && assistantIdx < updated.length) {
                    updated[assistantIdx] = { role: 'assistant', content: fullReply };
                  }
                  return updated;
                });
              } else if (parsed.content) {
                fullReply += parsed.content;
                const currentReply = fullReply;
                setMessages(prev => {
                  const updated = [...prev];
                  if (assistantIdx >= 0 && assistantIdx < updated.length) {
                    updated[assistantIdx] = { role: 'assistant', content: currentReply };
                  }
                  return updated;
                });
              }
              if (parsed.conversationId) {
                newConvId = parsed.conversationId;
              }
              if (parsed.done) {
                setConversationId(newConvId);
                loadConversations();
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        if (!fullReply) {
          setMessages(prev => {
            const updated = [...prev];
            if (assistantIdx >= 0 && assistantIdx < updated.length) {
              updated[assistantIdx] = { role: 'assistant', content: '抱歉，未收到回复，请稍后重试。' };
            }
            return updated;
          });
        }
      } else {
        // Non-streaming JSON response (FAQ fallback mode)
        const result = await response.json();
        if (result.success && result.data) {
          const reply = result.data.reply;
          setMessages(prev => {
            const updated = [...prev];
            if (assistantIdx >= 0 && assistantIdx < updated.length) {
              updated[assistantIdx] = { role: 'assistant', content: reply };
            }
            return updated;
          });
        } else {
          setMessages(prev => {
            const updated = [...prev];
            if (assistantIdx >= 0 && assistantIdx < updated.length) {
              updated[assistantIdx] = { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后重试。' };
            }
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          if (assistantIdx >= 0 && assistantIdx < updated.length) {
            updated[assistantIdx] = { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后重试。' };
          }
          return updated;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1a3a5c', margin: 0 }}>
          <RobotOutlined style={{ marginRight: 8 }} />智能客服
        </Title>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => { loadConversations(); setShowHistory(true); }}>历史对话</Button>
          <Button icon={<PlusOutlined />} onClick={startNewChat}>新对话</Button>
        </Space>
      </div>

      <Card style={{ height: 520, overflowY: 'auto', marginBottom: 16, background: '#f9fbfd' }} bodyStyle={{ padding: 16 }}>
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
              {msg.content ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <Spin size="small" />}
            </div>
          </div>
        ))}
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
          disabled={loading}
        />
        {loading ? (
          <Button danger onClick={stopGeneration} style={{ height: 'auto' }}>停止</Button>
        ) : (
          <Button type="primary" icon={<SendOutlined />} onClick={() => sendMessage()} style={{ height: 'auto' }}>发送</Button>
        )}
      </div>

      <Modal title="历史对话" open={showHistory} onCancel={() => setShowHistory(false)} footer={null} width={500}>
        <List
          dataSource={conversations}
          locale={{ emptyText: '暂无历史对话' }}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: conversationId === item.id ? '#e8f4fd' : 'transparent' }}
              onClick={() => loadConversation(item.id)}
              actions={[
                <Button key="del" type="text" danger icon={<DeleteOutlined />} size="small"
                  onClick={(e) => deleteConversation(item.id, e)} />,
              ]}
            >
              <List.Item.Meta
                title={<Text style={{ fontSize: 14 }}>{item.title}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.updatedAt).toLocaleString()}</Text>}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
