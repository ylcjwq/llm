/**
 * AI 聊天容器 - 管理聊天历史和用户交互
 */
'use client';

import { useState } from 'react';
import type { AIUIResponse, UIAction } from './types';
import { ComponentRenderer } from './ComponentRenderer';
import { sendChatMessage } from '@/api';

interface Message {
  role: 'user' | 'ai';
  content: string | AIUIResponse;
}

interface Props {
  sessionId: string;
}

export function AIChatContainer({ sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: {
        components: [
          {
            type: 'text',
            content: '欢迎使用 Autix AI 需求分析助理，请描述你的需求，或点击下方常用功能。',
          },
        ],
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage({ sessionId, input: text });
      setMessages((prev) => [...prev, { role: 'ai', content: data }]);
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: UIAction) => {
    setLoading(true);
    try {
      const data = await sendChatMessage({ sessionId, action });
      setMessages((prev) => [...prev, { role: 'ai', content: data }]);
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.role === 'user' ? 'text-right' : ''}`}>
            {msg.role === 'user' ? (
              <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
                {msg.content as string}
              </div>
            ) : (
              <div className="space-y-3">
                {(msg.content as AIUIResponse).components.map((component, i) => (
                  <ComponentRenderer key={i} component={component} onAction={handleAction} />
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">处理中...</div>}
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
