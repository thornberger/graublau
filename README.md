[![Travis](https://travis-ci.org/thornberger/graublau.svg?branch=master)](https://travis-ci.org/thornberger/graublau)
[![Codecov](https://codecov.io/gh/thornberger/graublau/branch/master/graph/badge.svg)](https://codecov.io/gh/thornberger/graublau)
[![NPM](https://img.shields.io/npm/v/graublau.svg)](https://www.npmjs.com/package/graublau)
# graublau
An object-oriented, loosely-coupled, typescript framework for creating REST applications, build on top of [express](https://expressjs.com), [inversify](https://github.com/inversify/InversifyJS), and [winston](https://github.com/winstonjs/winston).

## Installation
via npm:
`npm install graublau`

via yarn:
`yarn add graublau`

## Usage
This section will guide you through the creation of a graublau application. As an example we will build a simple service that returns some customer information. We will call our application `CustomerService`.

### Creating a REST resource
We start by setting up our REST resources. For now we will only use one, the customer resource.
```typescript
import {Module} from "graublau";
import {ResourceInterface} from "graublau";
import {inject} from "inversify";
import {provide} from "inversify-binding-decorators";

@provide(CustomerResource)
export class CustomerResource implements ResourceInterface {

    private readonly router: Router;

    constructor(@inject(Module.Types.Express) express: any) {
        this.router = express.Router();
    }

    public getRoutes(): Router {
        this.router.get("/", this.getCustomers);
        return this.router;
    }
    
    private getCustomers(request: Request, response: Response): Customer[] {
        ...
    }
}
```

The first thing to note here is that we use inversify to get an instance of the express module which has been bound by the Module class of graublau. While you can also load express directly we'd recommend making use of dependency injection which makes it easier to create a unit test for the resource.

All routes have to be defined in the `getRoutes(): express.Router` method. We assume we only have one route: `GET /customers` and implement the functionality in a private method.

The class is annotated with `@provide(CustomerResource)`, using inversify's binding decorators, avoiding manual binding. All manual binding have to be performed in the `Module`.

### Setting up the Module
The module is responsible for all dependency injection bindings that are not convered by `@provide`. It also provides the path to the service config file.

```typescript
import {TYPES} from "./Types";
import {MongoDBStorage} from "./MongoDBStorage";
import {StorageInterface} from "./StorageInterface";
import {Module} from "graublau";
import {Container} from "inversify";

export class CustomerServiceModule extends Module {

    protected bind(container: Container): void {
        const storage: StorageInterface = container.get(MongoDBStorage);
        container.bind(TYPES.Storage).toConstantValue(storage);
    }
}

```
The `bind()` can be used for setting up DIC bindings using inversify's container class. In this example we bind the concrete implementation of `MongoDBStorage` to the `StorageInterface`. All classes depending on the interface will hence get the instance of `MongoDBStorage`.

### Initializing the config file
The service config file is a JSON file that holds basic information for a graublau application, as well as all the values you need for your business logic.
It is required to have `port` setting to set up the application port.
```json
{
  "application": {
    "port": 5000
  }
}
```
Additionally it can also be used to customize graublau's included logger (see below).

   
### Creating the service class
The service class bootstraps the application and takes care for registering all REST resources.

```typescript
import {CustomerServiceModule} from "./CustomerServiceModule";
import {CustomerResource} from "./CustomerResource";
import {Application} from "graublau";

export class CustomerService {

    private module: CustomerServiceModule;

    public constructor(module: CustomerServiceModule) {
        this.module = module;
    }

    public run(): void {
        const application: Application = this.module.getContainer().get(Application);

        application.addResource("customers", this.module.getContainer().get(CustomerResource));
        application.start();
    }
}
```
The service consumes the `CustomerServiceModule` and uses it to load all required dependencies. It then loads the graublau `Application` using the Module's container.
All resources have to be registered with `addResource(name: string, resource: ResourceInterface)`. We set the name to `customers` so when we start the service, we can call `GET /customers` to call the method defined in our resource.

### index.ts file
All that is left to do is instantiate both module and service, and run the application in our index.ts file.

````typescript
import "reflect-metadata";
import {CustomerService} from "CustomerService";

const module = new CustomerServiceModule("/path/to/config");
const service = new CustomerService(module);
service.run();
````
We also use this file to load the `reflect-metadata` module for inversify.

### Logger
graublau also provides a logger that on one hand hides away some of `winston`'s complexity and on the other hand enriches it with additional functionality.

You can automatically use the logger using dependency injection. Per default, it will log plain text to the standard output. If you specify a `logger` section in your config file you can customize this behavior.
````json
"logger": {
      "minLogLevel": "info",
      "format": "plain",
      "output": "/var/log/customer_service.log"
}
````
* `format` can be set to either `"plain"` (default value), or `"json"` for JSON logs.
* `output` can be either `"stdout"` for logging to the console (default value), or a file name to log to a file.
* `minLogLevel` specifies the minimum log level - either `"debug"`, `"info"` (default value), `"warn"`, or `"error"`.

You can use the logger calling one of the `debug()`, `info()`, `warn()`, or `error()` methods.
Each of these methods takes two arguments:
* The first argument is either a string, or an `Error` object.
* The second argument is used for specifying the log context and can be any object (including Errors).

## Dependency Injection
graublau uses the [inversify](https://github.com/inversify/InversifyJS) dependency injection framework. It is totally possible to build a graublau application without any dependency injection support if you don't have any need for that.

When creating a `Module` the framework internally sets up all required bindings. Most of these bindings are only relevant to the graublau framework itself, but you can re-use them if necessary.

The following symbols are pre-bound and are exposed through `Module.Types`:
 
| Symbol      | Bound To |
| ----------- | ----------- |
| `configPath`      | config path       |
| `ApplicationOptions`   | internal application options        |
| `LoggerOptions`   | internal logger options        |
| `Express`   | express module        |
| `ExpressApplication`   | instance of express application        |
| `FileSystem`   | "fs" module        |
| `ProcessEnv`   | process.env        |

## Background
graublau is a framework I created extracting some common classes and structures I used in a couple of applications.
