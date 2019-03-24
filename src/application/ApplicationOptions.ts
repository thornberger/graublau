import {LoggerOptions} from "../logger/LoggerOptions";

export interface ApplicationOptions {
    port: number;
    logger?: LoggerOptions;
}
