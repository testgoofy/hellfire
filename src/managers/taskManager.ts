var _ = require('lodash');
import BaseTask from '../tasks/baseTask';
import ConstructionManager from './constructionManager';
import Hauling from '../tasks/hauling';
import Building from '../tasks/building';
import Upgrading from '../tasks/upgrading';
import Logger from '../logger';
import {DEFAULT_PREFIX} from './spawningManager';
import MiningSite from '../sites/miningSite';

export default class TaskManager {
  private static instance: TaskManager;

  private constructionManager: ConstructionManager;
  private logger: Logger;

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }

    return TaskManager.instance;
  }

  private constructor() {
    this.constructionManager = ConstructionManager.getInstance();
    this.logger = Logger.getInstance();
  }

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
  private assignTask(creep: Creep): BaseTask {
    let request = Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY);
    let spawn = Game.spawns['Spawn1'];
    let controller = spawn.room.controller as StructureController;
    let source = spawn.room.find(FIND_SOURCES_ACTIVE)[0];

    let task = this.restoreTask(creep);
    if (task == null) {
      // Creep is currently not working on a task
      if (request > 0) {
        request -= creep.store.getUsedCapacity(RESOURCE_ENERGY);
        task = new Hauling(creep, source, spawn);
      } else if (this.constructionManager.hasWork()) {
        let construction = this.constructionManager.registerWork(
          creep.store.getCapacity(RESOURCE_ENERGY)
        );
        task = new Building(creep, source, construction);
      } else {
        task = new Upgrading(creep, source, controller);
      }
      this.logger.debug(`Assign task ${task.taskName}`, creep);
    } else {
      this.logger.trace(`Restore task ${task.taskName}`, creep);
    }

    return task;
  }

  /**
   * Restore a task from a creep's memory.
   * @param creep The creep to restore the task from
   * @returns The restored task or null if the task could not be restored
   */
  private restoreTask(creep: Creep): BaseTask | null {
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
        let construction = this.constructionManager.registerWork(
          creep.store.getUsedCapacity(RESOURCE_ENERGY),
          task.sink
        );
        if (construction != null) {
          return new Building(
            creep,
            Game.getObjectById(task.source) as Source,
            construction
          );
        } else {
          this.logger.warn('Construction not found for building task', creep);
          return null;
        }
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

  public run() {
    this.runUniversals(true);
    this.runUniversals(false);
    this.runMiners();
  }

  private runMiners() {
    let source = Game.spawns['Spawn1'].room.find(FIND_SOURCES_ACTIVE)[0];
    let miningSite = new MiningSite(source);
    let creeps = _.filter(Game.creeps, (creep: Creep) =>
      creep.name.startsWith('Miner')
    );

    if (creeps.length > 0) {
      for (let creep of creeps) {
        if (!creep.pos.isEqualTo(miningSite.dropPoint)) {
          creep.moveTo(miningSite.dropPoint);
        } else {
          creep.harvest(source);
        }
      }
    }
  }

  private runUniversals(busy: boolean) {
    let creeps: Creep[];
    if (busy) {
      creeps = _.filter(
        Game.creeps,
        (creep: Creep) =>
          creep.name.startsWith(DEFAULT_PREFIX) &&
          creep.memory['task'] != undefined
      );
    } else {
      creeps = _.filter(
        Game.creeps,
        (creep: Creep) =>
          creep.name.startsWith(DEFAULT_PREFIX) &&
          creep.memory['task'] == undefined
      );
    }

    if (creeps.length > 0) {
      for (let creep of creeps) {
        let task = this.assignTask(creep);
        task.run();

        // Persist task, if not finished
        if (task.active()) {
          task.persist();
        }
      }
    }
  }
}
