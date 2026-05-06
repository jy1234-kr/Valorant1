import { WEAPONS, ARMOR } from '../weapons/WeaponData.js';

export class BuyMenu {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentCategory = 'rifles';
    this.isOpen = false;
    this.cartTotal = 0;
    
    this.categories = [
      { id: 'sidearms', name: 'Sidearms', weapons: ['classic', 'shorty', 'frenzy', 'ghost', 'sheriff'] },
      { id: 'smgs', name: 'SMGs', weapons: ['stinger', 'spectre'] },
      { id: 'shotguns', name: 'Shotguns', weapons: ['bucky', 'judge'] },
      { id: 'rifles', name: 'Rifles', weapons: ['bulldog', 'guardian', 'phantom', 'vandal'] },
      { id: 'snipers', name: 'Snipers', weapons: ['marshal', 'operator'] },
      { id: 'lmgs', name: 'LMGs', weapons: ['ares', 'odin'] },
      { id: 'shields', name: 'Shields', items: ['light_shield', 'heavy_shield'] },
      { id: 'abilities', name: 'Abilities', abilities: ['C', 'Q', 'E'] }
    ];
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const menuEl = document.getElementById('buy-menu');
    if (!menuEl) return;
    
    menuEl.classList.remove('hidden');
    this.isOpen = true;
    this.render();
  }

  close() {
    const menuEl = document.getElementById('buy-menu');
    if (!menuEl) return;
    
    menuEl.classList.add('hidden');
    this.isOpen = false;
  }

  render() {
    this.renderCategories();
    this.renderWeapons();
    this.updateLoadout();
  }

  renderCategories() {
    const container = document.querySelector('.buy-categories');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const cat of this.categories) {
      const btn = document.createElement('button');
      btn.className = `category-btn ${cat.id === this.currentCategory ? 'active' : ''}`;
      btn.textContent = cat.name;
      btn.dataset.category = cat.id;
      
      btn.addEventListener('click', () => {
        this.currentCategory = cat.id;
        this.render();
      });
      
      container.appendChild(btn);
    }
  }

  renderWeapons() {
    const grid = document.getElementById('weapon-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const category = this.categories.find(c => c.id === this.currentCategory);
    if (!category) return;
    
    const playerCredits = this.getCurrentCredits();
    
    // Render weapons
    if (category.weapons) {
      for (const weaponId of category.weapons) {
        const weapon = WEAPONS[weaponId];
        if (!weapon) continue;
        
        const card = document.createElement('div');
        card.className = 'weapon-card';
        
        const canAfford = playerCredits >= weapon.price;
        const isOwned = this.isWeaponOwned(weaponId);
        
        if (isOwned) {
          card.classList.add('owned');
        } else if (!canAfford) {
          card.classList.add('too-costly');
        }
        
        card.innerHTML = `
          <div class="weapon-silhouette">🔫</div>
          <div class="weapon-name">${weaponId.charAt(0).toUpperCase() + weaponId.slice(1)}</div>
          <div class="weapon-price">${weapon.price} ¢</div>
          <div class="weapon-stats">
            ❤ ${weapon.damage.head} 💨 ${weapon.damage.body} 🦵 ${weapon.damage.legs}
          </div>
          <div class="weapon-stats">
            Mag ${weapon.magSize} · ${weapon.fireRate}/s
          </div>
          <div class="fire-rate-bar">
            <div class="fire-rate-fill" style="width: ${Math.min(100, weapon.fireRate * 5)}%"></div>
          </div>
          <button class="buy-btn" ${!canAfford || isOwned ? 'disabled' : ''}>
            ${isOwned ? 'OWNED' : 'PURCHASE'}
          </button>
        `;
        
        const buyBtn = card.querySelector('.buy-btn');
        if (buyBtn && !isOwned && canAfford) {
          buyBtn.addEventListener('click', () => {
            this.buyItem(weaponId, 'weapon');
          });
        }
        
        grid.appendChild(card);
      }
    }
    
    // Render shields
    if (category.items) {
      for (const itemId of category.items) {
        const item = ARMOR[itemId];
        if (!item) continue;
        
        const card = document.createElement('div');
        card.className = 'weapon-card';
        
        const canAfford = playerCredits >= item.price;
        
        card.innerHTML = `
          <div class="weapon-silhouette">🛡</div>
          <div class="weapon-name">${itemId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div class="weapon-price">${item.price} ¢</div>
          <div class="weapon-stats">
            Armor: ${item.maxArmor}
          </div>
          <button class="buy-btn" ${!canAfford ? 'disabled' : ''}>
            PURCHASE
          </button>
        `;
        
        const buyBtn = card.querySelector('.buy-btn');
        if (buyBtn && canAfford) {
          buyBtn.addEventListener('click', () => {
            this.buyItem(itemId, 'armor');
          });
        }
        
        grid.appendChild(card);
      }
    }
  }

  updateLoadout() {
    const gameState = this.gameEngine.gameState;
    if (!gameState) return;
    
    const localPlayer = gameState.players?.find(p => p.id === this.gameEngine.localPlayerId);
    if (!localPlayer) return;
    
    // Update loadout display
    const primaryEl = document.getElementById('loadout-primary');
    const secondaryEl = document.getElementById('loadout-secondary');
    const armorEl = document.getElementById('loadout-armor');
    const totalEl = document.getElementById('loadout-total');
    
    if (primaryEl) {
      primaryEl.textContent = localPlayer.weapon !== 'classic' ? localPlayer.weapon : 'None';
    }
    if (secondaryEl) {
      secondaryEl.textContent = 'Classic';
    }
    if (armorEl) {
      armorEl.textContent = localPlayer.armor >= 100 ? 'Heavy Shield' : (localPlayer.armor > 0 ? 'Light Shield' : 'None');
    }
    if (totalEl) {
      totalEl.textContent = this.cartTotal;
    }
  }

  getCurrentCredits() {
    const gameState = this.gameEngine.gameState;
    if (!gameState) return 0;
    
    const localPlayer = gameState.players?.find(p => p.id === this.gameEngine.localPlayerId);
    return localPlayer?.credits || 0;
  }

  isWeaponOwned(weaponId) {
    const gameState = this.gameEngine.gameState;
    if (!gameState) return false;
    
    const localPlayer = gameState.players?.find(p => p.id === this.gameEngine.localPlayerId);
    return localPlayer?.weapon === weaponId;
  }

  buyItem(itemId, type) {
    const socket = this.gameEngine.networkManager.socket;
    if (!socket) return;
    
    socket.emit('input', {
      buyWeapon: itemId
    });
    
    // Refresh after purchase
    setTimeout(() => {
      this.render();
    }, 200);
  }
}
