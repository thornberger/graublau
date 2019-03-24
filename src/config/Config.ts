import {provide} from "inversify-binding-decorators";
import {ConfigLoader} from "./ConfigLoader";

@provide(Config)
export class Config {
    private data?: object;
    private configLoader: ConfigLoader;

    public constructor(configLoader: ConfigLoader) {
        this.configLoader = configLoader;
    }

    public getValue(keys: string[], required: boolean = true): any {
        let data: any = this.getData();

        for (const key of keys) {
            if (!data || !data.hasOwnProperty(key)) {
                if (required) {
                    throw new Error("Unable to find required key " + keys.join(".") + " in configuration file.");
                }

                return undefined;
            }
            data = (data as any)[key];
        }

        return data;
    }

    private getData(): any {
        if (!this.data) {
            this.data = this.configLoader.loadConfig();
        }
        return this.data;
    }
}
