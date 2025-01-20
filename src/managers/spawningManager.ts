import Logger from '../logger';

export default class SpawningManager {
  private static instance: SpawningManager;

  private logger = Logger.getInstance();

  public static getInstance(): SpawningManager {
    if (!SpawningManager.instance) {
      SpawningManager.instance = new SpawningManager();
    }

    return SpawningManager.instance;
  }

  private constructor() {}

  public run() {
    // Clean up dead creeps
    for (let creep in Memory.creeps) {
      if (!Game.creeps[creep]) {
        this.logger.info('Deleting dead creep ' + creep);
        delete Memory.creeps[creep];
      }
    }

    // Spawn requested creeps
    if (Object.keys(Game.creeps).length < 3) {
      let name = 'Universal' + Game.time;
      if (Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name) == OK) {
        this.logger.info('Spawning ' + name);
      }
    }
  }
}
