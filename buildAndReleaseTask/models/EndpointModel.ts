import path from "path";
import { log } from "../utils/log";

export class EndpointModel {
    public id: string;
    public path: string;
    public verb: string;
    public isSuccess: boolean;

    constructor (id: string, path: string, verb: string, isSuccess: boolean) {
        this.id = id;
        this.path = path;
        this.verb = verb;
        this.isSuccess = isSuccess;
    }

    public buildEndpoint (id: string, path: string, verb: string, isSuccess: boolean): EndpointModel{
        return new EndpointModel(id, path, verb, isSuccess);
    }

    public static buildFullPath(paths: string[], queries: {key: string, value: string}[]): string {
        let fullPath = '';

        if(!paths || paths.length === 0)
            throw new Error("Invalid path found");
        
        paths.forEach(el => {
            if(el.includes(':'))
                fullPath += `/{${el.slice(1)}}`;
            else
                fullPath += `/${el}`;
        });

        queries.forEach((el, index) => {
            if(index === 0)
                fullPath += '?';

            fullPath += `${el.key}={${el.key}}`;
        });

        return fullPath;
    }
}