import * as THREE from 'three';

export class PlayerController {
  constructor(camera, collisionSystem) {
    this.camera = camera;
    this.collisionSystem = collisionSystem;
    
    this.yaw = 0;
    this.pitch = 0;
    this.velocity = new THREE.Vector3();
    this.onGround = false;
    
    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
      space: false,
      shift: false,
      ctrl: false,
      f: false
    };
    
    this.mouse = {
      left: false,
      right: false
    };
    
    this.enabled = false;
    this.moveDir = new THREE.Vector3();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  update(delta, gameState) {
    if (!this.enabled || !gameState) return;
    
    // Calculate movement direction based on yaw
    this.moveDir.set(0, 0, 0);
    
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    
    if (this.keys.w) {
      this.moveDir.add(forward);
    }
    if (this.keys.s) {
      this.moveDir.sub(forward);
    }
    if (this.keys.d) {
      this.moveDir.add(right);
    }
    if (this.keys.a) {
      this.moveDir.sub(right);
    }
    
    // Normalize horizontal movement
    this.moveDir.y = 0;
    if (this.moveDir.length() > 0) {
      this.moveDir.normalize();
    }
    
    // Apply gravity
    if (!this.onGround) {
      this.velocity.y -= 9.8 * delta;
    }
    
    // Jump
    if (this.keys.space && this.onGround) {
      this.velocity.y = 5;
      this.onGround = false;
    }
    
    // Update camera position
    const speed = this.keys.shift ? 2.5 : (this.keys.ctrl ? 1.5 : 5.5);
    
    const newPos = this.camera.position.clone();
    newPos.x += this.moveDir.x * speed * delta;
    newPos.z += this.moveDir.z * speed * delta;
    newPos.y += this.velocity.y * delta;
    
    // Ground collision
    if (newPos.y < 1.7) {
      newPos.y = 1.7;
      this.velocity.y = 0;
      this.onGround = true;
    }
    
    // Apply collision
    if (this.collisionSystem) {
      const collided = this.collisionSystem.checkCollision(this.camera.position, newPos);
      if (!collided) {
        this.camera.position.copy(newPos);
      }
    } else {
      this.camera.position.copy(newPos);
    }
    
    // Apply rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  getMoveDirection() {
    return {
      x: this.moveDir.x,
      z: this.moveDir.z
    };
  }

  reset() {
    this.velocity.set(0, 0, 0);
    this.onGround = true;
    this.yaw = 0;
    this.pitch = 0;
  }
}
