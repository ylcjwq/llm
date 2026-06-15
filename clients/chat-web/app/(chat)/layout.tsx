'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { ChatSidebar } from '@/components/chat/sidebar';
import { TaskSseProvider } from '@/components/providers/TaskSseProvider';
import { NotificationDrawer } from '@/components/notifications/NotificationPanel';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchSessions } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 鉴权 + 加载会话列表
  useEffect(() => {
    console.log('[ChatLayout] 认证检查:', { mounted, isAuthenticated, username: user?.username, status: user?.status });
    if (!mounted) return;
    if (!isAuthenticated) {
      console.log('[ChatLayout] 未认证，重定向到登录页');
      router.replace('/login');
      return;
    }
    if (user?.status === 'PENDING') {
      console.log('[ChatLayout] 用户状态为 PENDING，重定向到审核页');
      router.replace('/pending');
      return;
    }
    // 已登录，加载会话列表
    console.log('[ChatLayout] 认证通过，加载会话列表');
    fetchSessions();
  }, [mounted, isAuthenticated, user, router, fetchSessions]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div style={{ color: 'var(--muted)' }}>加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.status === 'PENDING') return null;

  return (
    <TaskSseProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--app-shell)' }}>
        <ChatSidebar />
        <main className="flex-1 flex flex-col overflow-hidden px-3 py-3">
          <div
            className="flex-1 overflow-hidden rounded-lg"
            style={{
              backgroundColor: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            {children}
          </div>
        </main>
      </div>
      <NotificationDrawer />
    </TaskSseProvider>
  );
}
