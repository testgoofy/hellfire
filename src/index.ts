import Logger from './logger';
import ConstructionManager from './managers/constructionManager';
import SpawningManager from './managers/spawningManager';
import TaskManager from './managers/taskManager';
import MiningSite from './sites/miningSite';

declare global {
  interface Memory {
    sites: {
      [site: Id<Source>]: {
        initialized: boolean;
        dropPoint: {
          x: number;
          y: number;
        };
      };
    };
  }
}

export function loop() {
  let logger = Logger.getInstance();
  logger.setLevel(Logger.INFO);

  // Instantiate managers
  let spawningManager = SpawningManager.getInstance();
  let constructionManager = ConstructionManager.getInstance();
  let taskManager = TaskManager.getInstance();

  // Initialize managers
  spawningManager.initialize();
  constructionManager.initialize(Game.spawns['Spawn1'].room);

  // Mining sites
  let site = new MiningSite(Game.spawns['Spawn1'].room.find(FIND_SOURCES)[0]);
  site.run();

  // Run managers
  spawningManager.run();
  taskManager.run();

  // Try generating a pixel
  if (Game.cpu.bucket >= 10_000) {
    Game.cpu.generatePixel();
  }
}
