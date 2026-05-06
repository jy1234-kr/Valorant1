class ServerEconomy {
  constructor(room) {
    this.room = room;
  }

  startRound(roundNumber) {
    // Starting credits for round 1
    const startingCredits = roundNumber === 1 ? 800 : 0;
    
    for (const player of this.room.players.values()) {
      if (roundNumber === 1) {
        player.credits = startingCredits;
      }
      // Reset ability charges
      player.abilities = { C: 0, Q: 0, E: false, X: 0 };
    }
    
    for (const bot of this.room.bots.values()) {
      if (roundNumber === 1) {
        bot.credits = startingCredits;
      }
      bot.abilities = { C: 0, Q: 0, E: false, X: 0 };
    }
  }

  buyWeapon(entity, weaponId) {
    const WEAPONS = this.getWeaponData();
    const weapon = WEAPONS[weaponId];
    
    if (!weapon || !entity.alive) return false;
    if (this.room.phase !== 'BUY') return false;
    if (entity.credits < weapon.price) return false;
    
    // Check if already owned
    if (entity.weapon === weaponId) return false;
    
    // Deduct credits
    entity.credits -= weapon.price;
    
    // Equip weapon
    entity.weapon = weaponId;
    entity.ammo = {
      clip: weapon.magSize,
      reserve: weapon.reserve
    };
    
    return true;
  }

  buyArmor(entity, armorType) {
    if (this.room.phase !== 'BUY') return false;
    if (!entity.alive) return false;
    
    const armorPrices = {
      light_shield: 400,
      heavy_shield: 1000
    };
    
    const price = armorPrices[armorType];
    if (!price || entity.credits < price) return false;
    
    // Can't downgrade
    if (armorType === 'light_shield' && entity.armor >= 50) return false;
    if (armorType === 'heavy_shield' && entity.armor >= 100) return false;
    
    entity.credits -= price;
    
    if (armorType === 'light_shield') {
      entity.armor = 50;
    } else if (armorType === 'heavy_shield') {
      entity.armor = 100;
    }
    
    return true;
  }

  buyAbility(entity, abilityKey) {
    if (this.room.phase !== 'BUY') return false;
    if (!entity.alive) return false;
    
    // Ability costs vary by agent
    // Simplified: C=200, Q=200-400, E=0-300, X=ultimate points
    const costs = {
      C: 200,
      Q: 300,
      E: 0,
      X: 7 // Ultimate points, not credits
    };
    
    const cost = costs[abilityKey];
    if (!cost || entity.credits < cost) return false;
    
    // Check max charges
    const maxCharges = {
      C: 2,
      Q: 2,
      E: 2,
      X: 1
    };
    
    if (entity.abilities[abilityKey] >= maxCharges[abilityKey]) return false;
    
    entity.credits -= cost;
    entity.abilities[abilityKey]++;
    
    return true;
  }

  getWeaponData() {
    return {
      // Sidearms
      classic: { price: 0, magSize: 12, reserve: 36, fireRate: 6.75, damage: { head: 78, body: 26, legs: 22 } },
      shorty: { price: 200, magSize: 2, reserve: 6, fireRate: 3.3, damage: { head: 36, body: 12, legs: 10 } },
      frenzy: { price: 450, magSize: 13, reserve: 39, fireRate: 13, damage: { head: 78, body: 26, legs: 22 } },
      ghost: { price: 500, magSize: 15, reserve: 45, fireRate: 6.75, damage: { head: 105, body: 30, legs: 25 } },
      sheriff: { price: 800, magSize: 6, reserve: 24, fireRate: 4, damage: { head: 160, body: 55, legs: 46 } },
      
      // SMGs
      stinger: { price: 1100, magSize: 20, reserve: 60, fireRate: 18, damage: { head: 67, body: 27, legs: 23 } },
      spectre: { price: 1600, magSize: 30, reserve: 90, fireRate: 13.33, damage: { head: 78, body: 26, legs: 22 } },
      
      // Shotguns
      bucky: { price: 900, magSize: 5, reserve: 15, fireRate: 1.1, damage: { head: 34, body: 34, legs: 29 } },
      judge: { price: 1850, magSize: 7, reserve: 21, fireRate: 3.5, damage: { head: 34, body: 34, legs: 29 } },
      
      // Rifles
      bulldog: { price: 2050, magSize: 24, reserve: 72, fireRate: 9.15, damage: { head: 116, body: 35, legs: 30 } },
      guardian: { price: 2250, magSize: 12, reserve: 36, fireRate: 5.25, damage: { head: 195, body: 65, legs: 49 } },
      phantom: { price: 2900, magSize: 30, reserve: 90, fireRate: 11, damage: { head: 156, body: 39, legs: 33 } },
      vandal: { price: 2900, magSize: 25, reserve: 75, fireRate: 9.75, damage: { head: 160, body: 40, legs: 34 } },
      
      // Snipers
      marshal: { price: 1100, magSize: 5, reserve: 20, fireRate: 1.5, damage: { head: 202, body: 101, legs: 85 } },
      operator: { price: 4700, magSize: 5, reserve: 20, fireRate: 0.75, damage: { head: 255, body: 150, legs: 127 } },
      
      // LMGs
      ares: { price: 1600, magSize: 50, reserve: 100, fireRate: 13, damage: { head: 72, body: 30, legs: 25 } },
      odin: { price: 3200, magSize: 100, reserve: 200, fireRate: 12, damage: { head: 95, body: 38, legs: 32 } }
    };
  }
}

module.exports = ServerEconomy;
