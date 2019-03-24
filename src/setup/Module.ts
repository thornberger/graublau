import ProcessEnv = NodeJS.ProcessEnv;
import express from "express";
import FileSystem from "fs";
import {Container} from "inversify";
import {Config} from "..";
import {ApplicationOptions} from "../application/ApplicationOptions";
import {LoggerOptions} from "../logger/LoggerOptions";
import {TYPES} from "./Types";

export abstract class Module {

    public static readonly Types = TYPES;
    private readonly container: Container;

    public constructor() {
        this.container = new Container({autoBindInjectable: true});

        this.bindBaseDependencies();
        this.bind(this.container);
    }

    public getContainer(): Container {
        return this.container;
    }

    protected abstract bind(container: Container): void;

    protected abstract getConfigPath(): string;

    private bindBaseDependencies(): void {
        this.container.bind<ProcessEnv>(Module.Types.ProcessEnv).toConstantValue(process.env);
        this.container.bind<string>(Module.Types.configPath).toConstantValue(this.getConfigPath());
        this.container.bind(Module.Types.FileSystem).toConstantValue(FileSystem);
        this.container.bind(Module.Types.Express).toConstantValue(express);
        this.container.bind(Module.Types.ExpressApplication).toConstantValue(express());

        const applicationOptions: ApplicationOptions = this.createApplicationOptions();
        this.container.bind<ApplicationOptions>(Module.Types.ApplicationOptions).toConstantValue(applicationOptions);

        const loggerOptions: LoggerOptions = applicationOptions.logger || {};
        this.container.bind<LoggerOptions>(Module.Types.LoggerOptions).toConstantValue(loggerOptions);
    }

    private createApplicationOptions(): ApplicationOptions {
        const config = this.container.get(Config);
        return {
            port: config.getValue(["application", "port"]),
            logger: config.getValue(["application", "logger"], false),
        };
    }
}
