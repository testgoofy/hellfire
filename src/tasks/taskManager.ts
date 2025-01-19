var _ = require('lodash');
import BaseTask from './baseTask';
import Hauling from './hauling';
import Building from './building';
import Upgrading from './upgrading';

export default class TaskManager {
  /**
   * Assign tasks to a creep. If the creep is idle, a new task is assigned.
   * The task is determined by the following rules:
   * 1. If the creep is currently working on a task, it is not assigned to a new task.
   * 2. If the spawn has free capacity, the creep is assigned to haul resources to the spawn.
   * 3. If there are constructions available, the creep is assigned to build the construction.
   * 4. Otherwise, the creep is assigned to upgrade the controller.
   * @param creep The creep to assign the task to
   * @returns The assigned task
   */
  public static assignTask(creep: Creep): BaseTask {
    let request = Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY);
    let spawn = Game.spawns['Spawn1'];
    let controller = spawn.room.controller as StructureController;
    let constructions = spawn.room.find(FIND_MY_CONSTRUCTION_SITES);
    let source = spawn.room.find(FIND_SOURCES_ACTIVE)[0];

    let task = TaskManager.restoreTask(creep);
    if (task == null) {
      // Creep is currently not working on a task
      if (request > 0) {
        request -= creep.store.getUsedCapacity(RESOURCE_ENERGY);
        task = new Hauling(creep, source, spawn);
      } else if (constructions.length > 0) {
        let construction = constructions[0];
        constructions.shift();
        task = new Building(creep, source, construction);
      } else {
        task = new Upgrading(creep, source, controller);
      }
    }

    return task;
  }

  /**
   * Restore a task from a creep's memory.
   * @param creep The creep to restore the task from
   * @returns The restored task or null if the task could not be restored
   */
  public static restoreTask(creep: Creep): BaseTask | null {
    let task = creep.memory['task'];
    if (task == undefined) {
      return null;
    }

    switch (task.task) {
      case 'Hauling':
        return new Hauling(
          creep,
          Game.getObjectById(task.source) as Source,
          Game.getObjectById(task.sink)
        );
      case 'Building':
        if (Game.getObjectById(task.sink) != null) {
          return new Building(
            creep,
            Game.getObjectById(task.source) as Source,
            Game.getObjectById(task.sink)
          );
        }
        return null;
      case 'Upgrading':
        return new Upgrading(
          creep,
          Game.getObjectById(task.source) as Source,
          Game.getObjectById(task.sink)
        );
      default:
        return null;
    }
  }

  /**
   * Executes the task assignment and execution process for all creeps.
   *
   * This method filters all creeps into busy and idle categories based on their
   * memory task state. For busy creeps, it reassigns and executes their tasks,
   * ensuring the task is persisted if not completed. For idle creeps, it assigns
   * them new tasks based on current priorities and executes them, persisting if
   * the task is still active.
   */

  public static run() {
    let busyCreeps = _.filter(
      Game.creeps,
      (creep: Creep) => creep.memory['task'] != undefined
    );
    if (busyCreeps.length > 0) {
      for (let creep of busyCreeps) {
        let task = TaskManager.assignTask(creep);
        task.run();

        // Persist task, if not finished
        if (task.active()) {
          task.persist();
        }
      }
    }
    let idleCreeps = _.filter(
      Game.creeps,
      (creep: Creep) => creep.memory['task'] == undefined
    );
    if (idleCreeps.length > 0) {
      for (let creep of idleCreeps) {
        let task = TaskManager.assignTask(creep);
        task.run();

        // Persist task, if not finished
        if (task.active()) {
          task.persist();
        }
      }
    }
  }
}
