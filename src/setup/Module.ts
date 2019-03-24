import ProcessEnv = NodeJS.ProcessEnv;
import express from "express";
import FileSystem from "fs";
import {Container} from "inversify";
import {Logger} from "..";
import {ApplicationOptions} from "../application/ApplicationOptions";
import {ApplicationOptionsFactory} from "./factories/ApplicationOptionsFactory";
import {LoggerFactory} from "./factories/LoggerFactory";
import {TYPES} from "./Types";

export abstract class Module {

    private readonly container: Container;

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
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
        this.container.bind<ProcessEnv>(TYPES.ProcessEnv).toConstantValue(process.env);
        this.container.bind<string>(TYPES.configPath).toConstantValue(this.getConfigPath());
        this.container.bind(TYPES.FileSystem).toConstantValue(FileSystem);
        this.container.bind(TYPES.Express).toConstantValue(express);
        this.container.bind(TYPES.ExpressApplication).toConstantValue(express());

        const applicationOptions: ApplicationOptions = this.container.get(ApplicationOptionsFactory).create();
        this.container.bind(TYPES.ApplicationOptions).toConstantValue(applicationOptions);

        const logger: Logger = this.container.get(LoggerFactory).create();
        this.container.bind(Logger).toConstantValue(logger);
    }

}
