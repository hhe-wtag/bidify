import { io } from 'socket.io-client';

const socket = io('http://localhost:8080', {
  transports: ['websocket'],
});

// Connection handling
socket.on('connect', () => {
  // Join item room
  const itemId = bidData.itemId;
  socket.emit('join-item', itemId);
});

// Listen for bid updates
socket.on('new-bid', (data) => {
  console.info(data);
});

socket.on('user-joined', (data) => {
  console.info(data);
});

socket.on('user-left', (data) => {
  console.info(data);
});

socket.on('bid-success', (data) => {
  console.info(data);
});

// Test bid placement
const bidData = {
  itemId: '6767a64e39106795c9de77e0',
  bidderId: '65f2d1234a5b6c7d8e9f4567',
  incrementBidAmount: 100,
};
const placeBid = () => {
  socket.emit('place-bid', bidData);
};

// Utility to place bid from terminal
process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'bid') {
    placeBid();
  } else if (data.toString().trim() === 'leave') {
    socket.emit('leave-item', bidData.itemId);
  }
});

console.info(
  "Type following commands to test:\n'bid' to place bid, 'leave' to leave item room"
);
