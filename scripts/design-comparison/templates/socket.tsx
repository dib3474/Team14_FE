import type { ReactNode } from 'react';
const callbacks = new Map();
const socket = {
  clientRef: { current: { connected: true } },
  subscriptionsRef: { current: [] },
  connectWebSocket: async () => {},
  subscribe: (topic, cb) => {
    callbacks.set(topic, cb);
  },
  unsubscribe: (topic) => {
    callbacks.delete(topic);
  },
  disconnect: () => {},
  getUnsubscribedChatRoomId: () => null,
  send: () => {},
};
export const WebSocketProvider = ({ children }: { children: ReactNode }) => children;
export const useWebSocket = () => socket;
export const STOMP_CONFIG = {
  RECONNECT_DELAY_MS: 5000,
  HEARTBEAT_INCOMING_MS: 15000,
  HEARTBEAT_OUTGOING_MS: 15000,
  CONNECTION_TIMEOUT_MS: 30000,
};
