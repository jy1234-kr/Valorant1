export const WEAPONS = {
  // Sidearms
  classic: { 
    price: 0, magSize: 12, reserve: 36, fireRate: 6.75, 
    damage: { head: 78, body: 26, legs: 22 }, 
    reloadTime: 1.75, auto: false, spread: 0.25, ads: 0.1 
  },
  shorty: { 
    price: 200, magSize: 2, reserve: 6, fireRate: 3.3, 
    damage: { head: 36, body: 12, legs: 10 }, 
    reloadTime: 1.75, pellets: 15 
  },
  frenzy: { 
    price: 450, magSize: 13, reserve: 39, fireRate: 13, 
    damage: { head: 78, body: 26, legs: 22 }, 
    reloadTime: 1.6, auto: true 
  },
  ghost: { 
    price: 500, magSize: 15, reserve: 45, fireRate: 6.75, 
    damage: { head: 105, body: 30, legs: 25 }, 
    reloadTime: 1.5, silenced: true 
  },
  sheriff: { 
    price: 800, magSize: 6, reserve: 24, fireRate: 4, 
    damage: { head: 160, body: 55, legs: 46 }, 
    reloadTime: 2.5 
  },
  
  // SMGs
  stinger: { 
    price: 1100, magSize: 20, reserve: 60, fireRate: 18, 
    damage: { head: 67, body: 27, legs: 23 }, 
    reloadTime: 2.25, auto: true 
  },
  spectre: { 
    price: 1600, magSize: 30, reserve: 90, fireRate: 13.33, 
    damage: { head: 78, body: 26, legs: 22 }, 
    reloadTime: 2.25, silenced: true, auto: true 
  },
  
  // Shotguns
  bucky: { 
    price: 900, magSize: 5, reserve: 15, fireRate: 1.1, 
    damage: { head: 34, body: 34, legs: 29 }, 
    reloadTime: 2.5, pellets: 15 
  },
  judge: { 
    price: 1850, magSize: 7, reserve: 21, fireRate: 3.5, 
    damage: { head: 34, body: 34, legs: 29 }, 
    reloadTime: 2.25, pellets: 12, auto: true 
  },
  
  // Rifles
  bulldog: { 
    price: 2050, magSize: 24, reserve: 72, fireRate: 9.15, 
    damage: { head: 116, body: 35, legs: 30 }, 
    reloadTime: 2.5, burstFire: 3 
  },
  guardian: { 
    price: 2250, magSize: 12, reserve: 36, fireRate: 5.25, 
    damage: { head: 195, body: 65, legs: 49 }, 
    reloadTime: 2.5, semi: true 
  },
  phantom: { 
    price: 2900, magSize: 30, reserve: 90, fireRate: 11, 
    damage: { head: 156, body: 39, legs: 33 }, 
    reloadTime: 2.5, silenced: true,
    falloff: { start: 15, end: 30 }
  },
  vandal: { 
    price: 2900, magSize: 25, reserve: 75, fireRate: 9.75, 
    damage: { head: 160, body: 40, legs: 34 }, 
    reloadTime: 2.5, noFalloff: true 
  },
  
  // Snipers
  marshal: { 
    price: 1100, magSize: 5, reserve: 20, fireRate: 1.5, 
    damage: { head: 202, body: 101, legs: 85 }, 
    reloadTime: 2.5, boltAction: true 
  },
  operator: { 
    price: 4700, magSize: 5, reserve: 20, fireRate: 0.75, 
    damage: { head: 255, body: 150, legs: 127 }, 
    reloadTime: 3.7, boltAction: true, scopeZoom: 5 
  },
  
  // LMGs
  ares: { 
    price: 1600, magSize: 50, reserve: 100, fireRate: 13, 
    damage: { head: 72, body: 30, legs: 25 }, 
    reloadTime: 3.25, spinUp: true, spinUpTime: 0.75 
  },
  odin: { 
    price: 3200, magSize: 100, reserve: 200, fireRate: 12, 
    damage: { head: 95, body: 38, legs: 32 }, 
    reloadTime: 5.0, spinUp: true, spinUpTime: 1.0 
  }
};

export const ARMOR = {
  light_shield: { price: 400, armor: 25, maxArmor: 50 },
  heavy_shield: { price: 1000, armor: 50, maxArmor: 100 }
};

export const AGENTS = [
  // Duelists
  { id: 'jett', name: 'Jett', role: 'duelist', color: '#7ec8e3' },
  { id: 'reyna', name: 'Reyna', role: 'duelist', color: '#c9a6d9' },
  { id: 'phoenix', name: 'Phoenix', role: 'duelist', color: '#e67e22' },
  { id: 'raze', name: 'Raze', role: 'duelist', color: '#e67e22' },
  { id: 'yoru', name: 'Yoru', role: 'duelist', color: '#2e5c8a' },
  { id: 'neon', name: 'Neon', role: 'duelist', color: '#00ffff' },
  { id: 'iso', name: 'Iso', role: 'duelist', color: '#00ff88' },
  
  // Initiators
  { id: 'sova', name: 'Sova', role: 'initiator', color: '#4a6fa5' },
  { id: 'breach', name: 'Breach', role: 'initiator', color: '#e67e22' },
  { id: 'skye', name: 'Skye', role: 'initiator', color: '#2ecc71' },
  { id: 'kayo', name: 'KAY/O', role: 'initiator', color: '#3498db' },
  { id: 'fade', name: 'Fade', role: 'initiator', color: '#8e44ad' },
  { id: 'gekko', name: 'Gekko', role: 'initiator', color: '#27ae60' },
  
  // Controllers
  { id: 'brimstone', name: 'Brimstone', role: 'controller', color: '#34495e' },
  { id: 'viper', name: 'Viper', role: 'controller', color: '#27ae60' },
  { id: 'omen', name: 'Omen', role: 'controller', color: '#34495e' },
  { id: 'astra', name: 'Astra', role: 'controller', color: '#9b59b6' },
  { id: 'harbor', name: 'Harbor', role: 'controller', color: '#3498db' },
  { id: 'clove', name: 'Clove', role: 'controller', color: '#8e44ad' },
  
  // Sentinels
  { id: 'sage', name: 'Sage', role: 'sentinel', color: '#3498db' },
  { id: 'cypher', name: 'Cypher', role: 'sentinel', color: '#f1c40f' },
  { id: 'killjoy', name: 'Killjoy', role: 'sentinel', color: '#f39c12' },
  { id: 'chamber', name: 'Chamber', role: 'sentinel', color: '#34495e' },
  { id: 'deadlock', name: 'Deadlock', role: 'sentinel', color: '#3498db' },
  { id: 'vyse', name: 'Vyse', role: 'sentinel', color: '#9b59b6' }
];
