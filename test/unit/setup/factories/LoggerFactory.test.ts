import "reflect-metadata";
// tslint:disable-next-line:ordered-imports
import fs from "fs";
import moment from "moment";
import {ApplicationOptions} from "../../../../src/application/ApplicationOptions";
import {LogLevel} from "../../../../src/logger/LogLevel";
import {LoggerFactory} from "../../../../src/setup/factories/LoggerFactory";

describe("LoggerFactory", () => {

    const FIXTURE_MESSAGE = "I'm out of tea!";
    const FIXTURE_CONTEXT = {
        hello: "world",
    };
    const PLAIN_LOG_PATTERN = /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)] \x1B\[\d+m(.+)\x1B\[0m (.+)/;
    const LOG_FILE_PATH = __dirname + "/file.log";

    let options: Partial<ApplicationOptions>;
    let factory: LoggerFactory;

    let consoleOutput = "";
    let decodedOutput: any;

    global.console = {
        log: (message: string) => {
            consoleOutput += message;
        },
    } as any;

    beforeEach(() => {
        consoleOutput = "";
        decodedOutput = undefined;
        options = {
            logger: {
                format: "plain",
                minLogLevel: LogLevel.debug,
                output: "stdout",
            },
        };

        if (fs.existsSync(LOG_FILE_PATH)) {
            fs.unlinkSync(LOG_FILE_PATH);
        }
    });

    it("creates logger from default values", async () => {
        options.logger! = {};
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.info(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectOutputOnStdout();
        await expectPlainOutput();
    });

    it("creates plain logger, ignoring messages lower min log level", async () => {
        options.logger!.format = "plain";
        options.logger!.minLogLevel = LogLevel.warn;
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.debug(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectNoOutput();
    });

    it("creates plain logger with level debug", async () => {
        options.logger!.format = "plain";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.debug(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.debug);
    });

    it("creates plain logger with level info", async () => {
        options.logger!.format = "plain";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.info(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.info);
    });

    it("creates plain logger with level warn", async () => {
        options.logger!.format = "plain";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.warn(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.warn);
    });

    it("creates plain logger with level error", async () => {
        options.logger!.format = "plain";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.error(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.error);
    });

    it("creates json logger with level info", async () => {
        options.logger!.format = "json";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.info(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.info);
    });

    it("creates json logger with level warn", async () => {
        options.logger!.format = "json";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.warn(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.warn);
    });

    it("creates json logger with level error", async () => {
        options.logger!.format = "json";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.error(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.error);
    });

    it("creates json logger with file output", async () => {
        options.logger!.format = "json";
        options.logger!.output = LOG_FILE_PATH;

        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.warn(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.warn);
    });

    it("creates plain logger with file output", async () => {
        options.logger!.format = "json";
        factory = new LoggerFactory(options as ApplicationOptions);

        const logger = factory.create();

        logger.warn(FIXTURE_MESSAGE, FIXTURE_CONTEXT);

        await expectLogResult(LogLevel.warn);
    });

    const expectLogResult = async (level: LogLevel) => {
        await expectLevel(level);
        await expectTimestampNotOlderThan(1000);
        await expectMessage(FIXTURE_MESSAGE);
        await expectContext(FIXTURE_CONTEXT);
    };

    const getData = async () => {
        if (decodedOutput) {
            return decodedOutput;
        }

        const outputData = await getOutputData();
        console.log(outputData);

        try {
            decodedOutput = JSON.parse(outputData);
        } catch (error) {
            const matches = outputData.match(PLAIN_LOG_PATTERN);

            if (!matches || matches.length !== 4) {
                throw new Error("Unexpected output: " + outputData);
            }

            decodedOutput = {};
            decodedOutput.timestamp = matches[1];
            decodedOutput.level = matches[2].toLowerCase();
            decodedOutput.message = matches[3];

            const contextString = outputData.substr(matches[0].length);
            const contextPattern = /\n\t([a-zA-Z]+): /g;
            const contextSplit = contextString.split(contextPattern);

            const context: any = {};

            if (contextSplit.length > 1) {
                for (let i = 1; i < contextSplit.length - 1; i = i + 2) {
                    context[contextSplit[i]] = contextSplit[i + 1];
                }
            }

            decodedOutput = Object.assign(decodedOutput, context);
        }

        return decodedOutput;
    };

    const getOutputData = async (): Promise<string> => {
        return new Promise<string>((resolve) => {
            setTimeout(async () => {
                if (fs.existsSync(LOG_FILE_PATH)) {
                    const result = fs.readFileSync(LOG_FILE_PATH, {encoding: "utf8"});
                    resolve(result);
                }

                resolve(consoleOutput);
            }, 500);
        });
    };

    const expectOutputOnStdout = async () => {
        return consoleOutput.length > 0;
    };

    const expectPlainOutput = async (): Promise<boolean> => {
        const data = await getOutputData();
        return !!data.match(PLAIN_LOG_PATTERN);
    };

    const expectNoOutput = async () => {
        const data = await getOutputData();

        expect(data).toEqual("");
    };

    const expectTimestampNotOlderThan = async (notOlderThanMilliSeconds: number) => {
        const data = await getData();
        const timestamp = data.timestamp;
        const timeDifference = moment().valueOf() - moment(timestamp).valueOf();

        expect(timeDifference).toBeLessThan(notOlderThanMilliSeconds);
    };

    const expectLevel = async (expected: string) => {
        const data = await getData();
        const level = data.level;

        expect(level).toBe(expected);
    };

    const expectMessage = async (expected: string) => {
        const data = await getData();
        const message = data.message;

        expect(message).toBe(expected);
    };

    const expectContext = async (expected: { [key: string]: string }) => {
        const data = await getData();

        Object.keys(expected).forEach((key) => {
            expect(data[key]).toBe(expected[key]);
        });
    };

});
