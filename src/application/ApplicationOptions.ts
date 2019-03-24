import {LogLevel} from "../logger/LogLevel";

export interface ApplicationOptions {
    port: number;
    logger?: {
        format?: "plain" | "json",
        minLogLevel?: LogLevel,
        output?: string,
    };
}
