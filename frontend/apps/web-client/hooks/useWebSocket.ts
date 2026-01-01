import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp?: number;
}

export interface WebSocketOptions {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    onMessage?: (message: WebSocketMessage) => void;
}

export interface UseWebSocketReturn {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    sendMessage: (message: WebSocketMessage) => void;
    lastMessage: WebSocketMessage | null;
    reconnect: () => void;
}

/**
 * Custom hook for WebSocket connections with auto-reconnect
 * Handles connection lifecycle, message sending/receiving, and error recovery
 */
export function useWebSocket(
    url: string | null,
    options: WebSocketOptions = {}
): UseWebSocketReturn {
    const {
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        onOpen,
        onClose,
        onError,
        onMessage,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true);

    const connect = useCallback(() => {
        if (!url || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {

                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                reconnectAttemptsRef.current = 0;
                onOpen?.();
            };

            ws.onclose = () => {

                setIsConnected(false);
                setIsConnecting(false);
                wsRef.current = null;
                onClose?.();

                // Auto-reconnect if enabled and not exceeded max attempts
                if (
                    shouldReconnectRef.current &&
                    reconnectAttemptsRef.current < maxReconnectAttempts
                ) {
                    reconnectAttemptsRef.current += 1;


                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval) as unknown as NodeJS.Timeout;
                }
            };

            ws.onerror = (event) => {
                console.error('[WebSocket] Error:', event);
                setError('WebSocket connection error');
                setIsConnecting(false);
                onError?.(event);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    setLastMessage(message);
                    onMessage?.(message);
                } catch (err) {
                    console.error('[WebSocket] Failed to parse message:', err);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('[WebSocket] Connection failed:', err);
            setError('Failed to establish WebSocket connection');
            setIsConnecting(false);
        }
    }, [url, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onError, onMessage]);

    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify(message));

            } catch (err) {
                console.error('[WebSocket] Failed to send message:', err);
                setError('Failed to send message');
            }
        } else {
            console.warn('[WebSocket] Cannot send message - not connected');
            setError('WebSocket not connected');
        }
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        shouldReconnectRef.current = true;
        reconnectAttemptsRef.current = 0;
        setTimeout(() => connect(), 100);
    }, [connect, disconnect]);

    // Connect on mount or when URL changes
    useEffect(() => {
        if (url) {
            shouldReconnectRef.current = true;
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url, connect, disconnect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            shouldReconnectRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return {
        isConnected,
        isConnecting,
        error,
        sendMessage,
        lastMessage,
        reconnect,
    };
}
