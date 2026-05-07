export class BulletSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
  }

  fire(origin, direction, weapon) {
    // Perform raycast
    const hit = this.raycast(origin, direction);
    
    if (hit.hit && hit.entity) {
      this.applyDamage(hit.entity, weapon, hit.isHeadshot);
    }
    
    return hit;
  }

  raycast(origin, direction, maxDistance = 100) {
    const gameState = this.gameEngine.gameState;
    if (!gameState) return { hit: false };
    
    let closestHit = null;
    let minDist = maxDistance;
    
    // Check against all players
    for (const player of gameState.players) {
      if (player.id === this.gameEngine.localPlayerId) continue;
      if (!player.alive) continue;
      
      const toPlayer = new THREE.Vector3(
        player.pos.x - origin.x,
        player.pos.y + 1.7 - origin.y,
        player.pos.z - origin.z
      );
      
      const dist = toPlayer.length();
      
      if (dist > maxDistance) continue;
      
      toPlayer.normalize();
      const dot = direction.dot(toPlayer);
      
      // Hit threshold based on distance
      const threshold = 0.95 - (dist / maxDistance) * 0.1;
      
      if (dot > threshold && dist < minDist) {
        minDist = dist;
        const isHeadshot = (player.pos.y + 1.7) > (origin.y + 1.5);
        closestHit = {
          hit: true,
          entity: player,
          distance: dist,
          isHeadshot: isHeadshot,
          point: new THREE.Vector3(
            origin.x + direction.x * dist,
            origin.y + direction.y * dist,
            origin.z + direction.z * dist
          )
        };
      }
    }
    
    return closestHit || { hit: false };
  }

  applyDamage(entity, weapon, isHeadshot) {
    let damage = isHeadshot ? weapon.damage.head : weapon.damage.body;
    
    // Armor reduction
    if (entity.armor > 0) {
      const armorReduction = 0.7; // Armor absorbs 30%
      const armorDamage = damage * (1 - armorReduction);
      entity.armor -= armorDamage;
      if (entity.armor < 0) {
        damage += entity.armor; // Remaining damage goes to HP
        entity.armor = 0;
      } else {
        damage *= armorReduction;
      }
    }
    
    entity.hp -= damage;
    
    if (entity.hp <= 0) {
      entity.hp = 0;
      entity.alive = false;
    }
    
    return damage;
  }
}

// Need THREE for Vector3
import * as THREE from 'three';
