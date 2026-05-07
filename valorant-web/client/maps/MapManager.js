export class MapManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentMap = null;
    this.colliders = [];
  }

  async loadMap(mapName) {
    // Clear existing map objects
    this.clearMap();
    
    let mapModule;
    
    switch (mapName) {
      case 'ascent':
        mapModule = await import('./Ascent.js');
        break;
      case 'bind':
        // Bind would be implemented similarly
        mapModule = await import('./Ascent.js'); // Fallback for now
        break;
      case 'haven':
        // Haven would be implemented similarly
        mapModule = await import('./Ascent.js'); // Fallback for now
        break;
      default:
        mapModule = await import('./Ascent.js');
    }
    
    this.currentMap = mapName;
    
    // Create the map
    if (mapModule.createMap) {
      this.colliders = mapModule.createMap(this.gameEngine.scene);
      
      // Update collision system
      this.gameEngine.collisionSystem.clearColliders();
      for (const collider of this.colliders) {
        this.gameEngine.collisionSystem.addCollider(collider);
      }
    }
    
    return mapModule;
  }

  clearMap() {
    // Remove all map-related objects from scene
    // This is simplified - in production you'd track all map objects
    this.colliders = [];
  }

  getSpawnPoints(team) {
    // Return spawn points based on current map
    // For now, using Ascent defaults
    if (team === 'atk') {
      return [
        { x: -40, y: 0, z: -40 },
        { x: -35, y: 0, z: -35 },
        { x: -45, y: 0, z: -35 },
        { x: -40, y: 0, z: -45 }
      ];
    } else {
      return [
        { x: 40, y: 0, z: 40 },
        { x: 35, y: 0, z: 35 },
        { x: 45, y: 0, z: 35 },
        { x: 40, y: 0, z: 45 }
      ];
    }
  }

  getSites() {
    return {
      A: { pos: { x: -30, y: 0, z: -30 }, radius: 8 },
      B: { pos: { x: 30, y: 0, z: 30 }, radius: 8 }
    };
  }
}
