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
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2RmODIwOWFhNTkzZjdmMDAwZjU1NiIsImVtYWlsIjoibWFyeUBlbWFpbC5jb20iLCJpYXQiOjE3MzYzOTgwNjAsImV4cCI6MTczNjQ4NDQ2MH0.e7yXEU1YkQZV63nugfLDu8FsIHeCl5nQzV8KPpj5fqo',
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  const itemId = bidData.itemId;
  socket.emit('join-item-room', itemId);
});

socket.on('user-joined-item-room', (data) => {
  console.info(data);
});

socket.on('user-left-item-room', (data) => {
  console.info(data);
});

socket.on('new-bid', (data) => {
  console.info(data);
});

socket.on('place-bid-result', (data) => {
  console.info(data);
});

const placeBid = () => {
  socket.emit('place-bid', bidData);
};

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'bid') {
    placeBid();
  } else if (data.toString().trim() === 'join') {
    socket.emit('join-item-room', bidData.itemId);
  } else if (data.toString().trim() === 'leave') {
    socket.emit('leave-item-room', bidData.itemId);
  }
});

console.info(
  "Type following commands to test:\n'join' to join item room, 'leave' to leave item room"
);
