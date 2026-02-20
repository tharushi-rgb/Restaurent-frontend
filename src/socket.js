import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
  }
  return socket;
}

export function joinTableRoom(tableNumber) {
  const s = getSocket();
  s.emit('join-table', { tableNumber });
}

export function joinKitchenRoom() {
  const s = getSocket();
  s.emit('join-kitchen');
}

export function joinAdminRoom() {
  const s = getSocket();
  s.emit('join-admin');
}

export default getSocket;
