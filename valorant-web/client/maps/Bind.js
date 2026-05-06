import * as THREE from 'three';

export function createMap(scene) {
  const colliders = [];
  
  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b7355,
    roughness: 0.8
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4c5b0,
    roughness: 0.6
  });
  
  // Simple structures
  createWall(scene, colliders, 0, 2.5, 0, 20, 5, 1, wallMaterial);
  
  return colliders;
}

function createWall(scene, colliders, x, y, z, w, h, d, material) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, y, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  
  const box = new THREE.Box3();
  box.setFromCenterAndSize(
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(w, h, d)
  );
  colliders.push(box);
}

export const spawnPoints = {
  atk: [{ x: -40, y: 0, z: -40 }],
  def: [{ x: 40, y: 0, z: 40 }]
};

export const sites = {
  A: { pos: { x: -30, y: 0, z: -30 }, radius: 8 },
  B: { pos: { x: 30, y: 0, z: 30 }, radius: 8 }
};

export const callouts = [];
