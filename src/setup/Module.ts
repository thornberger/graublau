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

    public static readonly Types = TYPES;

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
        this.container.bind<ProcessEnv>(Module.Types.ProcessEnv).toConstantValue(process.env);
        this.container.bind<string>(Module.Types.configPath).toConstantValue(this.getConfigPath());
        this.container.bind(Module.Types.FileSystem).toConstantValue(FileSystem);
        this.container.bind(Module.Types.Express).toConstantValue(express);
        this.container.bind(Module.Types.ExpressApplication).toConstantValue(express());

        const applicationOptions: ApplicationOptions = this.container.get(ApplicationOptionsFactory).create();
        this.container.bind(Module.Types.ApplicationOptions).toConstantValue(applicationOptions);

        const logger: Logger = this.container.get(LoggerFactory).create();
        this.container.bind(Logger).toConstantValue(logger);
    }

}
