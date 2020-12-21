import {inject} from "inversify";
import {provide} from "inversify-binding-decorators";
import moment from "moment";
// tslint:disable-next-line:max-line-length
import {
    createLogger,
    format,
    Logger as WinstonLogger,
    LoggerOptions as WinstonLoggerOptions,
    transports
} from "winston";
import {TYPES} from "../setup/Types";
import {LogFormat} from "./LogFormat";
import {LoggerOptions} from "./LoggerOptions";
import {LogLevel} from "./LogLevel";

@provide(Logger)
export class Logger {
    private static readonly COLOR_WHITE = "\x1b[0m";
    private static readonly COLOR_YELLOW = "\x1b[33m";
    private static readonly COLOR_RED = "\x1b[31m";
    private static readonly COLOR_RESET = "\x1b[0m";
    private static readonly OUTPUT_STDOUT = "stdout";

    private winstonLogger: WinstonLogger;

    constructor(@inject(TYPES.LoggerOptions) options: LoggerOptions) {
        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
        this.writeLog = this.writeLog.bind(this);
        this.prepareMessage = this.prepareMessage.bind(this);
        this.flattenContext = this.flattenContext.bind(this);
        this.createWinstonLogger = this.createWinstonLogger.bind(this);
        this.formatPlain = this.formatPlain.bind(this);
        this.formatJson = this.formatJson.bind(this);
        this.colorize = this.colorize.bind(this);
        this.getColorForLevel = this.getColorForLevel.bind(this);

        this.winstonLogger = this.createWinstonLogger(options);
    }

    public debug(message: string | Error, context: object | Error = {}): void {
        this.writeLog(LogLevel.debug, message, context);
    }

    public info(message: string | Error, context: object | Error = {}): void {
        this.writeLog(LogLevel.info, message, context);
    }

    public warn(message: string | Error, context: object | Error = {}): void {
        this.writeLog(LogLevel.warn, message, context);
    }

    public error(message: string | Error, context: object | Error = {}): void {
        this.writeLog(LogLevel.error, message, context);
    }

    private writeLog(level: LogLevel, message: string | Error, context: object | Error) {
        const prepared = this.prepareMessage(message, context);
        const meta = {context: prepared.context};

        this.winstonLogger.log(level as string, prepared.message, meta);
    }

    private prepareMessage(message: string | Error, context: { [key: string]: any } | Error):
        { message: string, context: { [key: string]: string } } {
        if (context instanceof Error) {
            context = {
                error: context.message,
                stacktrace: context.stack,
            };

        } else {
            context = Object.assign({}, context);
        }

        if (message instanceof Error) {
            context = {
                stacktrace: message.stack,
            };

            message = message.message;
        }

        const flattenedContext = this.flattenContext(context);

        return {message, context: flattenedContext};
    }

    private flattenContext(context: { [key: string]: any }): { [key: string]: string } {
        Object.keys(context).forEach((key) => {
            let value = (context as any)[key];
            if (typeof value === "object") {
                value = JSON.stringify(value);
                (context as any)[key] = value;
            }
        });

        return context;
    }

    private createWinstonLogger(options: LoggerOptions) {
        const minLogLevel = options.minLogLevel || LogLevel.info;
        const output = options.output || Logger.OUTPUT_STDOUT;
        const outputFormat = options.format || LogFormat.plain;

        let transport;

        if (output === Logger.OUTPUT_STDOUT) {
            transport = new transports.Console();
        } else {
            transport = new transports.File({filename: output});
        }

        const winstonOptions: WinstonLoggerOptions = {
            level: minLogLevel,
            format: format.combine(
                format.timestamp(),
                format.printf(outputFormat === LogFormat.json ? this.formatJson : this.formatPlain),
            ),
            transports: [transport],
        };

        return createLogger(winstonOptions);
    }

    private formatPlain(info: any): string {
        let timestamp: string = info.timestamp;
        let level: string = info.level;
        const message: string = info.message;
        const mainColor = this.getColorForLevel(level);

        timestamp = "[" + timestamp + "]";
        level = level.toUpperCase();
        level = this.colorize(level, mainColor);

        let output = `${timestamp} ${level} ${message}`;

        Object.keys(info.context).forEach((key) => {
            const value = (info.context as any)[key];

            output += `\n\t${key}: ${value}`;
        });

        return output;
    }

    private formatJson(info: any): string {
        const timestamp: string = info.timestamp;
        const level: string = info.level;
        const message: string = info.message;
        const context: string | undefined = info.context;

        const output = Object.assign({
            timestamp: moment(timestamp).utc().toDate().toISOString(),
            level,
            message,
        }, context);

        return JSON.stringify(output);
    }

    private colorize(text: string, color: string): string {
        return color + text + Logger.COLOR_RESET;
    }

    private getColorForLevel(level: string): string {
        switch (level) {
            case "error":
                return Logger.COLOR_RED;
            case "warn":
                return Logger.COLOR_YELLOW;
            default:
                return Logger.COLOR_WHITE;

        }
    }
}
