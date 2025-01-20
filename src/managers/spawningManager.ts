var _ = require('lodash');
import Logger from '../logger';

const DEFAULT_PREFIX = 'Universal';

export default class SpawningManager {
  private static instance: SpawningManager;

  private logger = Logger.getInstance();
  private offerings: Map<string, BodyPartConstant[]> = new Map();
  private requests: Map<string, BodyPartConstant[]> = new Map();

  public static getInstance(): SpawningManager {
    if (!SpawningManager.instance) {
      SpawningManager.instance = new SpawningManager();
    }

    return SpawningManager.instance;
  }

  private constructor() {}

  public initialize() {
    this.offerings = new Map<string, BodyPartConstant[]>();
    this.requests = new Map<string, BodyPartConstant[]>();

    for (let name in Game.creeps) {
      if (!name.startsWith(DEFAULT_PREFIX)) {
        this.offerings.set(name, _.map(Game.creeps[name].body, 'type'));
      }
    }
    this.logger.trace(
      'Initialized SpawningManager with ' + this.offerings.size + ' offerings'
    );
  }

  public requestCreep(namePrefix: string, body: BodyPartConstant[]) {
    let matchingOfferings = new Map<string, BodyPartConstant[]>();

    for (let [name, offering] of this.offerings) {
      if (name.startsWith(namePrefix)) {
        matchingOfferings.set(name, offering);
      }
    }

    if (matchingOfferings.size > 0) {
      this.logger.trace('Request for ' + namePrefix + ' already satisfied');
      let name = _.sample(Array.from(matchingOfferings.keys()));
      this.offerings.delete(name);
    } else {
      this.logger.trace('Request for ' + namePrefix + ' not satisfied');
      this.requests.set(namePrefix, body);
    }
  }

  public run() {
    // Clean up dead creeps
    for (let creep in Memory.creeps) {
      if (!Game.creeps[creep]) {
        this.logger.info('Deleting dead creep ' + creep);
        delete Memory.creeps[creep];
      }
    }

    // Spawn universal creeps
    if (
      _.filter(Object.keys(Game.creeps), (creep: string) =>
        creep.startsWith(DEFAULT_PREFIX)
      ).length < 3
    ) {
      let name = DEFAULT_PREFIX + Game.time;
      if (Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], name) == OK) {
        this.logger.info('Spawning ' + name);
      }
    }

    // Spawn requested creeps
    for (let [namePrefix, body] of this.requests) {
      if (
        Game.spawns['Spawn1'].spawnCreep(body, namePrefix + Game.time) == OK
      ) {
        this.logger.info('Spawning ' + namePrefix + Game.time);
      }
    }
  }
}
