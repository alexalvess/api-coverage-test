import { CoverageModel } from "../models/CoverageModel";
import { EndpointModel } from "../models/EndpointModel";
import { InfoPathModel } from "../models/InfoPathModel";
import { InputDataModel } from "../models/InputDataModel";
import { WebhookModel } from "../models/WebhookModel";
import { log } from "./log";
import https = require("https");

export function findUncoverEndpoints(
    endpointsExists: EndpointModel[],
    endpointsTested: EndpointModel[]
): EndpointModel[] {
    const uncoverEndpoints: EndpointModel[] = [];

    endpointsExists.forEach((item: EndpointModel) => {
        let endpoint = endpointsTested.find((fi) => fi.path == item.path);

        if (endpoint) {
            const verbsInExisted = item.infoPath.map((m) => m.verb);
            const verbsInTested = endpoint.infoPath.map((m) => m.verb);

            const verbsUncover = verbsInExisted.filter(
                (f) => !verbsInTested.includes(f)
            );

            if (verbsUncover && verbsUncover.length > 0) {
                endpoint = new EndpointModel();
                endpoint.path = item.path;
                endpoint.infoPath = [
                    ...verbsUncover.map((m) => new InfoPathModel(m)),
                ];
                uncoverEndpoints.push(endpoint);
            }
        } else {
            uncoverEndpoints.push(item);
        }
    });

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
        coverage.getCoverage(),
        endpointsExists,
        endpointsTested,
        coverage.uncover
    );

    const data = JSON.stringify(payload);

    log("Payload generated:");
    console.log(data);
    log(`Send to API: ${inputData.webhook}`);

    return data;
}

export function makeRequest(payload: any, url: string): void {
    var rq = https.request(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": payload.length,
            },
        },
        (response) => {
            const statusCode = response.statusCode as number;
            log(
                `StatusCode of request: ${response.statusCode}`
            );

            if (
                statusCode >= 200 &&
                statusCode <= 299
            ) {
                log("Request made successfully.");
            } else {
                throw new Error('Error to make request');
            }
        }
    );

    rq.write(payload);
}