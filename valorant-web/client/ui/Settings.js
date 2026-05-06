export class Settings {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    
    this.values = {
      sensitivity: 1.0,
      fpsCounter: false,
      quality: 'medium',
      fov: 90,
      masterVol: 80,
      sfxVol: 70,
      voiceVol: 60,
      crosshairStyle: 'cross',
      crosshairColor: '#00ff00',
      crosshairSize: 4
    };
    
    this.load();
  }

  toggle() {
    const el = document.getElementById('settings-menu');
    if (!el) return;
    
    const isHidden = el.classList.contains('hidden');
    
    if (isHidden) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    const el = document.getElementById('settings-menu');
    if (!el) return;
    
    el.classList.remove('hidden');
    this.loadUI();
  }

  close() {
    const el = document.getElementById('settings-menu');
    if (!el) return;
    
    this.save();
    el.classList.add('hidden');
  }

  loadUI() {
    // Sensitivity
    const sensEl = document.getElementById('setting-sensitivity');
    if (sensEl) sensEl.value = this.values.sensitivity;
    
    // FPS Counter
    const fpsEl = document.getElementById('setting-fps-counter');
    if (fpsEl) fpsEl.checked = this.values.fpsCounter;
    
    // Quality
    const qualityEl = document.getElementById('setting-quality');
    if (qualityEl) qualityEl.value = this.values.quality;
    
    // FOV
    const fovEl = document.getElementById('setting-fov');
    if (fovEl) fovEl.value = this.values.fov;
    
    // Volumes
    const masterVolEl = document.getElementById('setting-master-vol');
    const sfxVolEl = document.getElementById('setting-sfx-vol');
    const voiceVolEl = document.getElementById('setting-voice-vol');
    
    if (masterVolEl) masterVolEl.value = this.values.masterVol;
    if (sfxVolEl) sfxVolEl.value = this.values.sfxVol;
    if (voiceVolEl) voiceVolEl.value = this.values.voiceVol;
    
    // Crosshair
    const chStyleEl = document.getElementById('setting-crosshair-style');
    const chColorEl = document.getElementById('setting-crosshair-color');
    const chSizeEl = document.getElementById('setting-crosshair-size');
    
    if (chStyleEl) chStyleEl.value = this.values.crosshairStyle;
    if (chColorEl) chColorEl.value = this.values.crosshairColor;
    if (chSizeEl) chSizeEl.value = this.values.crosshairSize;
    
    // Setup listeners
    this.setupListeners();
  }

  setupListeners() {
    // Sensitivity
    document.getElementById('setting-sensitivity')?.addEventListener('input', (e) => {
      this.values.sensitivity = parseFloat(e.target.value);
    });
    
    // FPS Counter
    document.getElementById('setting-fps-counter')?.addEventListener('change', (e) => {
      this.values.fpsCounter = e.target.checked;
    });
    
    // Quality
    document.getElementById('setting-quality')?.addEventListener('change', (e) => {
      this.values.quality = e.target.value;
      this.applyQuality();
    });
    
    // FOV
    document.getElementById('setting-fov')?.addEventListener('input', (e) => {
      this.values.fov = parseInt(e.target.value);
      this.applyFOV();
    });
    
    // Volumes
    document.getElementById('setting-master-vol')?.addEventListener('input', (e) => {
      this.values.masterVol = parseInt(e.target.value);
      this.gameEngine.audioSystem.setMasterVolume(this.values.masterVol / 100);
    });
    
    document.getElementById('setting-sfx-vol')?.addEventListener('input', (e) => {
      this.values.sfxVol = parseInt(e.target.value);
      this.gameEngine.audioSystem.setSFXVolume(this.values.sfxVol / 100);
    });
    
    document.getElementById('setting-voice-vol')?.addEventListener('input', (e) => {
      this.values.voiceVol = parseInt(e.target.value);
      this.gameEngine.audioSystem.setVoiceVolume(this.values.voiceVol / 100);
    });
    
    // Crosshair
    document.getElementById('setting-crosshair-style')?.addEventListener('change', (e) => {
      this.values.crosshairStyle = e.target.value;
      this.gameEngine.crosshair.setStyle(this.values.crosshairStyle);
    });
    
    document.getElementById('setting-crosshair-color')?.addEventListener('input', (e) => {
      this.values.crosshairColor = e.target.value;
      this.gameEngine.crosshair.setColor(this.values.crosshairColor);
    });
    
    document.getElementById('setting-crosshair-size')?.addEventListener('input', (e) => {
      this.values.crosshairSize = parseInt(e.target.value);
      this.gameEngine.crosshair.setSize(this.values.crosshairSize);
    });
  }

  applyQuality() {
    const renderer = this.gameEngine.renderer;
    if (!renderer) return;
    
    switch (this.values.quality) {
      case 'low':
        renderer.shadowMap.enabled = false;
        renderer.setPixelRatio(0.5);
        break;
      case 'medium':
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(1);
        break;
      case 'high':
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        break;
    }
  }

  applyFOV() {
    if (this.gameEngine.camera) {
      this.gameEngine.camera.fov = this.values.fov;
      this.gameEngine.camera.updateProjectionMatrix();
    }
  }

  save() {
    try {
      localStorage.setItem('vw_settings', JSON.stringify(this.values));
    } catch (e) {
      console.warn('Failed to save settings');
    }
  }

  load() {
    try {
      const saved = localStorage.getItem('vw_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.values = { ...this.values, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load settings');
    }
    
    // Apply loaded settings
    this.applyFOV();
    this.applyQuality();
    
    if (this.gameEngine.audioSystem) {
      this.gameEngine.audioSystem.setMasterVolume(this.values.masterVol / 100);
      this.gameEngine.audioSystem.setSFXVolume(this.values.sfxVol / 100);
      this.gameEngine.audioSystem.setVoiceVolume(this.values.voiceVol / 100);
    }
    
    if (this.gameEngine.crosshair) {
      this.gameEngine.crosshair.setStyle(this.values.crosshairStyle);
      this.gameEngine.crosshair.setColor(this.values.crosshairColor);
      this.gameEngine.crosshair.setSize(this.values.crosshairSize);
    }
  }
}
