import BaseTask from './baseTask';

export default class Building extends BaseTask {
  protected taskName = 'Building';

  protected work() {
    let returnCode = this.creep.build(this.sink);
    if (returnCode == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
    } else if (returnCode == OK && Game.getObjectById(this.sink.id) == null) {
      this.complete();
    }
  }
}
