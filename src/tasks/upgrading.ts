import BaseTask from './baseTask';

export default class Upgrading extends BaseTask {
  protected work() {
    if (
      this.creep.upgradeController(this.sink as StructureController) ==
      ERR_NOT_IN_RANGE
    ) {
      this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
}
