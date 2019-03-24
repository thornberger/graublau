import "reflect-metadata";
import {Config} from "../../../src";
import {ConfigLoader} from "../../../src/config/ConfigLoader";

describe("Config", () => {

    const FIXTURE_SERVICE_NAME = "foo-service";
    const DATA = {
        service: {
            name: FIXTURE_SERVICE_NAME,
            port: "1234",
        },
    };

    let configLoader: Partial<ConfigLoader>;
    let config: Config;

    beforeEach(() => {
        configLoader = {};
    });

    it("loads data only once", () => {
        configLoader.loadConfig = jest.fn().mockReturnValue(DATA);

        config = new Config(configLoader as ConfigLoader);

        const result = config.getValue(["service", "name"]);
        config.getValue(["service", "name"]);

        expect(result).toEqual(FIXTURE_SERVICE_NAME);
        expect(configLoader.loadConfig as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it("gets nested data", () => {
        configLoader.loadConfig = jest.fn().mockReturnValue(DATA);

        config = new Config(configLoader as ConfigLoader);

        const result = config.getValue(["service", "name"]);

        expect(result).toEqual(FIXTURE_SERVICE_NAME);
        expect(configLoader.loadConfig as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it("throws error if required data is not found", () => {
        const expected = new Error("Unable to find required key service.foo in configuration file.");
        configLoader.loadConfig = jest.fn().mockReturnValue(DATA);

        config = new Config(configLoader as ConfigLoader);

        try {
            config.getValue(["service", "foo"]);
        } catch (error) {
            expect(error).toEqual(expected);
        }
    });

    it("throws no error if required data is not found", () => {
        configLoader.loadConfig = jest.fn().mockReturnValue(DATA);

        config = new Config(configLoader as ConfigLoader);

        const result = config.getValue(["service", "foo"], false);

        expect(result).toBeUndefined();
    });

});
