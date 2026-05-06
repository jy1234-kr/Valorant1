export const AGENT_DATA = {
  jett: {
    id: 'jett',
    name: 'Jett',
    role: 'duelist',
    color: '#7ec8e3',
    abilities: {
      C: { name: 'Cloudburst', cost: 200, charges: 3, cooldown: 0 },
      Q: { name: 'Updraft', cost: 150, charges: 2, cooldown: 0 },
      E: { name: 'Tailwind', cost: 0, charges: 2, cooldown: 0 },
      X: { name: 'Blade Storm', cost: 7, charges: 1 }
    }
  },
  reyna: {
    id: 'reyna',
    name: 'Reyna',
    role: 'duelist',
    color: '#c9a6d9',
    abilities: {
      C: { name: 'Leer', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'Devour', cost: 100, charges: 4, cooldown: 0 },
      E: { name: 'Dismiss', cost: 100, charges: 4, cooldown: 0 },
      X: { name: 'Empress', cost: 7, charges: 1 }
    }
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    role: 'duelist',
    color: '#e67e22',
    abilities: {
      C: { name: 'Curveball', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'Blaze', cost: 250, charges: 1, cooldown: 0 },
      E: { name: 'Hot Hands', cost: 0, charges: 1, cooldown: 30 },
      X: { name: 'Run It Back', cost: 7, charges: 1 }
    }
  },
  raze: {
    id: 'raze',
    name: 'Raze',
    role: 'duelist',
    color: '#e67e22',
    abilities: {
      C: { name: 'Boom Bot', cost: 200, charges: 1, cooldown: 0 },
      Q: { name: 'Blast Pack', cost: 100, charges: 2, cooldown: 0 },
      E: { name: 'Paint Shells', cost: 0, charges: 1, cooldown: 35 },
      X: { name: 'Showstopper', cost: 8, charges: 1 }
    }
  },
  yoru: {
    id: 'yoru',
    name: 'Yoru',
    role: 'duelist',
    color: '#2e5c8a',
    abilities: {
      C: { name: 'Fakeout', cost: 100, charges: 2, cooldown: 0 },
      Q: { name: 'Gatecrash', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'Blindside', cost: 250, charges: 2, cooldown: 0 },
      X: { name: 'Dimensional Drift', cost: 7, charges: 1 }
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    role: 'duelist',
    color: '#00ffff',
    abilities: {
      C: { name: 'Fast Lane', cost: 300, charges: 1, cooldown: 0 },
      Q: { name: 'Relay Bolt', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'High Gear', cost: 0, charges: 1, cooldown: 0 },
      X: { name: 'Overdrive', cost: 7, charges: 1 }
    }
  },
  iso: {
    id: 'iso',
    name: 'Iso',
    role: 'duelist',
    color: '#00ff88',
    abilities: {
      C: { name: 'Contingency', cost: 300, charges: 1, cooldown: 0 },
      Q: { name: 'Undercut', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'Double Tap', cost: 0, charges: 1, cooldown: 0 },
      X: { name: 'Kill Contract', cost: 7, charges: 1 }
    }
  },
  sova: {
    id: 'sova',
    name: 'Sova',
    role: 'initiator',
    color: '#4a6fa5',
    abilities: {
      C: { name: 'Shock Bolt', cost: 150, charges: 2, cooldown: 0 },
      Q: { name: 'Owl Drone', cost: 400, charges: 1, cooldown: 0 },
      E: { name: 'Recon Bolt', cost: 0, charges: 1, cooldown: 40 },
      X: { name: "Hunter's Fury", cost: 7, charges: 1 }
    }
  },
  breach: {
    id: 'breach',
    name: 'Breach',
    role: 'initiator',
    color: '#e67e22',
    abilities: {
      C: { name: 'Aftershock', cost: 100, charges: 1, cooldown: 0 },
      Q: { name: 'Flashpoint', cost: 250, charges: 2, cooldown: 0 },
      E: { name: 'Fault Line', cost: 0, charges: 1, cooldown: 35 },
      X: { name: 'Rolling Thunder', cost: 7, charges: 1 }
    }
  },
  skye: {
    id: 'skye',
    name: 'Skye',
    role: 'initiator',
    color: '#2ecc71',
    abilities: {
      C: { name: 'Regrowth', cost: 200, charges: 1, cooldown: 0 },
      Q: { name: 'Trailblazer', cost: 300, charges: 1, cooldown: 0 },
      E: { name: 'Guiding Light', cost: 250, charges: 3, cooldown: 0 },
      X: { name: 'Seekers', cost: 7, charges: 1 }
    }
  },
  kayo: {
    id: 'kayo',
    name: 'KAY/O',
    role: 'initiator',
    color: '#3498db',
    abilities: {
      C: { name: 'FRAG/ment', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'FLASH/drive', cost: 250, charges: 2, cooldown: 0 },
      E: { name: 'ZERO/point', cost: 0, charges: 1, cooldown: 40 },
      X: { name: 'NULL/cmd', cost: 7, charges: 1 }
    }
  },
  fade: {
    id: 'fade',
    name: 'Fade',
    role: 'initiator',
    color: '#8e44ad',
    abilities: {
      C: { name: 'Seize', cost: 300, charges: 2, cooldown: 0 },
      Q: { name: 'Haunt', cost: 200, charges: 1, cooldown: 0 },
      E: { name: 'Prowler', cost: 0, charges: 1, cooldown: 25 },
      X: { name: 'Nightfall', cost: 7, charges: 1 }
    }
  },
  gekko: {
    id: 'gekko',
    name: 'Gekko',
    role: 'initiator',
    color: '#27ae60',
    abilities: {
      C: { name: 'Wingman', cost: 500, charges: 1, cooldown: 0 },
      Q: { name: 'Dizzy', cost: 400, charges: 2, cooldown: 0 },
      E: { name: 'Mosh Pit', cost: 300, charges: 1, cooldown: 0 },
      X: { name: 'Thrash', cost: 7, charges: 1 }
    }
  },
  brimstone: {
    id: 'brimstone',
    name: 'Brimstone',
    role: 'controller',
    color: '#34495e',
    abilities: {
      C: { name: 'Incendiary', cost: 250, charges: 1, cooldown: 0 },
      Q: { name: 'Sky Smoke', cost: 100, charges: 3, cooldown: 0 },
      E: { name: 'Stim Beacon', cost: 200, charges: 2, cooldown: 0 },
      X: { name: 'Orbital Strike', cost: 7, charges: 1 }
    }
  },
  viper: {
    id: 'viper',
    name: 'Viper',
    role: 'controller',
    color: '#27ae60',
    abilities: {
      C: { name: 'Snake Bite', cost: 200, charges: 3, cooldown: 0 },
      Q: { name: 'Poison Cloud', cost: 200, charges: 1, cooldown: 0 },
      E: { name: 'Toxic Screen', cost: 0, charges: 1, cooldown: 0 },
      X: { name: "Viper's Pit", cost: 7, charges: 1 }
    }
  },
  omen: {
    id: 'omen',
    name: 'Omen',
    role: 'controller',
    color: '#34495e',
    abilities: {
      C: { name: 'Shrouded Step', cost: 150, charges: 2, cooldown: 0 },
      Q: { name: 'Paranoia', cost: 300, charges: 2, cooldown: 0 },
      E: { name: 'Dark Cover', cost: 300, charges: 3, cooldown: 0 },
      X: { name: 'From the Shadows', cost: 7, charges: 1 }
    }
  },
  astra: {
    id: 'astra',
    name: 'Astra',
    role: 'controller',
    color: '#9b59b6',
    abilities: {
      C: { name: 'Gravity Well', cost: 0, charges: 4, cooldown: 0 },
      Q: { name: 'Nova Pulse', cost: 0, charges: 4, cooldown: 0 },
      E: { name: 'Nebula', cost: 0, charges: 5, cooldown: 0 },
      X: { name: 'Cosmic Divide', cost: 7, charges: 1 }
    }
  },
  harbor: {
    id: 'harbor',
    name: 'Harbor',
    role: 'controller',
    color: '#3498db',
    abilities: {
      C: { name: 'Cove', cost: 300, charges: 2, cooldown: 0 },
      Q: { name: 'High Tide', cost: 300, charges: 1, cooldown: 0 },
      E: { name: 'Cascade', cost: 0, charges: 1, cooldown: 30 },
      X: { name: 'Reckoning', cost: 7, charges: 1 }
    }
  },
  clove: {
    id: 'clove',
    name: 'Clove',
    role: 'controller',
    color: '#8e44ad',
    abilities: {
      C: { name: 'Pick-Me-Up', cost: 100, charges: 4, cooldown: 0 },
      Q: { name: 'Meddle', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'Ruse', cost: 0, charges: 2, cooldown: 0 },
      X: { name: 'Not Dead Yet', cost: 6, charges: 1 }
    }
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    role: 'sentinel',
    color: '#3498db',
    abilities: {
      C: { name: 'Barrier Orb', cost: 400, charges: 1, cooldown: 0 },
      Q: { name: 'Slow Orb', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'Healing Orb', cost: 0, charges: 1, cooldown: 45 },
      X: { name: 'Resurrection', cost: 8, charges: 1 }
    }
  },
  cypher: {
    id: 'cypher',
    name: 'Cypher',
    role: 'sentinel',
    color: '#f1c40f',
    abilities: {
      C: { name: 'Trapwire', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'Cyber Cage', cost: 100, charges: 2, cooldown: 0 },
      E: { name: 'Spycam', cost: 0, charges: 1, cooldown: 30 },
      X: { name: 'Neural Theft', cost: 7, charges: 1 }
    }
  },
  killjoy: {
    id: 'killjoy',
    name: 'Killjoy',
    role: 'sentinel',
    color: '#f39c12',
    abilities: {
      C: { name: 'Nanoswarm', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'Alarmbot', cost: 200, charges: 1, cooldown: 0 },
      E: { name: 'Turret', cost: 0, charges: 1, cooldown: 20 },
      X: { name: 'Lockdown', cost: 7, charges: 1 }
    }
  },
  chamber: {
    id: 'chamber',
    name: 'Chamber',
    role: 'sentinel',
    color: '#34495e',
    abilities: {
      C: { name: 'Trademark', cost: 200, charges: 2, cooldown: 0 },
      Q: { name: 'Headhunter', cost: 100, charges: 10, cooldown: 0 },
      E: { name: 'Rendezvous', cost: 0, charges: 2, cooldown: 0 },
      X: { name: 'Tour de Force', cost: 7, charges: 1 }
    }
  },
  deadlock: {
    id: 'deadlock',
    name: 'Deadlock',
    role: 'sentinel',
    color: '#3498db',
    abilities: {
      C: { name: 'Barrier Mesh', cost: 400, charges: 1, cooldown: 0 },
      Q: { name: 'Sonic Sensor', cost: 200, charges: 2, cooldown: 0 },
      E: { name: 'GravNet', cost: 0, charges: 1, cooldown: 40 },
      X: { name: 'Annihilation', cost: 7, charges: 1 }
    }
  },
  vyse: {
    id: 'vyse',
    name: 'Vyse',
    role: 'sentinel',
    color: '#9b59b6',
    abilities: {
      C: { name: 'Razorvine', cost: 300, charges: 2, cooldown: 0 },
      Q: { name: 'Arc Rose', cost: 250, charges: 2, cooldown: 0 },
      E: { name: 'Shear', cost: 0, charges: 1, cooldown: 35 },
      X: { name: 'Steel Garden', cost: 7, charges: 1 }
    }
  }
};
