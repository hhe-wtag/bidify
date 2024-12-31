import { io } from 'socket.io-client';

// Test bid placement
const bidData = {
  itemId: '6767a64e39106795c9de77e0',
  bidderId: '65f2d1234a5b6c7d8e9f4567',
  incrementBidAmount: 100,
};

const socket = io('http://localhost:8080', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  const itemId = bidData.itemId;
  socket.emit('join-item', itemId);
});

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

const placeBid = () => {
  socket.emit('place-bid', bidData);
};

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'bid') {
    placeBid();
  } else if (data.toString().trim() === 'join') {
    socket.emit('join-item', bidData.itemId);
  } else if (data.toString().trim() === 'leave') {
    socket.emit('leave-item', bidData.itemId);
  }
});

console.info(
  "Type following commands to test:\n'bid' to place bid, 'join' to join item room, 'leave' to leave item room"
);
