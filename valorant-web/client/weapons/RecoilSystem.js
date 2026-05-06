export class RecoilSystem {
  constructor() {
    this.patterns = {
      vandal: [
        { x: 0, y: 0.5 },
        { x: 0.1, y: 0.6 },
        { x: 0.15, y: 0.7 },
        { x: 0.2, y: 0.8 },
        { x: 0.25, y: 0.9 },
        { x: 0.3, y: 1.0 },
        { x: 0.35, y: 1.1 }
      ],
      phantom: [
        { x: 0.1, y: 0.4 },
        { x: 0.2, y: 0.5 },
        { x: 0.25, y: 0.6 },
        { x: 0.3, y: 0.7 },
        { x: 0.35, y: 0.8 }
      ],
      bulldog: [
        { x: -0.1, y: 0.4 },
        { x: 0, y: 0.5 },
        { x: 0.1, y: 0.6 }
      ],
      spectre: [
        { x: -0.05, y: 0.3 },
        { x: -0.08, y: 0.35 },
        { x: -0.1, y: 0.4 }
      ],
      operator: [
        { x: 0, y: 0 },
        { x: 0.5, y: 1.0 }
      ]
    };
    
    this.currentPattern = [];
    this.shotIndex = 0;
    this.lastShotTime = 0;
    this.resetTimeout = null;
  }

  startPattern(weaponId) {
    this.currentPattern = this.patterns[weaponId] || [];
    this.shotIndex = 0;
    
    // Reset pattern after 2 seconds of no shooting
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    this.resetTimeout = setTimeout(() => {
      this.reset();
    }, 2000);
  }

  getNextRecoil() {
    if (this.currentPattern.length === 0) {
      return { x: 0, y: 0.3 }; // Default recoil
    }
    
    const recoil = this.currentPattern[this.shotIndex % this.currentPattern.length];
    this.shotIndex++;
    
    // Add some randomness
    return {
      x: recoil.x + (Math.random() - 0.5) * 0.1,
      y: recoil.y + Math.random() * 0.1
    };
  }

  reset() {
    this.currentPattern = [];
    this.shotIndex = 0;
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
  }

  applyRecoil(camera, weaponId) {
    if (this.shotIndex === 0) {
      this.startPattern(weaponId);
    }
    
    const recoil = this.getNextRecoil();
    
    camera.rotation.x -= recoil.y;
    camera.rotation.y += recoil.x;
    
    return recoil;
  }
}
