import BaseTask from './baseTask';
import Hauling from './hauling';
import Upgrading from './upgrading';

export default class TaskManager {
  public static getTask(creep: Creep): BaseTask | null {
    let task = creep.memory['task'];
    if (task == undefined) {
      return null;
    }

    switch (task.task) {
      case 'Hauling':
        return new Hauling(
          creep,
          Game.getObjectById(task.source) as Source,
          Game.getObjectById(task.sink) as StructureSpawn
        );
      case 'Upgrading':
        return new Upgrading(
          creep,
          Game.getObjectById(task.source) as Source,
          Game.getObjectById(task.sink) as StructureController
        );
      default:
        return null;
    }
  }
}
