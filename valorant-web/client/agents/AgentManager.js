import { AGENTS } from '../weapons/WeaponData.js';

export class AgentManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentAgent = null;
    this.abilities = {
      C: { charges: 0, maxCharges: 2, cooldown: 0 },
      Q: { charges: 0, maxCharges: 2, cooldown: 0 },
      E: { active: false, cooldown: 0 },
      X: { points: 0, ready: false }
    };
  }

  setAgent(agentId) {
    const agent = AGENTS.find(a => a.id === agentId);
    if (agent) {
      this.currentAgent = agent;
      // Initialize abilities based on agent
      this.initializeAbilities(agentId);
    }
  }

  initializeAbilities(agentId) {
    // Default ability setup - will be overridden by specific agents
    this.abilities = {
      C: { charges: 2, maxCharges: 2, cooldown: 0, cost: 200 },
      Q: { charges: 1, maxCharges: 1, cooldown: 0, cost: 300 },
      E: { active: false, cooldown: 0, cost: 0 },
      X: { points: 0, ready: false, cost: 7 }
    };
    
    // Load agent-specific abilities
    this.loadAgentAbilities(agentId);
  }

  loadAgentAbilities(agentId) {
    // This would load specific ability data for each agent
    // For now, using defaults
  }

  useAbility(slot) {
    if (!this.currentAgent) return;
    if (!this.gameEngine.isRunning) return;
    
    const ability = this.abilities[slot];
    if (!ability) return;
    
    // Check if ability is available
    if (slot === 'X') {
      if (!ability.ready || ability.points < 7) return;
      ability.ready = false;
      ability.points = 0;
    } else if (slot === 'E') {
      if (ability.active || ability.cooldown > 0) return;
      ability.active = true;
    } else {
      if (ability.charges <= 0 || ability.cooldown > 0) return;
      ability.charges--;
    }
    
    // Execute ability
    this.executeAbility(slot);
    
    // Send to server
    this.gameEngine.networkManager.socket?.emit('input', {
      useAbility: slot
    });
  }

  executeAbility(slot) {
    // Execute ability effect
    switch (slot) {
      case 'C':
        console.log(`${this.currentAgent.name} used C ability`);
        break;
      case 'Q':
        console.log(`${this.currentAgent.name} used Q ability`);
        break;
      case 'E':
        console.log(`${this.currentAgent.name} used E ability`);
        break;
      case 'X':
        console.log(`${this.currentAgent.name} used ULTIMATE!`);
        this.gameEngine.audioSystem.speak(`${this.currentAgent.name} ultimate ready`);
        break;
    }
  }

  update(delta, gameState) {
    if (!gameState) return;
    
    // Find local player in game state
    const localPlayer = gameState.players.find(p => p.id === this.gameEngine.localPlayerId);
    if (!localPlayer) return;
    
    // Update abilities from server state
    if (localPlayer.abilities) {
      this.abilities.C.charges = localPlayer.abilities.C || 0;
      this.abilities.Q.charges = localPlayer.abilities.Q || 0;
      this.abilities.E.active = localPlayer.abilities.E || false;
      
      // Ultimate points
      if (localPlayer.abilities.X >= 7) {
        this.abilities.X.ready = true;
        this.abilities.X.points = localPlayer.abilities.X;
      }
    }
    
    // Update HUD
    this.updateHUD();
  }

  updateHUD() {
    // Update ability icons in HUD
    const slots = ['C', 'Q', 'E', 'X'];
    
    for (const slot of slots) {
      const ability = this.abilities[slot];
      const nameEl = document.getElementById(`ability-${slot.toLowerCase()}-name`);
      const costEl = document.getElementById(`ability-${slot.toLowerCase()}-cost`);
      const cooldownEl = document.getElementById(`cooldown-${slot.toLowerCase()}`);
      
      if (nameEl) {
        nameEl.textContent = slot === 'X' ? 'ULTIMATE' : `${slot} Ability`;
      }
      
      if (costEl) {
        if (slot === 'X') {
          costEl.textContent = ability.ready ? 'READY' : `${ability.points}/7`;
        } else if (slot === 'E') {
          costEl.textContent = ability.active ? 'ACTIVE' : 'FREE';
        } else {
          costEl.textContent = ability.charges > 0 ? `${ability.charges}/${ability.maxCharges}` : '0';
        }
      }
      
      if (cooldownEl) {
        if (ability.cooldown > 0) {
          const percent = (ability.cooldown / 30) * 100; // Assume 30s max cooldown
          cooldownEl.style.height = `${Math.min(100, percent)}%`;
        } else {
          cooldownEl.style.height = '0%';
        }
      }
    }
  }

  gainUltimatePoints(points) {
    this.abilities.X.points += points;
    if (this.abilities.X.points >= 7) {
      this.abilities.X.ready = true;
      this.gameEngine.audioSystem.speak('Ultimate ready');
    }
  }
}
