import {LogFormat} from "./LogFormat";
import {LogLevel} from "./LogLevel";

export interface LoggerOptions {
    format?: LogFormat;
    minLogLevel?: LogLevel;
    output?: string;
}
