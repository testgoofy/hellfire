export default abstract class BaseTask {
  protected abstract taskName: string;

  constructor(public creep: Creep, public source: Source, public sink: any) {
    if (creep.memory['busy'] == undefined) {
      creep.memory['busy'] = false; // Default to gathering resources
      this.update();
    }
  }

  public active() {
    return this.creep.memory['busy'] != undefined;
  }

  /**
   * Completes the current task by clearing the creep's memory of its busy state
   * and task information, indicating it is no longer assigned to any task.
   */
  protected complete() {
    delete this.creep.memory['busy'];
    delete this.creep.memory['task'];
  }

  public persist() {
    this.creep.memory['task'] = {
      task: this.taskName,
      source: this.source.id,
      sink: this.sink.id,
    };
  }

  public run() {
    this.update();

    if (this.creep.memory['busy']) {
      this.work();
    } else {
      // Harvesting
      let returnCode = this.creep.harvest(this.source);
      if (returnCode == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(this.source, {
          visualizePathStyle: {stroke: '##ffaa00'},
        });
      } else if (returnCode == OK) {
        this.complete();
      }
    }
  }

  protected abstract work(): void;

  /**
   * Update the busy state of the creep.
   *
   * If the creep is supposed to work (busy == true), but has not enough energy,
   * set busy to false.
   *
   * If the creep is not supposed to work (busy == false), but has no more free
   * capacity in its store, set busy to true.
   */
  private update() {
    if (this.creep.memory['busy'] && this.creep.store[RESOURCE_ENERGY] == 0) {
      // Creep is in the working state, but has no more energy
      // Creeps has successfully completed the task
      this.complete();
    } else if (
      !this.creep.memory['busy'] &&
      this.creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
    ) {
      // Creep wants to harvest, but has no more free capacity
      this.creep.memory['busy'] = true;
    }
  }
}
