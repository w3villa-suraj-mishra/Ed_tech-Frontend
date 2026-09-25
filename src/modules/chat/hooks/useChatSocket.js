import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import chatSocket from '../sockets/chatSocket';

export function useChatSocket(providedToken = null) {
  const reduxToken = useSelector((state) => state?.auth?.token);
  const token =
    providedToken ||
    reduxToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('adminToken') || localStorage.getItem('token') : null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

  useEffect(() => {
    if (!token) {
      chatSocket.disconnect();
      setConnectionStatus('DISCONNECTED');
      return;
    }

    chatSocket.connect(token);

    const unsubscribe = chatSocket.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, [token]);

  return {
    socket: chatSocket,
    connectionStatus,
    isConnected: connectionStatus === 'CONNECTED' || connectionStatus === 'RECONNECTED'
  };
}

export default useChatSocket;
