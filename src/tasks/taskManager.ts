import BaseTask from './baseTask';
import Hauling from './hauling';
import Building from './building';
import Upgrading from './upgrading';

export default class TaskManager {
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
}
