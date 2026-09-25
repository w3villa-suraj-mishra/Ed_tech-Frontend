import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { BASE_URL } from '../../../services/apis';

class ChatSocketManager {
  constructor() {
    this.socket = null;
    this.currentToken = null;
    this.isConnected = false;
    this.listeners = new Map(); // event -> Set of callbacks
    this.statusListeners = new Set();
  }

  connect(token) {
    if (!token) return null;

    if (this.socket && this.currentToken === token && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    const backendUrl = process.env.REACT_APP_BASE_URL || BASE_URL || 'http://localhost:5000';

    this.socket = io(backendUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this._notifyStatus('CONNECTED');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this._notifyStatus('DISCONNECTED');
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      this._notifyStatus('ERROR');
    });

    this.socket.io.on('reconnect_attempt', () => {
      this._notifyStatus('RECONNECTING');
    });

    this.socket.io.on('reconnect', () => {
      this.isConnected = true;
      this._notifyStatus('RECONNECTED');
    });

    // Reattach registered event listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket.on(event, cb);
      });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentToken = null;
      this._notifyStatus('DISCONNECTED');
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    // Immediately notify current status
    callback(this.isConnected ? 'CONNECTED' : 'DISCONNECTED');
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  _notifyStatus(status) {
    this.statusListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {}
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, { conversationId });
    }
  }

  sendSocketMessage(data, ack) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.MESSAGE_SEND, data, ack);
    }
  }

  startTyping(conversationId, userName) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId, userName });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
    }
  }

  markConversationRead(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId });
    }
  }
}

export const chatSocket = new ChatSocketManager();
export default chatSocket;
