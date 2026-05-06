export class PhysicsSystem {
  constructor(collisionSystem) {
    this.collisionSystem = collisionSystem;
    this.gravity = -9.8;
  }

  update(entity, delta) {
    // Apply gravity
    if (entity.pos.y > 0) {
      entity.vel.y += this.gravity * delta;
    }

    // Update position
    entity.pos.x += entity.vel.x * delta;
    entity.pos.y += entity.vel.y * delta;
    entity.pos.z += entity.vel.z * delta;

    // Ground collision
    if (entity.pos.y < 0) {
      entity.pos.y = 0;
      entity.vel.y = 0;
      entity.onGround = true;
    } else {
      entity.onGround = false;
    }

    return entity.pos;
  }

  applyForce(entity, force, delta) {
    entity.vel.x += force.x * delta;
    entity.vel.y += force.y * delta;
    entity.vel.z += force.z * delta;
  }

  jump(entity, jumpForce = 5) {
    if (entity.onGround) {
      entity.vel.y = jumpForce;
      entity.onGround = false;
    }
  }
}
