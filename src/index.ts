var _ = require('lodash');

export function loop() {
  // Memory Maintenance
  for (let creep in Memory.creeps) {
    if (!Game.creeps[creep]) {
      delete Memory.creeps[creep];
    }
  }

  // Spawning
  let harvesters = _.filter(
    Game.creeps,
    (creep: Creep) => creep.memory['role'] == 'harvester'
  );

  let upgraders = _.filter(
    Game.creeps,
    (creep: Creep) => creep.memory['role'] == 'upgrader'
  );

  if (harvesters.length < 3) {
    let name = 'Harvester' + Game.time;
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name, {
      memory: {role: 'harvester'},
    });
  }

  if (upgraders.length < 1) {
    let name = 'Upgrader' + Game.time;
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name, {
      memory: {role: 'upgrader'},
    });
  }

  if (Game.spawns['Spawn1'].spawning) {
    let creep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + creep.memory['role'],
      creep.pos.x + 1,
      creep.pos.y,
      {align: 'left', opacity: 0.8}
    );
  }

  // Commanding creeps
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory['role'] == 'harvester') {
      // Harvester
      if (creep.store.getFreeCapacity() > 0) {
        let sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else {
        // Creep is fully loaded
        let targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (
              structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN
            );
          },
        });
        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
    } else if (creep.memory['role'] == 'upgrader') {
      // Upgrader
      if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
        creep.say('🔄 harvest');
      }
      if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
        creep.memory.upgrading = true;
        creep.say('⚡ upgrade');
      }
      if (creep.memory.upgrading) {
        let controller = creep.room.controller;
        if (controller == undefined) {
          console.log('No controller in room ' + creep.room.name);
        } else if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(controller, {
            visualizePathStyle: {stroke: '#ffffff'},
          });
        }
      } else {
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    }
  }
}
