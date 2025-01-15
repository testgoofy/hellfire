export default class Upgrading {
  constructor(
    public creep: Creep,
    public source: Source,
    public sink: StructureController
  ) {
    if (creep.memory['busy'] == undefined) {
      creep.memory['busy'] = false; // Default to gathering resources
      this.update();
    }
  }

  public run() {
    this.update();

    if (this.creep.memory['busy']) {
      // Upgrading
      if (this.creep.upgradeController(this.sink) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(this.sink, {visualizePathStyle: {stroke: '#ffffff'}});
      }
    } else {
      // Harvesting
      if (this.creep.harvest(this.source) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(this.source, {
          visualizePathStyle: {stroke: '##ffaa00'},
        });
      }
    }
  }

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
      // Creep wants to work, but has not enough energy
      this.creep.memory['busy'] = false;
    } else if (
      !this.creep.memory['busy'] &&
      this.creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
    ) {
      // Creep wants to harvest, but has no more free capacity
      this.creep.memory['busy'] = true;
    }
  }
}
