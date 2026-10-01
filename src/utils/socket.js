import { io } from 'socket.io-client';

// Connect via current origin or proxy port
const socket = io('/', {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export default socket;
