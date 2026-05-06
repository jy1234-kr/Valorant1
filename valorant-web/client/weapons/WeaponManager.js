import * as THREE from 'three';
import { WEAPONS } from './WeaponData.js';

export class WeaponManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentWeapon = 'classic';
    this.ammo = { clip: 12, reserve: 36 };
    this.isReloading = false;
    this.reloadTimer = 0;
    this.lastShotTime = 0;
    this.isADS = false;
    this.recoil = { x: 0, y: 0 };
    this.recoilTimer = 0;
  }

  setWeapon(weaponId) {
    if (WEAPONS[weaponId]) {
      this.currentWeapon = weaponId;
      const weapon = WEAPONS[weaponId];
      this.ammo = { clip: weapon.magSize, reserve: weapon.reserve };
      this.isReloading = false;
    }
  }

  update(delta) {
    // Handle reload
    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.completeReload();
      }
    }

    // Handle recoil recovery
    if (this.recoilTimer > 0) {
      this.recoilTimer -= delta;
      this.recoil.x *= 0.9;
      this.recoil.y *= 0.9;
      
      if (this.recoilTimer <= 0) {
        this.recoil.x = 0;
        this.recoil.y = 0;
      }
    }

    // Update HUD ammo display
    this.updateHUD();
  }

  shoot() {
    if (!this.gameEngine.isRunning) return;
    if (this.isReloading) return;
    if (this.ammo.clip <= 0) {
      this.reload();
      return;
    }

    const weapon = WEAPONS[this.currentWeapon];
    const now = Date.now() / 1000;
    const timeSinceLastShot = now - this.lastShotTime;
    const fireInterval = 1 / weapon.fireRate;

    if (timeSinceLastShot < fireInterval) return;

    // Fire!
    this.ammo.clip--;
    this.lastShotTime = now;
    
    // Play sound
    this.gameEngine.audioSystem.playWeaponSound(this.currentWeapon);
    
    // Apply recoil
    this.applyRecoil(weapon);
    
    // Raycast for hit detection
    this.performRaycast(weapon);
  }

  applyRecoil(weapon) {
    // Base recoil
    const baseRecoil = 0.02;
    this.recoil.y += baseRecoil + Math.random() * 0.01;
    this.recoil.x += (Math.random() - 0.5) * 0.015;
    this.recoilTimer = 0.1;
    
    // Apply to camera
    this.gameEngine.playerController.pitch -= this.recoil.y;
    this.gameEngine.playerController.yaw += this.recoil.x;
  }

  performRaycast(weapon) {
    const camera = this.gameEngine.camera;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    
    // Add spread
    const spread = weapon.spread || 0.01;
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.z += (Math.random() - 0.5) * spread;
    direction.normalize();
    
    // Check hits against other players
    const origin = camera.position.clone();
    
    for (const [id, player] of this.gameEngine.otherPlayers) {
      if (!player.mesh || !this.gameEngine.gameState) continue;
      
      const playerEntity = this.gameEngine.gameState.players.find(p => p.id === id);
      if (!playerEntity || !playerEntity.alive) continue;
      
      // Simple distance check
      const toPlayer = player.mesh.position.clone().sub(origin);
      const dist = toPlayer.length();
      
      if (dist < 50) { // Max range
        toPlayer.normalize();
        const dot = direction.dot(toPlayer);
        
        if (dot > 0.95) { // Hit!
          // Calculate damage
          let damage = weapon.damage.body;
          const isHeadshot = player.mesh.position.y > origin.y + 1.5;
          if (isHeadshot) damage = weapon.damage.head;
          
          // Send shot to server (handled by network manager)
          console.log(`Hit ${id} for ${damage} damage`);
        }
      }
    }
  }

  reload() {
    if (this.isReloading) return;
    if (this.ammo.clip >= WEAPONS[this.currentWeapon].magSize) return;
    if (this.ammo.reserve <= 0) return;

    const weapon = WEAPONS[this.currentWeapon];
    this.isReloading = true;
    this.reloadTimer = weapon.reloadTime;
  }

  completeReload() {
    const weapon = WEAPONS[this.currentWeapon];
    const needed = weapon.magSize - this.ammo.clip;
    const available = Math.min(needed, this.ammo.reserve);
    
    this.ammo.clip += available;
    this.ammo.reserve -= available;
    this.isReloading = false;
  }

  aimDownSights(ads) {
    this.isADS = ads;
    
    if (ads) {
      // Zoom in
      const weapon = WEAPONS[this.currentWeapon];
      const fov = weapon.scopeZoom ? 30 : 60;
      this.gameEngine.camera.fov = fov;
      this.gameEngine.camera.updateProjectionMatrix();
    } else {
      // Reset FOV
      this.gameEngine.camera.fov = this.gameEngine.settings.values.fov || 90;
      this.gameEngine.camera.updateProjectionMatrix();
    }
  }

  updateHUD() {
    const clipEl = document.getElementById('ammo-clip');
    const reserveEl = document.getElementById('ammo-reserve');
    const fillEl = document.getElementById('ammo-fill');
    const weaponNameEl = document.getElementById('weapon-name');
    
    if (clipEl) clipEl.textContent = this.ammo.clip;
    if (reserveEl) reserveEl.textContent = this.ammo.reserve;
    if (weaponNameEl) weaponNameEl.textContent = this.currentWeapon.charAt(0).toUpperCase() + this.currentWeapon.slice(1);
    
    if (fillEl) {
      const weapon = WEAPONS[this.currentWeapon];
      const percent = (this.ammo.clip / weapon.magSize) * 100;
      fillEl.style.width = `${percent}%`;
    }
  }

  switchWeapon(weaponId) {
    if (WEAPONS[weaponId]) {
      this.setWeapon(weaponId);
    }
  }
}
