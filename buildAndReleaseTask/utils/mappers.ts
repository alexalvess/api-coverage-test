import { EndpointModel } from "../models/EndpointModel";
import { InfoPathModel } from "../models/InfoPathModel";
import { log } from "./log";

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