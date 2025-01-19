import BaseTask from './baseTask';

export default class Upgrading extends BaseTask {
  public taskName = 'Upgrading';

  protected work() {
    let returnCode = this.creep.upgradeController(
      this.sink as StructureController
    );
    if (returnCode == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
    } else if (
      returnCode == OK &&
      this.creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0
    ) {
      this.complete();
    }
  }
}
