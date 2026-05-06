export class Crosshair {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.style = 'cross'; // cross, dot, circle
    this.color = '#00ff00';
    this.size = 4;
    this.thickness = 2;
    this.gap = 3;
    
    this.element = document.getElementById('crosshair');
    if (this.element) {
      this.render();
    }
  }

  setStyle(style) {
    this.style = style;
    this.render();
  }

  setColor(color) {
    this.color = color;
    this.render();
  }

  setSize(size) {
    this.size = size;
    this.render();
  }

  setGap(gap) {
    this.gap = gap;
    this.render();
  }

  render() {
    if (!this.element) return;
    
    this.element.innerHTML = '';
    this.element.style.color = this.color;
    
    if (this.style === 'dot') {
      const dot = document.createElement('div');
      dot.className = 'crosshair-dot';
      dot.style.width = `${this.size}px`;
      dot.style.height = `${this.size}px`;
      dot.style.background = this.color;
      this.element.appendChild(dot);
    } else if (this.style === 'circle') {
      const circle = document.createElement('div');
      circle.className = 'crosshair-circle';
      circle.style.width = `${this.size * 4}px`;
      circle.style.height = `${this.size * 4}px`;
      circle.style.borderColor = this.color;
      this.element.appendChild(circle);
    } else {
      // Cross style
      const cross = document.createElement('div');
      cross.className = 'crosshair-cross';
      cross.style.width = `${this.size * 4}px`;
      cross.style.height = `${this.size * 4}px`;
      
      const innerStyle = document.createElement('style');
      innerStyle.textContent = `
        .crosshair-cross::before {
          width: ${this.size * 4}px;
          height: ${this.thickness}px;
          top: ${(this.size * 4 - this.thickness) / 2}px;
          left: 0;
          background: ${this.color};
        }
        .crosshair-cross::after {
          width: ${this.thickness}px;
          height: ${this.size * 4}px;
          top: 0;
          left: ${(this.size * 4 - this.thickness) / 2}px;
          background: ${this.color};
        }
      `;
      
      this.element.appendChild(cross);
      this.element.appendChild(innerStyle);
    }
  }

  update(state) {
    // Dynamic crosshair expansion based on movement/shooting
    if (!state || !this.element) return;
    
    const localPlayer = state.players?.find(p => p.id === this.gameEngine.localPlayerId);
    if (!localPlayer) return;
    
    let scale = 1;
    
    // Expand when moving
    if (localPlayer.moveDir && (localPlayer.moveDir.x !== 0 || localPlayer.moveDir.z !== 0)) {
      scale *= 1.5;
    }
    
    // Expand when in air
    if (localPlayer.pos.y > 0.1) {
      scale *= 1.3;
    }
    
    // Expand when shooting
    if (this.gameEngine.playerController?.mouse.left) {
      scale *= 1.4;
    }
    
    // Contract when crouching
    if (this.gameEngine.playerController?.keys.ctrl) {
      scale *= 0.7;
    }
    
    this.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
}
