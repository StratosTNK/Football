import { io } from 'socket.io-client';

// Only attempt real socket connection in local development
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let socket;

if (isLocal) {
  socket = io('/', {
    autoConnect: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    timeout: 3000
  });
} else {
  // Safe stub for serverless production environment
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {}
  };
}

export default socket;
