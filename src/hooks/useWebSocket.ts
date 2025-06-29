import { useState, useEffect, useRef, useCallback } from 'react';
import { startMetric, endMetric } from '../utils/performance/monitor';

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

/**
 * Custom hook for managing WebSocket connections with automatic reconnection,
 * message handling, and performance monitoring.
 */
export const useWebSocket = ({
  url,
  protocols,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  onOpen,
  onClose,
  onError,
  onMessage,
  autoConnect = true,
}: UseWebSocketOptions) => {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectCountRef = useRef(0);
  const metricsIdRef = useRef<string>('');

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      setStatus('connecting');
      metricsIdRef.current = startMetric('websocket-connection', { url });
      
      // Create new WebSocket connection
      socketRef.current = new WebSocket(url, protocols);

      // Setup event handlers
      socketRef.current.onopen = (event) => {
        setStatus('open');
        reconnectCountRef.current = 0;
        endMetric(metricsIdRef.current);
        onOpen?.(event);
      };

      socketRef.current.onclose = (event) => {
        setStatus('closed');
        onClose?.(event);

        // Attempt to reconnect if not closed cleanly and we haven't exceeded max attempts
        if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      socketRef.current.onerror = (event) => {
        setStatus('error');
        onError?.(event);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          const message = {
            type: parsedData.type || 'unknown',
            data: parsedData,
            timestamp: Date.now(),
          };

          setLastMessage(message);
          setMessageHistory((prev) => [...prev.slice(-99), message]);
          onMessage?.(parsedData);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setStatus('error');
    }
  }, [url, protocols, reconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setStatus('closed');
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback(
    (data: any) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        socketRef.current.send(message);
        return true;
      }
      return false;
    },
    []
  );

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    lastMessage,
    messageHistory,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'open',
  };
};
