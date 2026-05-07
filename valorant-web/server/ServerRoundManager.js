class ServerRoundManager {
  constructor(room) {
    this.room = room;
    this.currentRound = 1;
    this.timer = 30; // Buy phase starts at 30s
    this.phase = 'BUY';
    this.score = { atk: 0, def: 0 };
    this.spikePlanted = false;
    this.spikeTimer = null;
    this.spikePos = null;
    this.spikeCarrier = null;
    this.recentKills = [];
    this.effects = [];
    this.halfNumber = 1;
    this.lossBonus = { atk: 0, def: 0 };
  }

  update() {
    const dt = 1 / 64; // Delta time per tick
    
    if (this.phase === 'BUY') {
      this.updateBuyPhase(dt);
    } else if (this.phase === 'ACTION') {
      this.updateActionPhase(dt);
    } else if (this.phase === 'PLANTED') {
      this.updatePlantedPhase(dt);
    } else if (this.phase === 'POST_ROUND') {
      this.updatePostRound(dt);
    }
    
    // Clean up old effects
    this.effects = this.effects.filter(e => e.ttl > 0);
    for (const effect of this.effects) {
      effect.ttl -= dt;
    }
    
    // Clean up old kills (keep last 5)
    if (this.recentKills.length > 5) {
      this.recentKills.shift();
    }
  }

  updateBuyPhase(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.startActionPhase();
    }
  }

  updateActionPhase(dt) {
    this.timer -= dt;
    
    // Check win conditions
    const atkAlive = this.getAliveCount('atk');
    const defAlive = this.getAliveCount('def');
    
    if (atkAlive === 0) {
      this.endRound('def', 'elimination');
      return;
    }
    
    if (defAlive === 0) {
      this.endRound('atk', 'elimination');
      return;
    }
    
    if (this.timer <= 0) {
      // Time ran out - defenders win unless spike is planted
      if (!this.spikePlanted) {
        this.endRound('def', 'time');
      }
      return;
    }
  }

  updatePlantedPhase(dt) {
    if (this.spikeTimer !== null) {
      this.spikeTimer -= dt;
      
      if (this.spikeTimer <= 0) {
        // Spike exploded
        this.endRound('atk', 'explosion');
        return;
      }
    }
    
    // Check if all defenders are dead
    const defAlive = this.getAliveCount('def');
    if (defAlive === 0) {
      // Wait for detonation
      return;
    }
  }

  updatePostRound(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.startNextRound();
    }
  }

  getAliveCount(team) {
    let count = 0;
    for (const player of this.room.players.values()) {
      if (player.team === team && player.alive) count++;
    }
    for (const bot of this.room.bots.values()) {
      if (bot.team === team && bot.alive) count++;
    }
    return count;
  }

  startActionPhase() {
    this.phase = 'ACTION';
    this.timer = 100; // 1:40
    
    // Assign spike to random attacker
    const attackers = [...this.room.teams.atk];
    if (attackers.length > 0) {
      const carrierId = attackers[Math.floor(Math.random() * attackers.length)];
      this.spikeCarrier = carrierId;
    }
    
    this.room.broadcast('roundStart', {
      round: this.currentRound,
      attackers: this.room.teams.atk,
      defenders: this.room.teams.def,
      phase: 'action',
      timer: this.timer
    });
  }

  plantSpike(entity, pos) {
    if (this.phase !== 'ACTION') return false;
    if (entity.team !== 'atk') return false;
    if (!entity.alive) return false;
    if (this.spikeCarrier !== entity.id) return false;
    
    this.spikePlanted = true;
    this.spikePos = { ...pos };
    this.spikeTimer = 45;
    this.phase = 'PLANTED';
    this.spikeCarrier = null;
    
    this.room.broadcast('spike_planted', {
      pos: this.spikePos,
      planter: entity.id
    });
    
    return true;
  }

  defuseSpike(entity) {
    if (this.phase !== 'PLANTED') return false;
    if (entity.team !== 'def') return false;
    if (!entity.alive) return false;
    
    // Check distance to spike
    if (!this.spikePos) return false;
    const dx = entity.pos.x - this.spikePos.x;
    const dz = entity.pos.z - this.spikePos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 1.5) return false;
    
    // Start defuse (7 seconds)
    entity.isDefusing = true;
    entity.defuseProgress = 0;
    
    return true;
  }

  completeDefuse(entity) {
    if (!entity.isDefusing) return;
    entity.isDefusing = false;
    
    this.spikePlanted = false;
    this.spikeTimer = null;
    
    this.endRound('def', 'defuse');
  }

  endRound(winner, reason) {
    this.phase = 'POST_ROUND';
    this.timer = 7;
    
    // Update score
    if (winner === 'atk') {
      this.score.atk++;
    } else {
      this.score.def++;
    }
    
    // Calculate economy rewards
    this.calculateEconomyRewards(winner, reason);
    
    // Record kill in recent kills
    // (kills are added during the round)
    
    this.room.broadcast('roundEnd', {
      winner,
      reason,
      score: this.score,
      round: this.currentRound
    });
    
    // Check for match end
    if (this.score.atk >= 13 || this.score.def >= 13) {
      setTimeout(() => this.endMatch(), 2000);
    }
  }

  calculateEconomyRewards(winner, reason) {
    const winReward = 3000;
    const lossBase = 1900;
    const lossBonusIncrement = 500;
    const maxLossBonus = 2900;
    const killReward = 200;
    
    // Winners get win reward
    const winningTeam = winner === 'atk' ? this.room.teams.atk : this.room.teams.def;
    const losingTeam = winner === 'atk' ? this.room.teams.def : this.room.teams.atk;
    
    for (const id of winningTeam) {
      const player = this.room.players.get(id) || this.room.bots.get(id);
      if (player) {
        player.credits += winReward;
        // Kill rewards already added during round
      }
    }
    
    // Losers get loss bonus (stacks)
    const losingSide = winner === 'atk' ? 'def' : 'atk';
    this.lossBonus[losingSide] = Math.min(
      maxLossBonus,
      (this.lossBonus[losingSide] || lossBase) + lossBonusIncrement
    );
    
    for (const id of losingTeam) {
      const player = this.room.players.get(id) || this.room.bots.get(id);
      if (player) {
        player.credits += this.lossBonus[losingSide];
      }
    }
    
    // Reset winner's loss bonus
    const winningSide = winner === 'atk' ? 'atk' : 'def';
    this.lossBonus[winningSide] = 0;
  }

  startNextRound() {
    this.currentRound++;
    
    // Check for halftime
    if (this.currentRound === 13) {
      this.halfNumber = 2;
      // Switch sides
      const temp = this.room.teams.atk;
      this.room.teams.atk = this.room.teams.def;
      this.room.teams.def = temp;
      
      // Update player teams
      for (const player of this.room.players.values()) {
        player.team = player.team === 'atk' ? 'def' : 'atk';
      }
      for (const bot of this.room.bots.values()) {
        bot.team = bot.team === 'atk' ? 'def' : 'atk';
      }
      
      this.room.broadcast('halftime', {
        score: this.score
      });
    }
    
    // Check for overtime
    if (this.currentRound > 24 && this.score.atk === this.score.def) {
      // Overtime - sudden death
      this.room.broadcast('overtime', {
        score: this.score
      });
    }
    
    // Reset for new round
    this.phase = 'BUY';
    this.timer = 30;
    this.spikePlanted = false;
    this.spikeTimer = null;
    this.spikePos = null;
    this.spikeCarrier = null;
    this.recentKills = [];
    this.effects = [];
    
    // Reset players
    for (const player of this.room.players.values()) {
      player.hp = 100;
      player.alive = true;
      player.ammo = { clip: 12, reserve: 36 };
      player.isDefusing = false;
    }
    for (const bot of this.room.bots.values()) {
      bot.hp = 100;
      bot.alive = true;
      bot.ammo = { clip: 12, reserve: 36 };
      bot.isDefusing = false;
    }
    
    // Set spawn positions
    this.room.setSpawnPositions();
    
    // Start buy phase
    this.room.economy.startRound(this.currentRound);
    
    this.room.broadcast('roundStart', {
      round: this.currentRound,
      attackers: this.room.teams.atk,
      defenders: this.room.teams.def,
      phase: 'buy',
      timer: 30
    });
  }

  endMatch() {
    this.room.phase = 'MATCH_END';
    this.room.stopGameLoop();
    
    const winner = this.score.atk >= 13 ? 'atk' : 'def';
    
    this.room.broadcast('matchEnd', {
      winner,
      finalScore: this.score,
      stats: this.getMatchStats()
    });
  }

  getMatchStats() {
    const stats = [];
    for (const player of this.room.players.values()) {
      stats.push({
        id: player.id,
        name: player.name,
        agentId: player.agentId,
        team: player.team,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        firstKills: player.firstKills
      });
    }
    return stats;
  }

  addKill(killer, victim, weapon, headshot) {
    const killEntry = {
      killer: killer.id,
      killerName: killer.name,
      victim: victim.id,
      victimName: victim.name,
      weapon,
      headshot,
      tick: this.room.tick
    };
    
    this.recentKills.push(killEntry);
    
    // Update stats
    killer.kills++;
    victim.deaths++;
    
    // First kill of round
    if (this.recentKills.length === 1) {
      killer.firstKills++;
    }
    
    // Add kill reward
    killer.credits += 200;
    
    this.room.broadcast('killFeed', killEntry);
  }
}

module.exports = ServerRoundManager;
