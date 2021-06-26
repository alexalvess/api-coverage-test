import { CoverageModel } from "../models/CoverageModel";
import { EndpointModel } from "../models/EndpointModel";
import { InputDataModel } from "../models/InputDataModel";
import { WebhookModel } from "../models/WebhookModel";
import { log } from "./log";
import https = require("https");
const axios = require('axios');

export function findUncoverEndpoints(
    endpointsExists: EndpointModel[],
    endpointsTested: EndpointModel[]
): EndpointModel[] {
    const uncoverEndpoints: EndpointModel[] = [];

    // endpointsExists.forEach((item: EndpointModel) => {
    //     let endpoint = endpointsTested.find((fi) => fi.path == item.path);

    //     if (endpoint) {
    //         const verbsInExisted = item.infoPath.map((m) => m.verb);
    //         const verbsInTested = endpoint.infoPath.map((m) => m.verb);

    //         const verbsUncover = verbsInExisted.filter(
    //             (f) => !verbsInTested.includes(f)
    //         );

    //         if (verbsUncover && verbsUncover.length > 0) {
    //             endpoint = new EndpointModel();
    //             endpoint.path = item.path;
    //             endpoint.infoPath = [
    //                 ...verbsUncover.map((m) => new InfoPathModel(m)),
    //             ];
    //             uncoverEndpoints.push(endpoint);
    //         }
    //     } else {
    //         uncoverEndpoints.push(item);
    //     }
    // });

    return uncoverEndpoints;
}

export function generateWebhookPayload(
    inputData: InputDataModel,
    coverage: CoverageModel,
    endpointsExists: EndpointModel[],
    endpointsTested: EndpointModel[]
): string {
    const payload = new WebhookModel(
        inputData.application ?? "",
        inputData.url ?? "",
        inputData.buildNumber ?? "",
        coverage.existed,
        coverage.tested,
        0,
        // coverage.getCoverage(),
        endpointsExists,
        endpointsTested,
        coverage.uncover
    );

    const data = JSON.stringify(payload);

    log("Payload generated:");
    console.log(data);

    return data;
}

export function makePostRequest(payload: any, url: string): void {
    log(`Send to API: ${url}`);
    const instance = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        }),
        headers: {'content-type': 'application/json'}
    });

    instance.post(url, payload)
        .then(() => {
            log("Request made successfully.");
        })
        .catch((error: any) => {
            log("Error: ");
            console.log(error);
            throw new Error('Error to make request');
    });
}

export function makeGetRequest(url: string): Promise<any> {
    log(`Make request to: ${url}`);
    const instance = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        }),
        headers: {'content-type': 'application/json'}
    });

    return instance.get(url);
}