export default class Logger {
  public static TRACE = 0;
  public static DEBUG = 1;
  public static INFO = 2;
  public static WARN = 3;
  public static ERROR = 4;
  public static FATAL = 5;

  private static instance: Logger;

  private level = Logger.INFO;

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  private constructor() {}

  public debug(message: string): void;
  public debug(message: string, creep: Creep | undefined): void;
  public debug(message: string, creep?: Creep) {
    if (this.level <= Logger.DEBUG) {
      this.printLog('DEBUG', message, creep);
    }
  }

  public error(message: string): void;
  public error(message: string, creep: Creep | undefined): void;
  public error(message: string, creep?: Creep) {
    if (this.level <= Logger.ERROR) {
      this.printLog('ERROR', message, creep);
    }
  }

  public fatal(message: string): void;
  public fatal(message: string, creep: Creep | undefined): void;
  public fatal(message: string, creep?: Creep) {
    if (this.level <= Logger.FATAL) {
      this.printLog('FATAL', message, creep);
    }
  }

  public info(message: string): void;
  public info(message: string, creep: Creep | undefined): void;
  public info(message: string, creep?: Creep) {
    if (this.level <= Logger.INFO) {
      this.printLog('INFO', message, creep);
    }
  }

  public log(level: number, message: string): void;
  public log(level: number, message: string, creep: Creep): void;
  public log(level: number, message: string, creep?: Creep) {
    switch (level) {
      case Logger.TRACE:
        this.trace(message, creep);
        break;
      case Logger.DEBUG:
        this.debug(message, creep);
        break;
      case Logger.INFO:
        this.info(message, creep);
        break;
      case Logger.WARN:
        this.warn(message, creep);
        break;
      case Logger.ERROR:
        this.error(message, creep);
        break;
      case Logger.FATAL:
        this.fatal(message, creep);
        break;
    }
  }

  public trace(message: string): void;
  public trace(message: string, creep: Creep | undefined): void;
  public trace(message: string, creep?: Creep) {
    if (this.level <= Logger.TRACE) {
      this.printLog('TRACE', message, creep);
    }
  }

  private printLog(level: string, message: string, creep: Creep): void;
  private printLog(
    level: string,
    message: string,
    creep: Creep | undefined
  ): void;
  private printLog(level: string, message: string): void;
  private printLog(level: string, message: string, creep?: Creep) {
    if (creep) {
      console.log(
        level.padStart(5) +
          ' | ' +
          String(Game.time).padStart(7) +
          ' | ' +
          creep.name +
          ' | ' +
          message
      );
    } else {
      console.log(
        level.padStart(5) +
          ' | ' +
          String(Game.time).padStart(7) +
          ' | ' +
          message
      );
    }
  }

  public setLevel(level: number) {
    this.level = level;
  }

  public warn(message: string): void;
  public warn(message: string, creep: Creep | undefined): void;
  public warn(message: string, creep?: Creep) {
    if (this.level <= Logger.WARN) {
      this.printLog('WARN', message, creep);
    }
  }
}
