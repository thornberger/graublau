import "reflect-metadata";
import {Logger as WinstonLogger} from "winston";
import {Logger} from "../../../src";
import {LogLevel} from "../../../src/logger/LogLevel";

describe("Logger", () => {
    const MESSAGE = "hello world";
    const ERROR_MESSAGE = "something really bad happened";
    const ERROR_STACK = "in world.js";

    let winstonLogger: Partial<WinstonLogger>;
    let logger: Logger;

    beforeEach(() => {
        winstonLogger = {
            log: jest.fn(),
        };
        logger = new Logger(winstonLogger as WinstonLogger);

    });

    it("logs debug", () => {
        logger.debug(MESSAGE);

        expect(winstonLogger.log as jest.Mock).toBeCalledWith(LogLevel.debug, MESSAGE, {context: {}});
    });

    it("logs info", () => {
        logger.info(MESSAGE);

        expect(winstonLogger.log as jest.Mock).toBeCalledWith(LogLevel.info, MESSAGE, {context: {}});
    });

    it("logs warn", () => {
        logger.warn(MESSAGE);

        expect(winstonLogger.log as jest.Mock).toBeCalledWith(LogLevel.warn, MESSAGE, {context: {}});
    });

    it("logs error", () => {
        logger.error(MESSAGE);

        expect(winstonLogger.log as jest.Mock)
            .toBeCalledWith(LogLevel.error, MESSAGE, {context: {}});
    });

    it("serializes object context", () => {
        const context = {
            bar: {
                a: 12,
                b: "foo",
            },
        };
        const expectedContext = {
            bar: '{"a":12,"b":"foo"}',
        };

        logger.error(MESSAGE, context);

        expect(winstonLogger.log as jest.Mock)
            .toBeCalledWith(LogLevel.error, MESSAGE, {context: expectedContext});
    });

    it("serializes error message", () => {
        const error = new Error(ERROR_MESSAGE);
        error.stack = ERROR_STACK;
        const expectedContext = {
            stacktrace: ERROR_STACK,
        };

        logger.error(error);

        expect(winstonLogger.log as jest.Mock)
            .toBeCalledWith(LogLevel.error, ERROR_MESSAGE, {context: expectedContext});
    });

    it("serializes error context", () => {
        const error = new Error(ERROR_MESSAGE);
        error.stack = ERROR_STACK;
        const expectedContext = {
            error: ERROR_MESSAGE,
            stacktrace: ERROR_STACK,
        };

        logger.error(MESSAGE, error);

        expect(winstonLogger.log as jest.Mock)
            .toBeCalledWith(LogLevel.error, MESSAGE, {context: expectedContext});
    });
});
