import Logger from '../logger';
import SpawningManager from '../managers/spawningManager';

var _ = require('lodash');

export default class MiningSite {
  private container: StructureContainer | null = null;
  public dropPoint: RoomPosition;
  private logger = Logger.getInstance();
  private poi: Source;
  private initialized: boolean;

  public constructor(source: Source) {
    this.poi = source;

    // Memory initialization
    if (Memory['sites'] == undefined) {
      Memory['sites'] = {};
    }

    if (Memory['sites'][this.poi.id] == undefined) {
      Memory['sites'][this.poi.id] = {
        initialized: false,
        dropPoint: {
          x: source.pos.x,
          y: source.pos.y,
        },
      };
    }
    this.initialized = Memory['sites'][this.poi.id]['initialized'];

    if (!this.initialized) {
      this.initialize(source);
    }

    this.dropPoint = new RoomPosition(
      Memory['sites'][this.poi.id]['dropPoint']['x'],
      Memory['sites'][this.poi.id]['dropPoint']['y'],
      source.room.name
    );

    // Get container
    let structures = _.filter(
      this.dropPoint.lookFor(LOOK_STRUCTURES),
      (structure: Structure) => structure.structureType == STRUCTURE_CONTAINER
    );
    if (structures.length > 0) {
      this.container = structures[0];
    }
  }

  public harvest(creep: Creep) {
    if (this.container) {
      return creep.withdraw(this.container, RESOURCE_ENERGY);
    } else {
      return creep.harvest(this.poi);
    }
  }

  private initialize(source: Source) {
    this.logger.info(
      'Initializing mining site at (' + source.pos.x + ',' + source.pos.y + ')'
    );

    // Find potential drop points
    let potentialDropPoints = _.filter(
      source.room.lookAtArea(
        source.pos.y - 1,
        source.pos.x - 1,
        source.pos.y + 1,
        source.pos.x + 1,
        true
      ),
      (terrain: any) =>
        terrain.type == 'terrain' &&
        (terrain.x != source.pos.x || terrain.y != source.pos.y) &&
        (terrain.terrain == 'plain' || terrain.terrain == 'swamp')
    );

    // Find closest drop point
    let bestDropPoint = potentialDropPoints[0];
    let bestDropPointDistance = source.pos.findPathTo(
      bestDropPoint.x,
      bestDropPoint.y
    ).length;
    for (let potentialDropPoint of potentialDropPoints) {
      let potentialDropPointDistance = source.pos.findPathTo(
        potentialDropPoint.x,
        potentialDropPoint.y
      ).length;
      if (potentialDropPointDistance < bestDropPointDistance) {
        bestDropPoint = potentialDropPoint;
        bestDropPointDistance = potentialDropPointDistance;
      }
    }

    // Persist Memory
    this.initialized = true;
    Memory['sites'][this.poi.id] = {
      initialized: true,
      dropPoint: {
        x: bestDropPoint.x,
        y: bestDropPoint.y,
      },
    };

    // Build container at drop point
    this.poi.room.createConstructionSite(
      bestDropPoint.x,
      bestDropPoint.y,
      STRUCTURE_CONTAINER
    );
  }

  public moveTo(creep: Creep) {
    if (this.container) {
      return creep.moveTo(this.container);
    } else {
      return creep.moveTo(this.poi);
    }
  }

  public run() {
    if (this.container) {
      let spawningManager = SpawningManager.getInstance();
      spawningManager.requestCreep('Miner', [MOVE, WORK, WORK]);
    }
  }
}
