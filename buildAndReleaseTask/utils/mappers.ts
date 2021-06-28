import { EndpointModel } from "../models/EndpointModel";

export function postmanMap(testResult: any): EndpointModel[] {
    if(!testResult)
        throw new Error("No test were found.");

    return discoverPath(testResult.collection.item, testResult.run.executions, []);
}

function discoverPath(items: [], executions: [], paths: Array<EndpointModel>): Array<EndpointModel> {
    items.forEach((el: any) => {
        if(el.item)
            return discoverPath(el.item, executions, paths);

        const success = hasError(executions, el.id);
        
        const fullPath = EndpointModel.buildFullPath(el.request.url.path, el.request.url.query);
        paths.push(new EndpointModel(el.id, fullPath, el.request.method, !success));
    });

    return paths;
}

function hasError(executions: [], endpointId: string): boolean {
    let assertions: [{}] = (executions.find((f: any) => f.id === endpointId) as any).assertions;

    if(assertions.filter((f: any) => f.error).length > 0)
        return true;
    
    return false;
}

export function endpointsMap(body: any): EndpointModel[] {
    let endpointsExists = new Array<EndpointModel>();
    Object.keys(body.paths).forEach(element => {
        Object.keys(body.paths[element]).map(el => el?.toUpperCase()).forEach(verb => {
            let endpoint = new EndpointModel('', element, verb, false);
            endpointsExists.push(endpoint);
        });
    });

    return endpointsExists;
}