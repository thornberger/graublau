import "reflect-metadata";
import {ConfigLoader} from "../../../src/config/ConfigLoader";

describe("ConfigLoader", () => {
    const CONFIG_PATH = "/path/to/config.json";
    const DATA = {
        foo: "bar",
    };

    let fileSystem: any;
    let configLoader: ConfigLoader;

    beforeEach(() => {
        fileSystem = {};
    });

    it("loads config without error", () => {
        const buffer = Buffer.from(JSON.stringify(DATA), "utf8");
        fileSystem.readFileSync = jest.fn().mockReturnValue(buffer);

        configLoader = new ConfigLoader(CONFIG_PATH,
            fileSystem as { readFileSync: (path: string, options: any) => Buffer });

        const result = configLoader.loadConfig();

        expect(result).toEqual(DATA);
    });

    it("loads config with error", () => {
        const expected = "Unable to load configuration file from /path/to/config.json. Make sure this file exists.";
        fileSystem.readFileSync = jest.fn().mockImplementation(() => {
            throw new Error();
        });

        configLoader = new ConfigLoader(CONFIG_PATH,
            fileSystem as { readFileSync: (path: string, options: any) => Buffer });

        try {
            configLoader.loadConfig();
        } catch (error) {
            expect(error.message).toEqual(expected);
        }
    });

});
