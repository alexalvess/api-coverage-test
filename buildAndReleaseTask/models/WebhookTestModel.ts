import { EndpointModel } from "./EndpointModel";

export class WebhookTestModel {
    createAt: Date;
    buildNumber: string;
    totalEndpointsFound: number;
    totalEndpointsTested: number;
    coverage: number;
    totalTime: number;
    totalSucceed: number;
    totalFailure: number;
    endpoints: Array<EndpointModel>;

    constructor() {
        this.createAt = new Date();
        this.buildNumber = '';
        this.totalEndpointsFound = 0;
        this.totalEndpointsTested = 0;
        this.coverage = 0;
        this.totalTime = 0;
        this.totalSucceed = 0;
        this.totalFailure = 0;
        this.endpoints = new Array<EndpointModel>();
    }
}