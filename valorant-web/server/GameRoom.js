const ServerGameLoop = require('./ServerGameLoop');
const ServerRoundManager = require('./ServerRoundManager');
const ServerEconomy = require('./ServerEconomy');
const ServerBotAI = require('./ServerBotAI');

class GameRoom {
  constructor(io, roomId, name, map, maxPlayers, hostId) {
    this.io = io;
    this.id = roomId;
    this.name = name;
    this.map = map;
    this.maxPlayers = maxPlayers;
    this.hostId = hostId;
    
    this.players = new Map(); // socketId -> player data
    this.bots = new Map(); // botId -> bot data
    this.phase = 'WAITING'; // WAITING, AGENT_SELECT, BUY, ACTION, PLANTED, POST_ROUND, MATCH_END
    this.tick = 0;
    
    this.roundManager = new ServerRoundManager(this);
    this.economy = new ServerEconomy(this);
    this.gameLoop = null;
    this.botAI = null;
    
    this.agentSelectTimer = 60;
    this.agentsLocked = new Set();
    this.selectedAgents = new Map(); // socketId -> agentId
    
    // Team assignment
    this.teams = {
      atk: [], // attacker team socketIds
      def: []  // defender team socketIds
    };
  }

  addPlayer(socketId, name, agentId = null) {
    const player = {
      id: socketId,
      name: name || `Player_${socketId.slice(0, 4)}`,
      agentId: agentId,
      team: null,
      pos: { x: 0, y: 1.7, z: 0 },
      yaw: 0,
      pitch: 0,
      hp: 100,
      armor: 0,
      alive: true,
      weapon: 'classic',
      ammo: { clip: 12, reserve: 36 },
      credits: 800,
      abilities: { C: 0, Q: 0, E: false, X: 0 },
      kills: 0,
      deaths: 0,
      assists: 0,
      firstKills: 0,
      inputSeq: 0,
      lastInput: null,
      inputHistory: [] // For lag compensation
    };
    
    this.players.set(socketId, player);
    this.assignTeam(socketId);
    
    return player;
  }

  assignTeam(socketId) {
    const atkCount = this.teams.atk.length;
    const defCount = this.teams.def.length;
    
    if (atkCount <= defCount) {
      this.teams.atk.push(socketId);
      const player = this.players.get(socketId);
      if (player) player.team = 'atk';
    } else {
      this.teams.def.push(socketId);
      const player = this.players.get(socketId);
      if (player) player.team = 'def';
    }
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.teams.atk = this.teams.atk.filter(id => id !== socketId);
    this.teams.def = this.teams.def.filter(id => id !== socketId);
    this.selectedAgents.delete(socketId);
    this.agentsLocked.delete(socketId);
  }

  selectAgent(socketId, agentId) {
    if (this.phase !== 'AGENT_SELECT') return;
    if (this.agentsLocked.has(socketId)) return;
    
    // Check if agent already taken by teammate
    const player = this.players.get(socketId);
    if (!player) return;
    
    const teammates = player.team === 'atk' ? this.teams.atk : this.teams.def;
    for (const tid of teammates) {
      const tp = this.players.get(tid);
      if (tp && tp.agentId === agentId && tid !== socketId) {
        // Agent already taken by teammate
        return;
      }
    }
    
    this.selectedAgents.set(socketId, agentId);
    const p = this.players.get(socketId);
    if (p) p.agentId = agentId;
    
    this.broadcast('agentSelected', {
      playerId: socketId,
      agentId
    });
  }

  lockAgent(socketId) {
    if (this.phase !== 'AGENT_SELECT') return;
    if (!this.selectedAgents.has(socketId)) return;
    
    this.agentsLocked.add(socketId);
    const player = this.players.get(socketId);
    const agentId = this.selectedAgents.get(socketId);
    
    this.broadcast('agentLocked', {
      playerId: socketId,
      agentId
    });
    
    // Check if all players locked
    this.checkAllAgentsLocked();
  }

  checkAllAgentsLocked() {
    const humanPlayers = this.players.size;
    if (this.agentsLocked.size >= humanPlayers) {
      // Assign random agents to any without
      this.assignRandomAgents();
      // Start buy phase
      this.startBuyPhase();
    }
  }

  assignRandomAgents() {
    const allAgents = [
      'jett', 'reyna', 'phoenix', 'raze', 'yoru', 'neon', 'iso',
      'sova', 'breach', 'skye', 'kayo', 'fade', 'gekko',
      'brimstone', 'viper', 'omen', 'astra', 'harbor', 'clove',
      'sage', 'cypher', 'killjoy', 'chamber', 'deadlock', 'vyse'
    ];
    
    for (const [socketId, player] of this.players) {
      if (!player.agentId) {
        const availableAgents = allAgents.filter(a => {
          return !Array.from(this.players.values()).some(p => p.agentId === a);
        });
        const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)] || 'jett';
        player.agentId = randomAgent;
        this.selectedAgents.set(socketId, randomAgent);
      }
    }
  }

  startBuyPhase() {
    this.phase = 'BUY';
    this.assignRandomAgents();
    
    // Initialize economy for round 1
    this.economy.startRound(1);
    
    // Reset player states
    for (const player of this.players.values()) {
      player.hp = 100;
      player.alive = true;
      player.weapon = 'classic';
      player.ammo = { clip: 12, reserve: 36 };
      player.armor = 0;
    }
    
    // Spawn bots if needed
    this.spawnBots();
    
    // Set spawn positions based on map
    this.setSpawnPositions();
    
    this.broadcast('roundStart', {
      round: 1,
      attackers: this.teams.atk,
      defenders: this.teams.def,
      phase: 'buy',
      timer: 30
    });
    
    // Start game loop
    this.startGameLoop();
  }

  spawnBots() {
    const totalSlots = this.maxPlayers;
    const humanCount = this.players.size;
    const botCount = Math.min(totalSlots - humanCount, 9);
    
    const botNames = ['Bot_Alpha', 'Bot_Beta', 'Bot_Gamma', 'Bot_Delta', 
                      'Bot_Echo', 'Bot_Foxtrot', 'Bot_Golf', 'Bot_Hotel', 'Bot_India'];
    
    for (let i = 0; i < botCount; i++) {
      const botId = `bot_${i}`;
      const bot = this.addBot(botId, botNames[i]);
      this.bots.set(botId, bot);
    }
    
    this.botAI = new ServerBotAI(this);
  }

  addBot(botId, name) {
    const isAtk = this.teams.atk.length <= this.teams.def.length;
    const team = isAtk ? 'atk' : 'def';
    
    if (isAtk) {
      this.teams.atk.push(botId);
    } else {
      this.teams.def.push(botId);
    }
    
    const allAgents = [
      'jett', 'reyna', 'phoenix', 'raze', 'yoru', 'neon', 'iso',
      'sova', 'breach', 'skye', 'kayo', 'fade', 'gekko',
      'brimstone', 'viper', 'omen', 'astra', 'harbor', 'clove',
      'sage', 'cypher', 'killjoy', 'chamber', 'deadlock', 'vyse'
    ];
    
    const randomAgent = allAgents[Math.floor(Math.random() * allAgents.length)];
    
    return {
      id: botId,
      name: name,
      agentId: randomAgent,
      team: team,
      pos: { x: 0, y: 1.7, z: 0 },
      yaw: 0,
      pitch: 0,
      hp: 100,
      armor: 50,
      alive: true,
      weapon: 'classic',
      ammo: { clip: 12, reserve: 36 },
      credits: 800,
      abilities: { C: 0, Q: 0, E: false, X: 0 },
      kills: 0,
      deaths: 0,
      assists: 0,
      firstKills: 0,
      state: 'IDLE',
      targetPos: null,
      enemyLastSeen: null,
      reactionTime: 200 + Math.random() * 300
    };
  }

  setSpawnPositions() {
    // Default spawn positions (will be overridden by map)
    const atkSpawns = [
      { x: -40, y: 0, z: -40 },
      { x: -35, y: 0, z: -35 },
      { x: -45, y: 0, z: -35 },
      { x: -40, y: 0, z: -45 },
      { x: -30, y: 0, z: -40 }
    ];
    
    const defSpawns = [
      { x: 40, y: 0, z: 40 },
      { x: 35, y: 0, z: 35 },
      { x: 45, y: 0, z: 35 },
      { x: 40, y: 0, z: 45 },
      { x: 30, y: 0, z: 40 }
    ];
    
    let atkIdx = 0;
    let defIdx = 0;
    
    for (const socketId of this.teams.atk) {
      const entity = this.players.get(socketId) || this.bots.get(socketId);
      if (entity) {
        entity.pos = { ...atkSpawns[atkIdx % atkSpawns.length] };
        atkIdx++;
      }
    }
    
    for (const socketId of this.teams.def) {
      const entity = this.players.get(socketId) || this.bots.get(socketId);
      if (entity) {
        entity.pos = { ...defSpawns[defIdx % defSpawns.length] };
        defIdx++;
      }
    }
  }

  startGameLoop() {
    if (this.gameLoop) return;
    
    // 64 tick per second = 15.625ms
    this.gameLoop = setInterval(() => {
      this.tick++;
      this.update();
    }, 1000 / 64);
  }

  stopGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  update() {
    // Process all pending inputs
    this.processInputs();
    
    // Update bot AI
    if (this.botAI) {
      this.botAI.update();
    }
    
    // Update physics (movement, collisions)
    this.updatePhysics();
    
    // Update round manager
    this.roundManager.update();
    
    // Build and broadcast state snapshot
    this.broadcastState();
  }

  processInput(socketId, inputData) {
    const player = this.players.get(socketId);
    if (!player) return;
    
    // Store input with sequence number
    player.lastInput = {
      ...inputData,
      receivedTick: this.tick
    };
    
    // Store in history for lag compensation (last 2 seconds = 128 ticks)
    player.inputHistory.push({
      seq: inputData.seq,
      tick: this.tick,
      input: inputData
    });
    
    // Keep only last 128 inputs
    if (player.inputHistory.length > 128) {
      player.inputHistory.shift();
    }
  }

  processInputs() {
    for (const player of this.players.values()) {
      if (!player.lastInput) continue;
      
      const input = player.lastInput;
      
      // Apply movement based on input
      if (this.phase === 'ACTION' || this.phase === 'PLANTED') {
        const speed = input.crouch ? 2.5 : 5.5;
        
        if (input.moveDir && (input.moveDir.x !== 0 || input.moveDir.z !== 0)) {
          // Normalize direction
          const len = Math.sqrt(input.moveDir.x ** 2 + input.moveDir.z ** 2);
          if (len > 0) {
            player.pos.x += (input.moveDir.x / len) * speed * 0.016;
            player.pos.z += (input.moveDir.z / len) * speed * 0.016;
          }
        }
        
        // Apply yaw/pitch
        if (input.yaw !== undefined) player.yaw = input.yaw;
        if (input.pitch !== undefined) player.pitch = input.pitch;
        
        // Handle shooting
        if (input.shoot && player.alive) {
          this.handleShooting(player, input);
        }
        
        // Handle ability use
        if (input.useAbility && player.alive) {
          this.handleAbilityUse(player, input.useAbility);
        }
        
        // Handle interact (plant/defuse)
        if (input.interact) {
          this.handleInteract(player);
        }
        
        // Handle buy requests
        if (input.buyWeapon && this.phase === 'BUY') {
          this.economy.buyWeapon(player, input.buyWeapon);
        }
      }
      
      player.lastInput = null;
    }
  }

  handleShooting(player, input) {
    // Will be implemented in ServerHitDetection
    // For now, placeholder
  }

  handleAbilityUse(player, abilityKey) {
    // Will be implemented with ability system
  }

  handleInteract(player) {
    // Spike plant/defuse handled by ServerSpikeSystem
  }

  updatePhysics() {
    // Simple gravity and collision
    for (const player of this.players.values()) {
      if (!player.alive) continue;
      
      // Apply gravity if in air
      if (player.pos.y > 0) {
        player.pos.y -= 9.8 * 0.016;
        if (player.pos.y < 0) {
          player.pos.y = 0;
        }
      }
    }
    
    for (const bot of this.bots.values()) {
      if (!bot.alive) continue;
      
      if (bot.pos.y > 0) {
        bot.pos.y -= 9.8 * 0.016;
        if (bot.pos.y < 0) {
          bot.pos.y = 0;
        }
      }
    }
  }

  broadcastState() {
    const state = this.getState();
    this.broadcast('snapshot', state);
  }

  getState() {
    const players = [];
    
    for (const player of this.players.values()) {
      players.push({
        id: player.id,
        isBot: false,
        name: player.name,
        agentId: player.agentId,
        pos: player.pos,
        yaw: player.yaw,
        pitch: player.pitch,
        hp: player.hp,
        armor: player.armor,
        alive: player.alive,
        weapon: player.weapon,
        ammo: player.ammo,
        credits: player.credits,
        abilities: player.abilities,
        team: player.team,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists
      });
    }
    
    for (const bot of this.bots.values()) {
      players.push({
        id: bot.id,
        isBot: true,
        name: bot.name,
        agentId: bot.agentId,
        pos: bot.pos,
        yaw: bot.yaw,
        pitch: bot.pitch,
        hp: bot.hp,
        armor: bot.armor,
        alive: bot.alive,
        weapon: bot.weapon,
        ammo: bot.ammo,
        credits: bot.credits,
        abilities: bot.abilities,
        team: bot.team,
        kills: bot.kills,
        deaths: bot.deaths,
        assists: bot.assists
      });
    }
    
    return {
      tick: this.tick,
      phase: this.phase,
      timer: this.roundManager.timer,
      spikeTimer: this.roundManager.spikeTimer,
      spikePos: this.roundManager.spikePos,
      spikePlanted: this.roundManager.spikePlanted,
      score: this.roundManager.score,
      round: this.roundManager.currentRound,
      players: players,
      kills: this.roundManager.recentKills,
      effects: this.roundManager.effects
    };
  }

  broadcast(event, data) {
    this.io.to(this.id).emit(event, data);
  }

  broadcastExcept(exceptSocketId, event, data) {
    this.io.to(this.id).except(exceptSocketId).emit(event, data);
  }

  isFull() {
    return this.players.size >= this.maxPlayers;
  }
}

module.exports = GameRoom;
