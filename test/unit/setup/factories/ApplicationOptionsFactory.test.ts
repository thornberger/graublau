import "reflect-metadata";
// tslint:disable-next-line:ordered-imports
import {Config} from "../../../../src";
import {ApplicationOptionsFactory} from "../../../../src/setup/factories/ApplicationOptionsFactory";

describe("ApplicationOptionsFactory", () => {

    const OPTIONS = {
        port: 1234,
        logger: {
            format: "plain",
        },
    };

    let config: Partial<Config>;
    let factory: ApplicationOptionsFactory;

    beforeEach(() => {
        config = {};
        factory = new ApplicationOptionsFactory(config as Config);
    });

    it("creates options", () => {
        config.getValue = jest.fn()
            .mockReturnValueOnce(OPTIONS.port)
            .mockReturnValueOnce(OPTIONS.logger);

        const result = factory.create();

        expect(result).toEqual(OPTIONS);
    });
});
