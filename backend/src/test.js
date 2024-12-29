import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  transports: ['websocket'],
});

// Connection handling
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);

  // Join auction room
  const itemId = '123';
  socket.emit('join-item', itemId);
  console.log(`Joined auction-${itemId}`);
});

// Listen for bid updates
socket.on('new-bid', (data) => {
  console.log('New bid received:', data);
});

// Test bid placement
const placeBid = () => {
  const bidData = {
    itemId: '123',
    bidAmount: 100,
  };
  socket.emit('place-bid', bidData);
  console.log('Bid placed:', bidData);
};

// Utility to place bid from terminal
process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'bid') {
    placeBid();
  }
});

console.log('Type "bid" and press enter to place a test bid');
