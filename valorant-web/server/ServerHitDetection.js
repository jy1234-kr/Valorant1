// Placeholder for ServerHitDetection - hit detection is handled in GameRoom.js
class ServerHitDetection {
  constructor(room) {
    this.room = room;
    this.positionHistory = new Map(); // playerId -> [{tick, pos}, ...]
  }

  storePosition(playerId, pos, tick) {
    if (!this.positionHistory.has(playerId)) {
      this.positionHistory.set(playerId, []);
    }
    
    const history = this.positionHistory.get(playerId);
    history.push({ tick, pos: { ...pos } });
    
    // Keep only last 2 seconds (128 ticks)
    if (history.length > 128) {
      history.shift();
    }
  }

  getPositionAtTick(playerId, tick) {
    const history = this.positionHistory.get(playerId);
    if (!history) return null;
    
    // Find closest position to requested tick
    let closest = null;
    let minDiff = Infinity;
    
    for (const entry of history) {
      const diff = Math.abs(entry.tick - tick);
      if (diff < minDiff) {
        minDiff = diff;
        closest = entry.pos;
      }
    }
    
    return closest;
  }

  checkHit(shooter, victim, weapon, shootTick) {
    // Rewind victim to shootTick position
    const victimPos = this.getPositionAtTick(victim.id, shootTick);
    if (!victimPos) return false;
    
    // Simple distance-based hit check
    const dx = shooter.pos.x - victimPos.x;
    const dz = shooter.pos.z - victimPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    // Hitbox size varies by distance
    const hitboxSize = 1.5;
    
    return dist < hitboxSize;
  }
}

module.exports = ServerHitDetection;
