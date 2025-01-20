import Logger from '../logger';
import SpawningManager from '../managers/spawningManager';

var _ = require('lodash');

export default class MiningSite {
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

  public run() {
    let structures = this.dropPoint.lookFor(LOOK_STRUCTURES);
    if (structures.length > 0) {
      let spawningManager = SpawningManager.getInstance();
      spawningManager.requestCreep('Miner', [MOVE, WORK, WORK]);
    }
  }
}
