export class Scoreboard {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const el = document.getElementById('scoreboard');
    if (!el) return;
    
    el.classList.remove('hidden');
    this.isOpen = true;
    this.render();
  }

  close() {
    const el = document.getElementById('scoreboard');
    if (!el) return;
    
    el.classList.add('hidden');
    this.isOpen = false;
  }

  render() {
    const gameState = this.gameEngine.gameState;
    if (!gameState) return;
    
    // Update header
    const mapEl = document.getElementById('scoreboard-map');
    const atkScoreEl = document.getElementById('scoreboard-atk');
    const defScoreEl = document.getElementById('scoreboard-def');
    const roundEl = document.getElementById('scoreboard-round');
    
    if (mapEl) mapEl.textContent = (gameState.map || 'ASCENT').toUpperCase();
    if (atkScoreEl) atkScoreEl.textContent = gameState.score?.atk || 0;
    if (defScoreEl) defScoreEl.textContent = gameState.score?.def || 0;
    if (roundEl) roundEl.textContent = gameState.round || 1;
    
    // Render teams
    this.renderTeam('atk', gameState.players);
    this.renderTeam('def', gameState.players);
  }

  renderTeam(team, players) {
    const tbody = document.querySelector(`#scoreboard-${team}-team tbody`);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const teamPlayers = (players || []).filter(p => p.team === team);
    
    for (const player of teamPlayers) {
      const tr = document.createElement('tr');
      
      const hsPercent = player.kills > 0 
        ? Math.round((player.headshots || 0) / player.kills * 100) 
        : 0;
      
      const acs = Math.round((player.kills * 250 + player.assists * 100) / Math.max(1, player.kills + player.deaths));
      
      tr.innerHTML = `
        <td>${this.getAgentIcon(player.agentId)}</td>
        <td>${player.name}</td>
        <td>${acs}</td>
        <td>${player.kills || 0}</td>
        <td>${player.deaths || 0}</td>
        <td>${player.assists || 0}</td>
        <td>${hsPercent}%</td>
        <td>${player.firstKills || 0}</td>
        <td>${player.credits || 0} ¢</td>
      `;
      
      tbody.appendChild(tr);
    }
  }

  getAgentIcon(agentId) {
    const icons = {
      jett: '⚔', reyna: '👁', phoenix: '🔥', raze: '💣',
      yoru: '🗡', neon: '⚡', sova: '🏹', breach: '💥',
      skye: '🦅', brimstone: '☁', viper: '🐍', omen: '👻',
      sage: '💎', cypher: '📷', killjoy: '🤖'
    };
    return icons[agentId] || '⚔';
  }

  update() {
    if (this.isOpen) {
      this.render();
    }
  }
}
