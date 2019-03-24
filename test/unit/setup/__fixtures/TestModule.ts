import "reflect-metadata";
// tslint:disable-next-line:ordered-imports
import {Container} from "inversify";
import {Module} from "../../../../src";

export class TestModule extends Module {
    protected bind(container: Container): void {
        container.bind("foo").toConstantValue("bar");
    }

    protected getConfigPath(): string {
        return __dirname + "/config.json";
    }
}
