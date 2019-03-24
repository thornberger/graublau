import {Router} from "express";

export interface ResourceInterface {

    getRoutes(): Router;
}
