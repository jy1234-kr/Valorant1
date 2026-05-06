// ${agent} Agent
export class ${agent} {
  constructor() {
    this.agentId = '${agent.toLowerCase()}';
    this.name = '${agent}';
    this.role = this.getRole();
    this.color = '#888888';
    
    this.abilities = {
      C: { name: 'C Ability', cost: 200, maxCharges: 2, cooldown: 0 },
      Q: { name: 'Q Ability', cost: 300, maxCharges: 1, cooldown: 0 },
      E: { name: 'E Ability', cost: 0, maxCharges: 1, cooldown: 30 },
      X: { name: 'Ultimate', cost: 7, maxCharges: 1 }
    };
  }
  
  getRole() {
    const duelist = ['Reyna', 'Phoenix', 'Raze', 'Yoru', 'Neon', 'Iso'];
    const initiator = ['Sova', 'Breach', 'Skye', 'Kayo', 'Fade', 'Gekko'];
    const controller = ['Brimstone', 'Viper', 'Omen', 'Astra', 'Harbor', 'Clove'];
    const sentinel = ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse'];
    
    if (duelist.includes('${agent}')) return 'duelist';
    if (initiator.includes('${agent}')) return 'initiator';
    if (controller.includes('${agent}')) return 'controller';
    if (sentinel.includes('${agent}')) return 'sentinel';
    return 'duelist';
  }
}
