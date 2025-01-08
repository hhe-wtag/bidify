import { io } from 'socket.io-client';

// Test bid placement
const bidData = {
  itemId: '677bc2285f62f8fa4cd2a49c',
  bidderId: '677df8209aa593f7f000f556',
  incrementBidAmount: 100,
};

const socket = io('http://localhost:8080', {
  auth: {
    token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2RmODIwOWFhNTkzZjdmMDAwZjU1NiIsImVtYWlsIjoibWFyeUBlbWFpbC5jb20iLCJpYXQiOjE3MzYzMTQyOTgsImV4cCI6MTczNjQwMDY5OH0.L2uZA9kLK1DgB2nr0T1cumDpd4hT7DmDvE9MxnGinX4',
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
