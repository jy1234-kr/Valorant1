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
  
  // Create simple buildings/walls for Ascent
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd4c5b0,
    roughness: 0.6
  });
  
  // Mid walls
  createWall(scene, colliders, 0, 2.5, 0, 20, 5, 1, wallMaterial);
  createWall(scene, colliders, -10, 2.5, -10, 1, 5, 20, wallMaterial);
  createWall(scene, colliders, 10, 2.5, 10, 1, 5, 20, wallMaterial);
  
  // A site structures
  createWall(scene, colliders, -30, 2, -30, 10, 4, 10, wallMaterial);
  createWall(scene, colliders, -25, 1.5, -35, 5, 3, 1, wallMaterial);
  
  // B site structures
  createWall(scene, colliders, 30, 2, 30, 10, 4, 10, wallMaterial);
  createWall(scene, colliders, 35, 1.5, 25, 1, 3, 10, wallMaterial);
  
  // Spawn covers
  createWall(scene, colliders, -40, 1.5, -40, 5, 3, 5, wallMaterial);
  createWall(scene, colliders, 40, 1.5, 40, 5, 3, 5, wallMaterial);
  
  // Add some crates/boxes
  const crateGeometry = new THREE.BoxGeometry(2, 2, 2);
  const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  
  const cratePositions = [
    [-15, 1, -15], [15, 1, 15], [-5, 1, 5], [5, 1, -5]
  ];
  
  for (const pos of cratePositions) {
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(...pos);
    crate.castShadow = true;
    crate.receiveShadow = true;
    scene.add(crate);
    
    // Add collider
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(...pos),
      new THREE.Vector3(2, 2, 2)
    );
    colliders.push(box);
  }
  
  return colliders;
}

function createWall(scene, colliders, x, y, z, w, h, d, material) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, y, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  
  // Add collider
  const box = new THREE.Box3();
  box.setFromCenterAndSize(
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(w, h, d)
  );
  colliders.push(box);
}

export const spawnPoints = {
  atk: [
    { x: -40, y: 0, z: -40 },
    { x: -35, y: 0, z: -35 },
    { x: -45, y: 0, z: -35 },
    { x: -40, y: 0, z: -45 }
  ],
  def: [
    { x: 40, y: 0, z: 40 },
    { x: 35, y: 0, z: 35 },
    { x: 45, y: 0, z: 35 },
    { x: 40, y: 0, z: 45 }
  ]
};

export const sites = {
  A: { pos: { x: -30, y: 0, z: -30 }, radius: 8 },
  B: { pos: { x: 30, y: 0, z: 30 }, radius: 8 }
};

export const callouts = [
  { name: 'A Main', pos: { x: -25, y: 0, z: -20 } },
  { name: 'A Site', pos: { x: -30, y: 0, z: -30 } },
  { name: 'Mid', pos: { x: 0, y: 0, z: 0 } },
  { name: 'B Main', pos: { x: 25, y: 0, z: 20 } },
  { name: 'B Site', pos: { x: 30, y: 0, z: 30 } }
];
