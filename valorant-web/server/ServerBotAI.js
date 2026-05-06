class ServerBotAI {
  constructor(room) {
    this.room = room;
    this.updateInterval = null;
    this.startUpdateLoop();
  }

  startUpdateLoop() {
    // Update bot AI at 10 Hz (every 100ms)
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
  }

  stopUpdateLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  update() {
    const phase = this.room.roundManager.phase;
    
    if (phase === 'BUY') {
      this.updateBuyPhase();
    } else if (phase === 'ACTION' || phase === 'PLANTED') {
      this.updateCombatPhase();
    }
  }

  updateBuyPhase() {
    for (const bot of this.room.bots.values()) {
      if (!bot.alive) continue;
      
      // Bot buying logic
      if (bot.credits >= 2900) {
        // Buy Vandal or Phantom randomly
        const weapon = Math.random() > 0.5 ? 'vandal' : 'phantom';
        this.room.economy.buyWeapon(bot, weapon);
      } else if (bot.credits >= 1600) {
        this.room.economy.buyWeapon(bot, 'spectre');
      } else if (bot.credits >= 800) {
        this.room.economy.buyWeapon(bot, 'ghost');
      }
      
      // Buy armor
      if (bot.credits >= 1000) {
        this.room.economy.buyArmor(bot, 'heavy_shield');
      } else if (bot.credits >= 400) {
        this.room.economy.buyArmor(bot, 'light_shield');
      }
    }
  }

  updateCombatPhase() {
    for (const bot of this.room.bots.values()) {
      if (!bot.alive) continue;
      
      switch (bot.state) {
        case 'IDLE':
          this.botIdle(bot);
          break;
        case 'PATROL':
          this.botPatrol(bot);
          break;
        case 'ALERT':
          this.botAlert(bot);
          break;
        case 'COMBAT':
          this.botCombat(bot);
          break;
        case 'PLANT':
          this.botPlant(bot);
          break;
        case 'DEFUSE':
          this.botDefuse(bot);
          break;
        case 'RETREAT':
          this.botRetreat(bot);
          break;
      }
    }
  }

  botIdle(bot) {
    // Stay in place, look around
    bot.yaw += (Math.random() - 0.5) * 0.5;
    bot.state = 'PATROL';
  }

  botPatrol(bot) {
    // Move toward random waypoint
    if (!bot.targetPos || this.reachedTarget(bot)) {
      bot.targetPos = this.getRandomWaypoint(bot.team);
    }
    
    this.moveToTarget(bot);
    
    // Randomly check for enemies
    if (Math.random() < 0.1) {
      const enemy = this.findNearestEnemy(bot);
      if (enemy) {
        bot.enemyLastSeen = { ...enemy.pos };
        bot.state = 'ALERT';
      }
    }
  }

  botAlert(bot) {
    // Move toward last known enemy position
    if (!bot.enemyLastSeen) {
      bot.state = 'PATROL';
      return;
    }
    
    const dx = bot.enemyLastSeen.x - bot.pos.x;
    const dz = bot.enemyLastSeen.z - bot.pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 2) {
      // Reached last seen position
      bot.state = 'PATROL';
      return;
    }
    
    this.moveToTarget(bot, bot.enemyLastSeen);
    
    // Check if enemy is actually visible now
    const enemy = this.findNearestEnemy(bot);
    if (enemy && this.hasLineOfSight(bot, enemy)) {
      bot.state = 'COMBAT';
    }
  }

  botCombat(bot) {
    const enemy = this.findNearestEnemy(bot);
    
    if (!enemy || !enemy.alive) {
      bot.state = 'PATROL';
      return;
    }
    
    // Check line of sight
    if (!this.hasLineOfSight(bot, enemy)) {
      bot.state = 'ALERT';
      return;
    }
    
    // Aim at enemy
    const dx = enemy.pos.x - bot.pos.x;
    const dz = enemy.pos.z - bot.pos.z;
    bot.yaw = Math.atan2(dx, dz);
    
    // Strafe left/right
    if (Math.random() < 0.05) {
      bot.strafeDir = Math.random() > 0.5 ? 1 : -1;
    }
    
    // Shoot if enemy in crosshair
    const dist = Math.sqrt(dx * dx + dz * dz);
    const accuracy = this.getBotAccuracy(bot);
    
    if (Math.random() < accuracy && dist < 30) {
      // Fire!
      this.botShoot(bot, enemy);
    }
    
    // Retreat if low HP
    if (bot.hp < 30) {
      bot.state = 'RETREAT';
      return;
    }
    
    // Plant spike if attacker with spike
    if (bot.team === 'atk' && this.room.roundManager.spikeCarrier === bot.id) {
      const site = this.getNearestSite(bot.pos);
      const dToSite = this.distanceTo(bot.pos, site);
      if (dToSite < 5) {
        bot.state = 'PLANT';
      }
    }
    
    // Defuse if defender and spike planted
    if (bot.team === 'def' && this.room.roundManager.spikePlanted) {
      const spikePos = this.room.roundManager.spikePos;
      if (spikePos) {
        const dToSpike = this.distanceTo(bot.pos, spikePos);
        if (dToSpike < 5) {
          bot.state = 'DEFUSE';
        }
      }
    }
  }

  botPlant(bot) {
    const site = this.getNearestSite(bot.pos);
    const dToSite = this.distanceTo(bot.pos, site);
    
    if (dToSite > 3) {
      this.moveToTarget(bot, site);
      return;
    }
    
    // Check for enemies nearby
    const enemy = this.findNearestEnemy(bot);
    if (enemy && this.distanceTo(bot.pos, enemy.pos) < 10) {
      bot.state = 'COMBAT';
      return;
    }
    
    // Plant the spike
    this.room.roundManager.plantSpike(bot, bot.pos);
    bot.state = 'COMBAT';
  }

  botDefuse(bot) {
    const spikePos = this.room.roundManager.spikePos;
    if (!spikePos) {
      bot.state = 'PATROL';
      return;
    }
    
    const dToSpike = this.distanceTo(bot.pos, spikePos);
    
    if (dToSpike > 1.5) {
      this.moveToTarget(bot, spikePos);
      return;
    }
    
    // Check for enemies
    const enemy = this.findNearestEnemy(bot);
    if (enemy && this.distanceTo(bot.pos, enemy.pos) < 10) {
      bot.state = 'COMBAT';
      return;
    }
    
    // Defuse
    if (!bot.isDefusing) {
      this.room.roundManager.defuseSpike(bot);
    }
    
    // Complete defuse after 7 seconds (simulated)
    if (bot.isDefusing) {
      bot.defuseProgress += 0.1;
      if (bot.defuseProgress >= 7) {
        this.room.roundManager.completeDefuse(bot);
      }
    }
  }

  botRetreat(bot) {
    // Move toward spawn
    const spawn = this.getTeamSpawn(bot.team);
    this.moveToTarget(bot, spawn);
    
    if (this.reachedTarget(bot)) {
      bot.state = 'IDLE';
    }
  }

  moveToTarget(bot, target) {
    if (!target) return;
    
    const dx = target.x - bot.pos.x;
    const dz = target.z - bot.pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 0.5) {
      const speed = 5.5 * 0.1; // 10 Hz update
      bot.pos.x += (dx / dist) * speed;
      bot.pos.z += (dz / dist) * speed;
    }
  }

  reachedTarget(bot) {
    if (!bot.targetPos) return true;
    const d = this.distanceTo(bot.pos, bot.targetPos);
    return d < 1;
  }

  getRandomWaypoint(team) {
    // Simple waypoints based on team
    const atkWaypoints = [
      { x: -30, z: -30 }, { x: -20, z: -20 }, { x: -10, z: -10 },
      { x: 0, z: 0 }, { x: -20, z: 0 }, { x: 0, z: -20 }
    ];
    const defWaypoints = [
      { x: 30, z: 30 }, { x: 20, z: 20 }, { x: 10, z: 10 },
      { x: 0, z: 0 }, { x: 20, z: 0 }, { x: 0, z: 20 }
    ];
    
    const waypoints = team === 'atk' ? atkWaypoints : defWaypoints;
    return waypoints[Math.floor(Math.random() * waypoints.length)];
  }

  getTeamSpawn(team) {
    if (team === 'atk') {
      return { x: -40, z: -40 };
    }
    return { x: 40, z: 40 };
  }

  getNearestSite(pos) {
    const sites = [
      { name: 'A', pos: { x: -20, z: -20 } },
      { name: 'B', pos: { x: 20, z: 20 } }
    ];
    
    let nearest = sites[0];
    let minDist = Infinity;
    
    for (const site of sites) {
      const d = this.distanceTo(pos, site.pos);
      if (d < minDist) {
        minDist = d;
        nearest = site;
      }
    }
    
    return nearest.pos;
  }

  findNearestEnemy(bot) {
    let nearest = null;
    let minDist = Infinity;
    
    const enemies = bot.team === 'atk' 
      ? [...this.room.players.values(), ...this.room.bots.values()].filter(e => e.team === 'def' && e.alive)
      : [...this.room.players.values(), ...this.room.bots.values()].filter(e => e.team === 'atk' && e.alive);
    
    for (const enemy of enemies) {
      const d = this.distanceTo(bot.pos, enemy.pos);
      if (d < minDist && d < 50) { // 50 unit vision range
        minDist = d;
        nearest = enemy;
      }
    }
    
    return nearest;
  }

  hasLineOfSight(bot, target) {
    // Simplified LOS check (no actual raycasting in this basic version)
    const d = this.distanceTo(bot.pos, target.pos);
    return d < 30; // Can see within 30 units
  }

  getBotAccuracy(bot) {
    // Difficulty-based accuracy
    const baseAccuracy = 0.7;
    const distanceFactor = 1 - (this.distanceTo(bot.pos, bot.enemyLastSeen || bot.pos) / 50);
    return baseAccuracy * distanceFactor;
  }

  botShoot(bot, enemy) {
    // Simulate shooting
    const hitChance = this.getBotAccuracy(bot);
    const headshotChance = 0.3;
    
    if (Math.random() < hitChance) {
      const isHeadshot = Math.random() < headshotChance;
      const damage = isHeadshot ? 150 : 40;
      
      enemy.hp -= damage;
      
      if (enemy.hp <= 0) {
        enemy.hp = 0;
        enemy.alive = false;
        this.room.roundManager.addKill(bot, enemy, bot.weapon, isHeadshot);
      }
    }
  }

  distanceTo(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

module.exports = ServerBotAI;
