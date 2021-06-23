import { EndpointModel } from "../models/EndpointModel";
import { InfoPathModel } from "../models/InfoPathModel";
import { log } from "./log";

export function postmanMap(testResult: any, endpointsTested: EndpointModel[]): EndpointModel[] {
    if(!testResult)
        throw new Error("No test were found.");

    let pathsFound = discoverPath(testResult.collection.item, []);
    pathsFound = discoverError(testResult.run.executions, pathsFound);
    console.log(pathsFound);

    return new Array<EndpointModel>();
}

function discoverPath(item: [], paths: Array<{}>): Array<EndpointModel> {
    item.forEach((el: any) => {
        if(el.item)
            return discoverPath(el.item, paths);
        
        const fullPath = EndpointModel.buildFullPath(el.request.url.path, el.request.url.query);
        paths.push(new EndpointModel)
        let path: string = '';
        (el.request.url.path as Array<any>).forEach((partyPath: string) => {
            if(partyPath.includes(':'))
                path += `/{${partyPath.slice(1)}}`;
            else
                path += `/${partyPath}`;
        });

        if((el.request.url.query as Array<any>) && (el.request.url.query as Array<any>).length > 0)
            path += '?';

        (el.request.url.query as Array<any>).forEach((partyQuery: any) => {
            path += `${partyQuery.key}={${partyQuery.key}}`;
        });

        paths.push({id: el.id, path: path, method: el.request.method});
    });

    return paths;
}

function discoverError(executions: [], paths: Array<{}>): Array<{}> {
    executions.forEach((el: any) => {
        const assertions = el.assertions as Array<any>;
        let path: any = paths.find((f: any) => f.id === el.id);

        if(assertions.filter((f: any) => f.error).length > 0)
            path.isSuccess = false;
        else
            path.isSuccess = true;

        const objectIndex = paths.findIndex((f: any) => f.id === el.id);
        paths[objectIndex] = path;
    });

    return paths;
}

export function testSuiteMap(tests: any[], endpointsTested: EndpointModel[]) {
    log('Reading tests in Test Suite tag.');

    tests.map((item: any) => {
        const testName = item.ATTR.name as string;
        const time = item.ATTR.time as number;
        const executeAt = item.ATTR.timestamp as Date;
        const success = (item.ATTR.failures as number) > 0 ? false : true;
        let message: string | undefined;

        if(!success) {
            message = item.testcase[0].failure[0].ATTR.message;
        }

        EndpointModel.setSamePath(endpointsTested, testName, time, executeAt, success, message);
    });
}

export function testCaseMap(tests: any[], endpointsTested: EndpointModel[]) {
    log('Reading tests in Test Case tag.');

    tests.map((item: any) => {
        if(item.testcase) {
            const executeAt = item.ATTR.timestamp as Date;

            item.testcase.map((tc: any) => {
                const testName = tc.ATTR.classname as string;
                const time = tc.ATTR.time as number;
                let success: boolean = true;
                let message: string | undefined;
                
                if(tc.failure) {
                    success = false;
                    message = tc.failure[0].ATTR.message;
                }
                
                EndpointModel.setSamePath(endpointsTested, testName, time, executeAt, success, message);
            });
        }
    });
}

export function endpointsMap(body: any, endpointsExists: EndpointModel[]) {
    Object.keys(body.paths).forEach(element => {
        let endpoint = new EndpointModel();
        endpoint.path = element;
        endpoint.infoPath = Object.keys(body.paths[element]).map(el => new InfoPathModel(el?.toUpperCase()))
        endpointsExists.push(endpoint);
    });
}