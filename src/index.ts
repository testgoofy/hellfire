var _ = require('lodash');
import Logger from './logger';
import TaskManager from './managers/taskManager';

export function loop() {
  let logger = Logger.getInstance();
  logger.setLevel(Logger.INFO);

  // Memory Maintenance
  for (let creep in Memory.creeps) {
    if (!Game.creeps[creep]) {
      logger.info('Deleting dead creep ' + creep);
      delete Memory.creeps[creep];
    }
  }

  // Spawning
  if (Object.keys(Game.creeps).length < 3) {
    let name = 'Universal' + Game.time;
    if (Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name) == OK) {
      logger.info('Spawning ' + name);
    }
  }

  if (Game.spawns['Spawn1'].spawning) {
    let creep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + creep.name,
      creep.pos.x,
      creep.pos.y + 1,
      {align: 'center', opacity: 0.8}
    );
  }

  // Commanding creeps
  let taskManager = TaskManager.getInstance(Game.spawns['Spawn1'].room);
  taskManager.run();

  // Try generating a pixel
  if (Game.cpu.bucket >= 10_000) {
    Game.cpu.generatePixel();
  }
}
