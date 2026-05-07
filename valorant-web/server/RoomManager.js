const GameRoom = require('./GameRoom');

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.playerRooms = new Map(); // socketId -> roomId
    this.nextRoomId = 1;
  }

  createRoom(hostSocket, roomName, map, maxPlayers) {
    const roomId = `room_${this.nextRoomId++}`;
    const room = new GameRoom(this.io, roomId, roomName, map, maxPlayers, hostSocket.id);
    this.rooms.set(roomId, room);
    this.playerRooms.set(hostSocket.id, roomId);
    
    // Add host to room
    room.addPlayer(hostSocket.id, 'Host', null);
    
    console.log(`Room created: ${roomId} by ${hostSocket.id}`);
    return room;
  }

  joinRoom(socket, roomId, playerName, agentId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }
    
    if (room.isFull()) {
      return { success: false, error: 'Room is full' };
    }
    
    if (room.phase !== 'WAITING' && room.phase !== 'AGENT_SELECT') {
      return { success: false, error: 'Game already in progress' };
    }
    
    room.addPlayer(socket.id, playerName, agentId);
    this.playerRooms.set(socket.id, roomId);
    
    // Send room state to joining player
    socket.emit('roomJoined', {
      roomId: room.id,
      playerId: socket.id,
      initialState: room.getState()
    });
    
    // Notify other players
    room.broadcastExcept(socket.id, 'playerJoined', {
      playerId: socket.id,
      playerName
    });
    
    console.log(`${socket.id} joined room ${roomId}`);
    return { success: true, room };
  }

  leaveRoom(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.removePlayer(socket.id);
      
      // Remove empty rooms
      if (room.players.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} removed (empty)`);
      }
    }
    
    this.playerRooms.delete(socket.id);
    console.log(`${socket.id} left room ${roomId}`);
  }

  selectAgent(socket, agentId) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.selectAgent(socket.id, agentId);
    }
  }

  lockAgent(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.lockAgent(socket.id);
    }
  }

  handleInput(socket, inputData) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.processInput(socket.id, inputData);
    }
  }

  broadcastChat(socket, text) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;
    
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.get(socket.id);
      room.broadcast('chatMessage', {
        playerId: socket.id,
        playerName: player ? player.name : 'Unknown',
        text
      });
    }
  }

  getRoomList() {
    const list = [];
    for (const [id, room] of this.rooms) {
      if (room.phase === 'WAITING' || room.phase === 'AGENT_SELECT') {
        list.push({
          id: room.id,
          name: room.name,
          map: room.map,
          players: room.players.size,
          maxPlayers: room.maxPlayers,
          phase: room.phase
        });
      }
    }
    return list;
  }

  getRoomByPlayer(socketId) {
    const roomId = this.playerRooms.get(socketId);
    return roomId ? this.rooms.get(roomId) : null;
  }
}

module.exports = RoomManager;
