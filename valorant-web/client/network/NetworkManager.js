import { io } from 'socket.io-client';

export class NetworkManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.socket = null;
    this.connected = false;
    this.playerId = null;
    this.roomId = null;
    
    this.inputSeq = 0;
    this.inputBuffer = [];
    this.lastConfirmedTick = 0;
    
    this.settings = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:3000', {
          transports: ['websocket'],
          upgrade: false
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.connected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.connected = false;
        });

        this.socket.on('roomJoined', (data) => {
          console.log('Joined room:', data.roomId);
          this.roomId = data.roomId;
          this.playerId = data.playerId;
          this.gameEngine.localPlayerId = data.playerId;
          
          if (data.initialState) {
            this.gameEngine.updateGameState(data.initialState);
          }
        });

        this.socket.on('snapshot', (state) => {
          this.gameEngine.updateGameState(state);
          this.handleSnapshot(state);
        });

        this.socket.on('agentLocked', (data) => {
          console.log('Agent locked:', data);
        });

        this.socket.on('roundStart', (data) => {
          console.log('Round started:', data);
          this.gameEngine.audioSystem.playRoundStart();
        });

        this.socket.on('roundEnd', (data) => {
          console.log('Round ended:', data);
          this.showRoundEndBanner(data);
        });

        this.socket.on('matchEnd', (data) => {
          console.log('Match ended:', data);
          this.showMatchEnd(data);
        });

        this.socket.on('killFeed', (data) => {
          this.gameEngine.hud.addKillToFeed(data);
        });

        this.socket.on('spike_planted', (data) => {
          console.log('Spike planted at:', data.pos);
          this.gameEngine.audioSystem.speak('Spike has been planted');
        });

        this.socket.on('error', (data) => {
          console.error('Server error:', data);
        });

        this.socket.on('roomList', (rooms) => {
          this.gameEngine.uiManager?.updateRoomList(rooms);
        });

      } catch (e) {
        reject(e);
      }
    });
  }

  handleSnapshot(state) {
    // Client-side prediction reconciliation
    if (state.tick > this.lastConfirmedTick) {
      this.lastConfirmedTick = state.tick;
      
      // Remove confirmed inputs from buffer
      const localPlayer = state.players.find(p => p.id === this.playerId);
      if (localPlayer && !localPlayer.isBot) {
        // Reconcile position
        const predictedPos = this.gameEngine.playerController.camera.position;
        const serverPos = localPlayer.pos;
        
        // If significant difference, correct (simple lerp for now)
        const diff = Math.sqrt(
          Math.pow(predictedPos.x - serverPos.x, 2) +
          Math.pow(predictedPos.z - serverPos.z, 2)
        );
        
        if (diff > 0.5) {
          // Snap to server position
          this.gameEngine.playerController.camera.position.set(
            serverPos.x,
            serverPos.y + 1.7,
            serverPos.z
          );
        }
      }
    }
  }

  sendInput() {
    if (!this.connected || !this.socket) return;
    
    const playerController = this.gameEngine.playerController;
    const moveDir = playerController.getMoveDirection();
    
    const input = {
      seq: this.inputSeq++,
      tick: this.gameEngine.gameState?.tick || 0,
      moveDir: moveDir,
      yaw: playerController.yaw,
      pitch: playerController.pitch,
      shoot: playerController.mouse.left,
      reload: false,
      jump: playerController.keys.space,
      crouch: playerController.keys.ctrl,
      useAbility: null,
      interact: playerController.keys.f,
      buyWeapon: null
    };
    
    // Store in buffer for prediction
    this.inputBuffer.push(input);
    if (this.inputBuffer.length > 128) {
      this.inputBuffer.shift();
    }
    
    this.socket.emit('input', input);
  }

  joinRoom(roomId, playerName, agentId = 'jett') {
    if (!this.socket) return;
    this.socket.emit('joinRoom', { roomId, playerName, agentId });
  }

  createRoom(roomName, map, maxPlayers) {
    if (!this.socket) return;
    this.socket.emit('createRoom', { roomName, map, maxPlayers });
  }

  selectAgent(agentId) {
    if (!this.socket) return;
    this.socket.emit('selectAgent', { agentId });
  }

  lockAgent() {
    if (!this.socket) return;
    this.socket.emit('lockAgent');
  }

  leaveRoom() {
    if (!this.socket) return;
    this.socket.emit('leaveRoom');
  }

  showRoundEndBanner(data) {
    const banner = document.getElementById('round-end-banner');
    const text = document.getElementById('round-end-text');
    
    if (banner && text) {
      const isVictory = data.winner === this.gameEngine.gameState?.players.find(p => p.id === this.playerId)?.team;
      banner.className = `banner ${isVictory ? 'victory' : 'defeat'}`;
      text.textContent = isVictory ? 'ROUND WON' : 'ROUND LOST';
      banner.classList.remove('hidden');
      
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 3000);
    }
  }

  showMatchEnd(data) {
    const screen = document.getElementById('match-end-screen');
    const title = document.getElementById('match-end-title');
    const finalAtk = document.getElementById('final-atk');
    const finalDef = document.getElementById('final-def');
    
    if (screen) {
      const isVictory = data.winner === 'atk';
      title.textContent = isVictory ? 'VICTORY' : 'DEFEAT';
      title.style.color = isVictory ? '#4caf50' : '#f44336';
      
      if (finalAtk) finalAtk.textContent = data.finalScore.atk;
      if (finalDef) finalDef.textContent = data.finalScore.def;
      
      screen.classList.remove('hidden');
      
      if (isVictory) {
        this.gameEngine.audioSystem.playVictory();
      } else {
        this.gameEngine.audioSystem.playDefeat();
      }
    }
  }
}
