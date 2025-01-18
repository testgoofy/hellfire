var _ = require('lodash');
import Building from './tasks/building';
import Hauling from './tasks/hauling';
import TaskManager from './tasks/taskManager';
import Upgrading from './tasks/upgrading';

export function loop() {
  // Memory Maintenance
  for (let creep in Memory.creeps) {
    if (!Game.creeps[creep]) {
      delete Memory.creeps[creep];
    }
  }

  // Spawning
  if (Object.keys(Game.creeps).length < 3) {
    let name = 'Universal' + Game.time;
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name);
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
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];

    let task = TaskManager.assignTask(creep);
    task.run();

    // Persist task, if not finished
    if (task.active()) {
      task.persist();
    }
  }

  // Try generating a pixel
  if (Game.cpu.bucket >= 10_000) {
    Game.cpu.generatePixel();
  }
}
