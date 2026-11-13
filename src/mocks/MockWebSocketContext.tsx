import type { ReactNode } from 'react';
import type { Message } from '@stomp/stompjs';
const subscriptions = new Map<string, (message: Message) => void>();
const socket = {
  clientRef: { current: { connected: true } },
  subscriptionsRef: { current: [] },
  connectWebSocket: async () => {},
  subscribe: (destination: string, callback: (message: Message) => void) => {
    subscriptions.set(destination, callback);
  },
  unsubscribe: (destination: string) => {
    subscriptions.delete(destination);
  },
  send: () => {},
  disconnect: () => {
    subscriptions.clear();
  },
  getUnsubscribedChatRoomId: (): number | null => null,
};
export const WebSocketProvider = ({ children }: { children: ReactNode }) => children;
export const useWebSocket = () => socket;
