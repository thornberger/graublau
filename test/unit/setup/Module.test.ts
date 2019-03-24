import "reflect-metadata";
import {Module} from "../../../src";
import {TYPES} from "../../../src/setup/Types";
// tslint:disable-next-line:ordered-imports
import {TestModule} from "./__fixtures/TestModule";

describe("Module", () => {

    let module: Module;

    beforeEach(() => {
        module = new TestModule();
    });

    it("binds basic dependencies", () => {
        const result = module.getContainer().get("foo");

        expect(result).toBe("bar");
    });

    it("binds dependencies from child class", () => {
        const expected = {
            port: 1234,
            logger: {
                format: "plain",
            },
        };
        const result = module.getContainer().get(TYPES.ApplicationOptions);

        expect(result).toEqual(expected);
    });
});
