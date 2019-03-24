import "reflect-metadata";
// tslint:disable-next-line
import express from "express";
import {Application} from "../../../src";
import {ResourceInterface} from "../../../src";
import {Logger} from "../../../src";
import {ApplicationOptions} from "../../../src/application/ApplicationOptions";
import {LogFormat} from "../../../src/logger/LogFormat";

describe("Application", () => {
    const RESOURCE_NAME = "foo";
    const ERROR_MESSAGE = "I'm out of tea!";
    const OPTIONS: ApplicationOptions = {
        port: 1234,
        logger: {
            format: LogFormat.plain,
        },
    };

    let resource: Partial<ResourceInterface>;
    let router: Partial<express.Router>;
    let expressApplication: Partial<express.Application>;
    let logger: Partial<Logger>;

    let application: Application;

    beforeEach(() => {
        resource = {
            getRoutes: jest.fn(),
        };
        router = {};
        expressApplication = {
            use: jest.fn(),
        };
        logger = {
            info: jest.fn(),
            error: jest.fn(),
        };

        application = new Application(expressApplication as express.Application, OPTIONS, logger as Logger);
    });

    it("adds resource", () => {
        resource.getRoutes = jest.fn().mockReturnValue(router as express.Router);

        application.addResource(RESOURCE_NAME, resource as ResourceInterface);

        expect(expressApplication.use as jest.Mock).toHaveBeenCalledWith("/" + RESOURCE_NAME, router);
    });

    it("starts without error", () => {
        const error = new Error(ERROR_MESSAGE);
        // @ts-ignore
        expressApplication.listen = jest.fn().mockImplementation((port: number, callback: (error: Error) => {}) => {
            callback(error);
        });

        application.start();

        expect(logger.error as jest.Mock).toHaveBeenCalledWith(error);
    });

    it("starts with error", () => {
        expressApplication.listen = jest.fn()
            // @ts-ignore
            .mockImplementation((port: number, callback: (error: Error | undefined) => {}) => {
            callback(undefined);
        });

        application.start();

        expect(logger.info as jest.Mock).toHaveBeenCalled();
    });
});
