import { io } from 'socket.io-client';

// Test bid placement
const bidData = {
  itemId: '6774d0494189d93277eeb4c7',
  bidderId: '67639eba3b9a81d69741beab',
  incrementBidAmount: 100,
};

const socket = io('http://localhost:8080', {
  auth: {
    token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWVjZjc4ZDUyOWI2ZTNkNTFjNjAzMyIsImVtYWlsIjoiYWJjZGVAZ21haWwuY29tIiwiaWF0IjoxNzM1NzA4NzA1LCJleHAiOjE3MzU3OTUxMDV9.YI1g1DgsHDj7M8dGXWcZHisYc8Ah5nlFKuAXElNgQJM',
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  const itemId = bidData.itemId;
  socket.emit('join-item', itemId);
});

socket.on('user-joined', (data) => {
  console.info(data);
});

socket.on('user-left', (data) => {
  console.info(data);
});

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'join') {
    socket.emit('join-item', bidData.itemId);
  } else if (data.toString().trim() === 'leave') {
    socket.emit('leave-item', bidData.itemId);
  }
});

console.info(
  "Type following commands to test:\n'join' to join item room, 'leave' to leave item room"
);
