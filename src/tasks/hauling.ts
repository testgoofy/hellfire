import BaseTask from './baseTask';

export default class Hauling extends BaseTask {
  protected work() {
    if (this.creep.transfer(this.sink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
}
