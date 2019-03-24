import {provide} from "inversify-binding-decorators";
import {Config} from "../..";
import {ApplicationOptions} from "../../application/ApplicationOptions";
import {FactoryInterface} from "./FactoryInterface";

@provide(ApplicationOptionsFactory)
export class ApplicationOptionsFactory implements FactoryInterface<ApplicationOptions> {
    private config: Config;

    public constructor(config: Config) {
        this.config = config;
    }

    public create(): ApplicationOptions {
        return {
            port: this.config.getValue(["application", "port"]),
            logger: this.config.getValue(["application", "logger"]),
        };
    }

}
