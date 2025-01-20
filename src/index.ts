var _ = require('lodash');
import Logger from './logger';
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

  // Spawning
  let spawningManager = SpawningManager.getInstance();
  spawningManager.run();

  // Mining sites
  let site = new MiningSite(Game.spawns['Spawn1'].room.find(FIND_SOURCES)[0]);
  site.run();

  // Commanding creeps
  let taskManager = TaskManager.getInstance(Game.spawns['Spawn1'].room);
  taskManager.run();

  // Try generating a pixel
  if (Game.cpu.bucket >= 10_000) {
    Game.cpu.generatePixel();
  }
}
