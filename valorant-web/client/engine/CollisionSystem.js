import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.colliders = [];
  }

  addCollider(box) {
    this.colliders.push(box);
  }

  clearColliders() {
    this.colliders = [];
  }

  checkCollision(from, to) {
    // Simple AABB collision check
    const playerBox = new THREE.Box3();
    const min = new THREE.Vector3(to.x - 0.3, to.y - 1.7, to.z - 0.3);
    const max = new THREE.Vector3(to.x + 0.3, to.y + 0.2, to.z + 0.3);
    playerBox.set(min, max);

    for (const collider of this.colliders) {
      if (playerBox.intersectsBox(collider)) {
        return true;
      }
    }

    return false;
  }

  raycast(origin, direction, maxDistance = 100) {
    // Simple raycast against colliders
    const raycaster = new THREE.Raycaster(origin, direction);
    
    // Create dummy meshes from colliders for raycasting
    const meshes = this.colliders.map(box => {
      const geometry = new THREE.BoxGeometry(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
      );
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(box.getCenter(new THREE.Vector3()));
      return mesh;
    });

    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0 && intersects[0].distance <= maxDistance) {
      return {
        hit: true,
        point: intersects[0].point,
        distance: intersects[0].distance
      };
    }

    return { hit: false };
  }
}
