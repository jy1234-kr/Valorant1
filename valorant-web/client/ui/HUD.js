export class HUD {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.killFeed = [];
  }

  update(gameState, localPlayerId) {
    if (!gameState) return;
    
    // Update score
    const atkScoreEl = document.getElementById('score-atk');
    const defScoreEl = document.getElementById('score-def');
    const roundNumEl = document.getElementById('round-num');
    
    if (atkScoreEl) atkScoreEl.textContent = gameState.score?.atk || 0;
    if (defScoreEl) defScoreEl.textContent = gameState.score?.def || 0;
    if (roundNumEl) roundNumEl.textContent = gameState.round || 1;
    
    // Update timer
    const timerEl = document.getElementById('round-timer');
    if (timerEl && gameState.timer !== undefined) {
      const mins = Math.floor(gameState.timer / 60);
      const secs = Math.floor(gameState.timer % 60);
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      if (gameState.timer < 30) {
        timerEl.classList.add('warning');
      } else {
        timerEl.classList.remove('warning');
      }
    }
    
    // Update spike status
    const spikeTextEl = document.getElementById('spike-planted-text');
    const spikeTimerEl = document.getElementById('spike-timer');
    
    if (spikeTextEl && spikeTimerEl) {
      if (gameState.spikePlanted) {
        spikeTextEl.classList.remove('hidden');
        spikeTimerEl.classList.remove('hidden');
        if (gameState.spikeTimer !== undefined) {
          spikeTimerEl.textContent = gameState.spikeTimer.toFixed(1);
        }
      } else {
        spikeTextEl.classList.add('hidden');
        spikeTimerEl.classList.add('hidden');
      }
    }
    
    // Update local player stats
    const localPlayer = gameState.players?.find(p => p.id === localPlayerId);
    if (localPlayer) {
      this.updatePlayerStats(localPlayer);
    }
    
    // Update team panels
    this.updateTeamPanels(gameState, localPlayerId);
  }

  updatePlayerStats(player) {
    // HP
    const hpFillEl = document.getElementById('hp-fill');
    const hpValueEl = document.getElementById('hp-value');
    
    if (hpFillEl) {
      hpFillEl.style.width = `${player.hp}%`;
    }
    if (hpValueEl) {
      hpValueEl.textContent = Math.ceil(player.hp);
    }
    
    // Armor
    const armorEl = document.getElementById('armor-value');
    if (armorEl) {
      armorEl.textContent = player.armor || 0;
    }
    
    // Credits
    const creditsEl = document.getElementById('credits-value');
    const buyCreditsEl = document.getElementById('buy-credits-value');
    
    if (creditsEl) {
      creditsEl.textContent = player.credits || 0;
    }
    if (buyCreditsEl) {
      buyCreditsEl.textContent = player.credits || 0;
    }
  }

  updateTeamPanels(gameState, localPlayerId) {
    const atkPanel = document.getElementById('team-panel-atk');
    const defPanel = document.getElementById('team-panel-def');
    
    if (!atkPanel || !defPanel) return;
    
    atkPanel.innerHTML = '';
    defPanel.innerHTML = '';
    
    for (const player of gameState.players || []) {
      const row = document.createElement('div');
      row.className = `player-row ${!player.alive ? 'dead' : ''}`;
      if (player.id === localPlayerId) {
        row.style.fontWeight = 'bold';
      }
      
      const agentColor = this.getAgentColor(player.agentId);
      
      row.innerHTML = `
        <div class="agent-dot" style="background: ${agentColor}"></div>
        <span class="player-name">${player.name}</span>
        <div class="hp-bar-mini">
          <div class="hp-fill-mini" style="width: ${player.hp}%"></div>
        </div>
        <span class="hp-value-mini">${Math.ceil(player.hp)}</span>
      `;
      
      if (player.team === 'atk') {
        atkPanel.appendChild(row);
      } else {
        defPanel.appendChild(row);
      }
    }
  }

  getAgentColor(agentId) {
    const colors = {
      jett: '#7ec8e3', reyna: '#c9a6d9', phoenix: '#e67e22',
      raze: '#e67e22', yoru: '#2e5c8a', neon: '#00ffff',
      sova: '#4a6fa5', breach: '#e67e22', skye: '#2ecc71',
      brimstone: '#34495e', viper: '#27ae60', omen: '#34495e',
      sage: '#3498db', cypher: '#f1c40f', killjoy: '#f39c12'
    };
    return colors[agentId] || '#888888';
  }

  addKillToFeed(killData) {
    const feedEl = document.getElementById('kill-feed');
    if (!feedEl) return;
    
    const entry = document.createElement('div');
    entry.className = `kill-entry ${killData.headshot ? 'headshot' : ''}`;
    
    entry.innerHTML = `
      <span class="killer">${killData.killerName}</span>
      <span class="weapon">${this.getWeaponIcon(killData.weapon)}</span>
      <span class="victim">${killData.victimName}</span>
    `;
    
    feedEl.appendChild(entry);
    
    // Remove after animation
    setTimeout(() => {
      entry.remove();
    }, 4500);
    
    // Keep only last 5
    while (feedEl.children.length > 5) {
      feedEl.removeChild(feedEl.firstChild);
    }
  }

  getWeaponIcon(weaponId) {
    const icons = {
      vandal: '🔫', phantom: '🔫', operator: '🎯',
      sheriff: '🔫', classic: '🔫', spectre: '🔫',
      marshal: '🎯', ares: '🔫', odin: '🔫'
    };
    return icons[weaponId] || '🔫';
  }
}
