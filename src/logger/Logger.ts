import {Logger as WinstonLogger} from "winston";
import {LogLevel} from "./LogLevel";

export class Logger {
    private winstonLogger: WinstonLogger;

    constructor(winstonLogger: WinstonLogger) {
        this.winstonLogger = winstonLogger;

        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
        this.writeLog = this.writeLog.bind(this);
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
}
