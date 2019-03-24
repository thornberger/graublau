import {inject} from "inversify";
import {provide} from "inversify-binding-decorators";
import moment from "moment";
import {createLogger, format, LoggerOptions, transports} from "winston";
import {Logger} from "../..";
import {ApplicationOptions} from "../../application/ApplicationOptions";
import {LogLevel} from "../../logger/LogLevel";
import {TYPES} from "../Types";
import {FactoryInterface} from "./FactoryInterface";

@provide(LoggerFactory)
export class LoggerFactory implements FactoryInterface<Logger> {

    private static readonly COLOR_WHITE = "\x1b[0m";
    private static readonly COLOR_YELLOW = "\x1b[33m";
    private static readonly COLOR_RED = "\x1b[31m";
    private static readonly COLOR_RESET = "\x1b[0m";
    private static readonly OUTPUT_STDOUT = "stdout";

    private static readonly FORMAT_PLAIN = "plain";
    private static readonly FORMAT_JSON = "json";

    private options: ApplicationOptions;

    public constructor(@inject(TYPES.ApplicationOptions) options: ApplicationOptions) {
        this.options = options;
        this.formatPlain = this.formatPlain.bind(this);
        this.colorize = this.colorize.bind(this);
        this.getColorForLevel = this.getColorForLevel.bind(this);
    }

    public create(): Logger {
        const configuration = this.options.logger;

        const minLogLevel = (configuration as any).minLogLevel || LogLevel.info;
        const output = (configuration as any).output || LoggerFactory.OUTPUT_STDOUT;
        const outputFormat = (configuration as any).format || LoggerFactory.FORMAT_PLAIN;

        let transport;

        if (output === LoggerFactory.OUTPUT_STDOUT) {
            transport = new transports.Console();
        } else {
            transport = new transports.File({filename: output});
        }

        const options: LoggerOptions = {
            level: minLogLevel,
            format: format.combine(
                format.timestamp(),
                format.printf(outputFormat === LoggerFactory.FORMAT_JSON ? this.formatJson : this.formatPlain),
            ),
            transports: [transport],
        };
        const winstonLogger = createLogger(options);

        return new Logger(winstonLogger);
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

    private formatPlain(info: any): string {
        let timestamp: string = info.timestamp;
        let level: string = info.level;
        const message: string = info.message;
        const context: string | undefined = info.context;
        const mainColor = this.getColorForLevel(level);

        timestamp = "[" + timestamp + "]";
        level = level.toUpperCase();
        level = this.colorize(level, mainColor);

        let output = `${timestamp} ${level} ${message}`;

        if (context) {
            Object.keys(info.context).forEach((key) => {
                const value = (info.context as any)[key];

                output += `\n\t${key}: ${value}`;
            });
        }

        return output;
    }

    private colorize(text: string, color: string): string {
        return color + text + LoggerFactory.COLOR_RESET;
    }

    private getColorForLevel(level: string): string {
        switch (level) {
            case "error":
                return LoggerFactory.COLOR_RED;
            case "warn":
                return LoggerFactory.COLOR_YELLOW;
            default:
                return LoggerFactory.COLOR_WHITE;

        }
    }
}
