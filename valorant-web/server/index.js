const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Serve static files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Import game modules
const RoomManager = require('./RoomManager');

const roomManager = new RoomManager(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join room
  socket.on('joinRoom', (data) => {
    const { roomId, playerName, agentId } = data;
    const result = roomManager.joinRoom(socket, roomId, playerName, agentId);
    if (result.success) {
      socket.emit('roomJoined', {
        roomId: result.room.id,
        playerId: socket.id,
        initialState: result.room.getState()
      });
    } else {
      socket.emit('error', { code: 'JOIN_FAILED', message: result.error });
    }
  });

  // Create room
  socket.on('createRoom', (data) => {
    const { roomName, map, maxPlayers } = data;
    const room = roomManager.createRoom(socket, roomName, map, maxPlayers);
    socket.emit('roomJoined', {
      roomId: room.id,
      playerId: socket.id,
      initialState: room.getState()
    });
    broadcastRoomList();
  });

  // Leave room
  socket.on('leaveRoom', () => {
    roomManager.leaveRoom(socket);
    broadcastRoomList();
  });

  // Agent selection
  socket.on('selectAgent', (data) => {
    const { agentId } = data;
    roomManager.selectAgent(socket, agentId);
  });

  // Lock agent
  socket.on('lockAgent', () => {
    roomManager.lockAgent(socket);
  });

  // Game input
  socket.on('input', (data) => {
    roomManager.handleInput(socket, data);
  });

  // Chat message
  socket.on('chatMessage', (data) => {
    const { text } = data;
    roomManager.broadcastChat(socket, text);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    roomManager.leaveRoom(socket);
    broadcastRoomList();
  });
});

// Broadcast room list to all clients
function broadcastRoomList() {
  const roomList = roomManager.getRoomList();
  io.emit('roomList', roomList);
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Game server ready at http://localhost:${PORT}`);
});

module.exports = { app, io, server };
