var _ = require('lodash');

export default class ConstructionManager {
  private static instance: ConstructionManager;

  /// Map of construction sites id and the remaining progress needed
  private constructionSites = new Map<string, number>();

  public static getInstance(room: Room): ConstructionManager {
    if (!ConstructionManager.instance) {
      ConstructionManager.instance = new ConstructionManager(room);
    }

    return ConstructionManager.instance;
  }

  private constructor(room: Room) {
    let constructions = room.find(FIND_MY_CONSTRUCTION_SITES);

    for (let construction of constructions) {
      this.constructionSites.set(
        construction.id,
        construction.progressTotal - construction.progress
      );
    }
  }

  public hasWork(): boolean {
    let remainingAmount = 0;
    for (let [id, amount] of this.constructionSites.entries()) {
      if (amount > 0) {
        remainingAmount += amount;
      }
    }
    return remainingAmount > 0;
  }

  public registerWork(amount: number): ConstructionSite | null;
  public registerWork(amount: number, id: string): ConstructionSite | null;
  public registerWork(amount: number, id?: string): ConstructionSite | null {
    if (id) {
      // Register Work on a specific construction site
      let remainingAmount = this.constructionSites.get(id) as number;
      this.constructionSites.set(id, remainingAmount - amount);
      return Game.getObjectById<ConstructionSite>(id);
    } else {
      // Choose a construction site
      for (let [id, remainingAmount] of this.constructionSites.entries()) {
        if (remainingAmount > 0) {
          this.constructionSites.set(id, remainingAmount - amount);
          return Game.getObjectById<ConstructionSite>(id);
        }
      }
    }

    // No construction site found
    return null;
  }
}
