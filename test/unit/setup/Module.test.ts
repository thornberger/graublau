import "reflect-metadata";
import {Application, Config, Logger, Module} from "../../../src";
import {TYPES} from "../../../src/setup/Types";
import {TestModule} from "./__fixtures/TestModule";

describe("Module", () => {

    const CONFIG_PATH_WITH_LOGGER = __dirname + "/__fixtures/config.json";
    const CONFIG_PATH_WITHOUT_LOGGER = __dirname + "/__fixtures/config_no_logger.json";

    let module: Module;

    it("binds basic dependencies", () => {
        module = new TestModule(CONFIG_PATH_WITH_LOGGER);
        const result = module.getContainer().get("foo");

        expect(result).toBe("bar");
    });

    it("binds Application", () => {
        module = new TestModule(CONFIG_PATH_WITH_LOGGER);
        const result = module.getContainer().get(Application);

        expect(result).toBeInstanceOf(Application);
    });

    it("binds Config", () => {
        module = new TestModule(CONFIG_PATH_WITH_LOGGER);
        const result = module.getContainer().get(Config);

        expect(result).toBeInstanceOf(Config);
    });

    it("binds Logger", () => {
        module = new TestModule(CONFIG_PATH_WITH_LOGGER);
        const result = module.getContainer().get(Logger);

        expect(result).toBeInstanceOf(Logger);
    });

    it("binds dependencies from child class", () => {
        const expected = {
            port: 1234,
            logger: {
                format: "plain",
            },
        };

        module = new TestModule(CONFIG_PATH_WITH_LOGGER);
        const result = module.getContainer().get(TYPES.ApplicationOptions);

        expect(result).toEqual(expected);
    });

    it("uses default logger options", () => {
        const expected = {
            port: 1234,
        };

        module = new TestModule(CONFIG_PATH_WITHOUT_LOGGER);
        const result = module.getContainer().get(TYPES.ApplicationOptions);

        expect(result).toEqual(expected);
    });
});
