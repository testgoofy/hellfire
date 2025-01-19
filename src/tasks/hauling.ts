import BaseTask from './baseTask';

export default class Hauling extends BaseTask {
  public taskName = 'Hauling';

  protected work() {
    let returnCode = this.creep.transfer(this.sink, RESOURCE_ENERGY);
    if (returnCode == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
    } else if (returnCode == OK || returnCode == ERR_FULL) {
      this.complete();
    }
  }
}
