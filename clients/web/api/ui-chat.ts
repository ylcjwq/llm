/**
 * UI Chat 接口
 */
import { apiRequest } from './client';
import type { AIUIResponse, UIAction } from '@/components/ai-ui/types';

export interface ChatRequest {
  sessionId: string;
  input?: string;
  action?: UIAction;
}

export async function sendChatMessage(request: ChatRequest): Promise<AIUIResponse> {
  return apiRequest<AIUIResponse>('/api/ui-chat/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
