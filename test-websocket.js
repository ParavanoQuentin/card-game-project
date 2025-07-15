const io = require('socket.io-client');

console.log('Testing WebSocket connection to http://localhost:3001');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('WebSocket connection successful!');
  console.log('Socket ID:', socket.id);
  console.log('Transport:', socket.io.engine.transport.name);
  socket.disconnect();
  setTimeout(() => process.exit(0), 100);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection failed');
  console.error('Error message:', error.message);
  console.error('Error type:', error.type);
  console.error('Error description:', error.description);
  console.error('Full error:', error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server. Reason:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 10 seconds');
  console.log('This might indicate a firewall or network issue');
  process.exit(1);
}, 10000);

console.log('⏳ Waiting for connection...');
