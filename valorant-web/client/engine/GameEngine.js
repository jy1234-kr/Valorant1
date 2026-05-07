import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { CollisionSystem } from './CollisionSystem.js';
import { PhysicsSystem } from './PhysicsSystem.js';
import { AudioSystem } from './AudioSystem.js';
import { NetworkManager } from '../network/NetworkManager.js';
import { WeaponManager } from '../weapons/WeaponManager.js';
import { AgentManager } from '../agents/AgentManager.js';
import { HUD } from '../ui/HUD.js';
import { BuyMenu } from '../ui/BuyMenu.js';
import { Crosshair } from '../ui/Crosshair.js';
import { Scoreboard } from '../ui/Scoreboard.js';
import { Settings } from '../ui/Settings.js';

export class GameEngine {
  constructor() {
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    
    this.playerController = null;
    this.collisionSystem = null;
    this.physicsSystem = null;
    this.audioSystem = null;
    this.networkManager = null;
    this.weaponManager = null;
    this.agentManager = null;
    this.hud = null;
    this.buyMenu = null;
    this.crosshair = null;
    this.scoreboard = null;
    this.settings = null;
    
    this.gameState = null;
    this.localPlayerId = null;
    this.otherPlayers = new Map();
    this.effects = [];
    
    this.isRunning = false;
    this.animationId = null;
  }

  async init() {
    // Setup Three.js
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      console.error('Game canvas not found');
      return false;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

    this.camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.7, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Initialize systems
    this.collisionSystem = new CollisionSystem();
    this.physicsSystem = new PhysicsSystem(this.collisionSystem);
    this.playerController = new PlayerController(this.camera, this.collisionSystem);
    this.audioSystem = new AudioSystem();
    this.networkManager = new NetworkManager(this);
    this.weaponManager = new WeaponManager(this);
    this.agentManager = new AgentManager(this);
    this.hud = new HUD(this);
    this.buyMenu = new BuyMenu(this);
    this.crosshair = new Crosshair(this);
    this.scoreboard = new Scoreboard(this);
    this.settings = new Settings(this);

    // Load settings
    this.settings.load();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Setup input listeners
    this.setupInputListeners();

    console.log('Game engine initialized');
    return true;
  }

  setupInputListeners() {
    // Pointer lock
    this.canvas.addEventListener('click', () => {
      if (this.isRunning && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        this.playerController.setEnabled(true);
      } else {
        this.playerController.setEnabled(false);
      }
    });

    // Keyboard
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  onKeyDown(e) {
    if (!this.isRunning) return;
    
    switch (e.code) {
      case 'KeyW':
        this.playerController.keys.w = true;
        break;
      case 'KeyS':
        this.playerController.keys.s = true;
        break;
      case 'KeyA':
        this.playerController.keys.a = true;
        break;
      case 'KeyD':
        this.playerController.keys.d = true;
        break;
      case 'Space':
        this.playerController.keys.space = true;
        e.preventDefault();
        break;
      case 'ShiftLeft':
        this.playerController.keys.shift = true;
        break;
      case 'ControlLeft':
        this.playerController.keys.ctrl = true;
        break;
      case 'KeyR':
        this.weaponManager.reload();
        break;
      case 'KeyF':
        this.playerController.keys.f = true;
        break;
      case 'KeyB':
        if (this.gameState && this.gameState.phase === 'buy') {
          this.buyMenu.toggle();
        }
        break;
      case 'Tab':
        e.preventDefault();
        this.scoreboard.toggle();
        break;
      case 'Escape':
        this.settings.toggle();
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
        this.agentManager.useAbility(e.code.replace('Digit', ''));
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
        this.playerController.keys.w = false;
        break;
      case 'KeyS':
        this.playerController.keys.s = false;
        break;
      case 'KeyA':
        this.playerController.keys.a = false;
        break;
      case 'KeyD':
        this.playerController.keys.d = false;
        break;
      case 'Space':
        this.playerController.keys.space = false;
        break;
      case 'ShiftLeft':
        this.playerController.keys.shift = false;
        break;
      case 'ControlLeft':
        this.playerController.keys.ctrl = false;
        break;
      case 'KeyF':
        this.playerController.keys.f = false;
        break;
    }
  }

  onMouseMove(e) {
    if (!this.isRunning || document.pointerLockElement !== this.canvas) return;
    
    const sensitivity = this.settings.values.sensitivity;
    this.playerController.yaw -= e.movementX * sensitivity * 0.002;
    this.playerController.pitch -= e.movementY * sensitivity * 0.002;
    
    // Clamp pitch
    this.playerController.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.playerController.pitch));
  }

  onMouseDown(e) {
    if (!this.isRunning || document.pointerLockElement !== this.canvas) return;
    
    if (e.button === 0) {
      this.playerController.mouse.left = true;
      this.weaponManager.shoot();
    } else if (e.button === 2) {
      this.playerController.mouse.right = true;
      this.weaponManager.aimDownSights(true);
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.playerController.mouse.left = false;
    } else if (e.button === 2) {
      this.playerController.mouse.right = false;
      this.weaponManager.aimDownSights(false);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const delta = Math.min(this.clock.getDelta(), 0.1);
    
    this.update(delta);
    this.render();
  }

  update(delta) {
    // Update player controller
    this.playerController.update(delta, this.gameState);
    
    // Send input to server
    this.networkManager.sendInput();
    
    // Update weapon manager
    this.weaponManager.update(delta);
    
    // Update other players (interpolation)
    this.updateOtherPlayers(delta);
    
    // Update effects
    this.updateEffects(delta);
    
    // Update HUD
    this.hud.update(this.gameState, this.localPlayerId);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  updateOtherPlayers(delta) {
    for (const [id, playerData] of this.otherPlayers) {
      if (playerData.mesh) {
        // Smooth interpolation to target position
        const targetPos = playerData.interpolatedPos || playerData.pos;
        playerData.mesh.position.lerp(targetPos, 10 * delta);
        playerData.mesh.rotation.y = playerData.yaw;
      }
    }
  }

  updateEffects(delta) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.ttl -= delta;
      
      if (effect.ttl <= 0) {
        if (effect.mesh) {
          this.scene.remove(effect.mesh);
        }
        this.effects.splice(i, 1);
      }
    }
  }

  updateGameState(state) {
    this.gameState = state;
    
    // Find local player
    if (state.players) {
      for (const player of state.players) {
        if (player.id === this.localPlayerId) {
          // Update local player data
          if (!player.isBot) {
            this.camera.position.set(player.pos.x, player.pos.y + 1.7, player.pos.z);
            this.playerController.yaw = player.yaw;
            this.playerController.pitch = player.pitch;
          }
        } else {
          // Update other players
          this.updateOtherPlayer(player);
        }
      }
    }
    
    // Update effects
    if (state.effects) {
      for (const effect of state.effects) {
        this.addEffect(effect);
      }
    }
  }

  updateOtherPlayer(playerData) {
    let otherPlayer = this.otherPlayers.get(playerData.id);
    
    if (!otherPlayer) {
      // Create new other player mesh
      const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: playerData.team === 'atk' ? 0xff4655 : 0x4682b4 
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(playerData.pos.x, playerData.pos.y + 0.9, playerData.pos.z);
      mesh.castShadow = true;
      this.scene.add(mesh);
      
      otherPlayer = {
        id: playerData.id,
        mesh: mesh,
        pos: playerData.pos,
        yaw: playerData.yaw,
        interpolatedPos: { ...playerData.pos },
        snapshotBuffer: []
      };
      
      this.otherPlayers.set(playerData.id, otherPlayer);
    } else {
      // Update existing player
      otherPlayer.pos = playerData.pos;
      otherPlayer.yaw = playerData.yaw;
      
      // Add to snapshot buffer for interpolation
      otherPlayer.snapshotBuffer.push({
        tick: this.gameState.tick,
        pos: { ...playerData.pos },
        yaw: playerData.yaw
      });
      
      // Keep only last 3 snapshots
      if (otherPlayer.snapshotBuffer.length > 3) {
        otherPlayer.snapshotBuffer.shift();
      }
      
      // Interpolate position
      if (otherPlayer.snapshotBuffer.length >= 2) {
        const oldSnap = otherPlayer.snapshotBuffer[0];
        const newSnap = otherPlayer.snapshotBuffer[otherPlayer.snapshotBuffer.length - 1];
        const t = (this.gameState.tick - oldSnap.tick) / (newSnap.tick - oldSnap.tick);
        
        otherPlayer.interpolatedPos = {
          x: oldSnap.pos.x + (newSnap.pos.x - oldSnap.pos.x) * t,
          y: oldSnap.pos.y + (newSnap.pos.y - oldSnap.pos.y) * t,
          z: oldSnap.pos.z + (newSnap.pos.z - oldSnap.pos.z) * t
        };
      }
      
      // Update mesh color based on alive status
      if (!playerData.alive && otherPlayer.mesh) {
        otherPlayer.mesh.material.color.setHex(0x333333);
        otherPlayer.mesh.rotation.x = -Math.PI / 2;
        otherPlayer.mesh.position.y = 0.5;
      }
    }
  }

  addEffect(effectData) {
    // Check if effect already exists
    const existing = this.effects.find(e => e.id === effectData.id);
    if (existing) {
      existing.ttl = effectData.ttl;
      return;
    }
    
    let mesh;
    
    if (effectData.type === 'smoke') {
      const geometry = new THREE.CylinderGeometry(
        effectData.radius,
        effectData.radius,
        5,
        16
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(effectData.pos.x, effectData.pos.y + 2.5, effectData.pos.z);
    } else if (effectData.type === 'flash') {
      const geometry = new THREE.SphereGeometry(3, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(effectData.pos.x, effectData.pos.y + 1.5, effectData.pos.z);
    } else if (effectData.type === 'molotov') {
      const geometry = new THREE.CircleGeometry(effectData.radius, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.6
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(effectData.pos.x, effectData.pos.y + 0.1, effectData.pos.z);
    }
    
    if (mesh) {
      this.scene.add(mesh);
      this.effects.push({
        id: effectData.id,
        type: effectData.type,
        mesh: mesh,
        ttl: effectData.ttl
      });
    }
  }

  removeOtherPlayer(playerId) {
    const otherPlayer = this.otherPlayers.get(playerId);
    if (otherPlayer && otherPlayer.mesh) {
      this.scene.remove(otherPlayer.mesh);
    }
    this.otherPlayers.delete(playerId);
  }

  clearOtherPlayers() {
    for (const [id, player] of this.otherPlayers) {
      if (player.mesh) {
        this.scene.remove(player.mesh);
      }
    }
    this.otherPlayers.clear();
  }
}
