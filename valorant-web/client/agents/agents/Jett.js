// Jett Agent - Duelist
export class Jett {
  constructor() {
    this.agentId = 'jett';
    this.name = 'Jett';
    this.role = 'duelist';
    this.color = '#7ec8e3';
    
    this.abilities = {
      C: { 
        name: 'Cloudburst', 
        cost: 200, 
        maxCharges: 3, 
        cooldown: 0,
        execute: (game, player) => this.cloudburst(game, player)
      },
      Q: { 
        name: 'Updraft', 
        cost: 150, 
        maxCharges: 2, 
        cooldown: 0,
        execute: (game, player) => this.updraft(game, player)
      },
      E: { 
        name: 'Tailwind', 
        cost: 0, 
        maxCharges: 2, 
        cooldown: 0,
        execute: (game, player) => this.tailwind(game, player)
      },
      X: { 
        name: 'Blade Storm', 
        cost: 7, 
        maxCharges: 1,
        execute: (game, player) => this.bladeStorm(game, player)
      }
    };
  }

  cloudburst(game, player) {
    // Throw smoke orb that curls to crosshair
    console.log('Jett used Cloudburst');
    // Create smoke effect at target location
    return true;
  }

  updraft(game, player) {
    // Propel self upward instantly
    console.log('Jett used Updraft');
    if (game && game.gameEngine) {
      game.gameEngine.playerController.velocity.y = 8;
    }
    return true;
  }

  tailwind(game, player) {
    // Dash in movement direction instantly
    console.log('Jett used Tailwind');
    // Dash forward with brief invulnerability
    return true;
  }

  bladeStorm(game, player) {
    // Equip 5 throwing knives
    console.log('Jett used Blade Storm!');
    // Replace weapon with knives temporarily
    return true;
  }
}
