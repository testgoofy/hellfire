var _ = require('lodash');

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

  let request = Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY);
  RESOURCE_ENERGY;
  // Commanding creeps
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];

    if (creep.memory['busy'] == undefined) {
      creep.memory['busy'] = false;
    }

    if (creep.memory['busy'] && creep.store[RESOURCE_ENERGY] == 0) {
      // Creep wants to work, but has not enough energy
      creep.memory['busy'] = false;
      creep.say('🔄 harvest');
    } else if (
      !creep.memory['busy'] &&
      creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
    ) {
      // Creep wants to harvest, but has no more free capacity
      creep.memory['busy'] = true;
      creep.say('⚡ working');
    }

    if (!creep.memory['busy']) {
      // Mode 1: Harvesting
      let source = creep.room.find(FIND_SOURCES)[0];
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    } else {
      // creep.memory['busy'] == false
      // Mode 2: Working
      if (request > 0) {
        // Spawn needs energy
        // Mode 2a: Hauling
        request -= creep.store[RESOURCE_ENERGY];
        let target = creep.room.find(FIND_MY_SPAWNS)[0];
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      } else {
        // Spawn does not need energy
        // Mode 2b: Upgrading
        let controller = creep.room.controller;
        if (controller) {
          if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
              visualizePathStyle: {stroke: '#ffffff'},
            });
          }
        }
      }
    }
  }
}
