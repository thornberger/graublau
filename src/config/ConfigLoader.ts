import {inject} from "inversify";
import {provide} from "inversify-binding-decorators";
import {TYPES} from "../setup/Types";

@provide(ConfigLoader)
export class ConfigLoader {
    private readonly configPath: string;
    private fileSystem: { readFileSync: (path: string, options: any) => Buffer };

    constructor(@inject(TYPES.configPath) configPath: string,
                @inject(TYPES.FileSystem) fileSystem: { readFileSync: (path: string, options: any) => Buffer }) {
        this.configPath = configPath;
        this.fileSystem = fileSystem;
    }

    public loadConfig(): { [id: string]: any; } {
        const data = this.loadFileData();
        return JSON.parse(data);
    }

    private loadFileData(): string {
        const options = {encoding: "utf8"};
        let data: Buffer;

        try {
            data = this.fileSystem.readFileSync(this.configPath, options);
            return data.toString();
        } catch (error) {
            const message: string = "Unable to load configuration file from " +
                this.configPath +
                ". Make sure this file exists.";
            throw new Error(message);
        }
    }

}
