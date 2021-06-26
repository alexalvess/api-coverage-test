import { EndpointModel } from "./EndpointModel";

export class WebhookModel {
    application: string;
    apiTested: string;
    createAt: Date;
    buildNumber: string;
    totalEndpointsFound: number;
    totalEndpointsTested: number;
    coverage: number;
    totalTime: number;
    totalSucceed: number;
    totalFailure: number;
    endpointsFound: Array<EndpointModel>;
    endpointsTested: Array<EndpointModel>;
    endpointsUncover: Array<EndpointModel>;

    constructor(
        application: string,
        apiTested: string,
        buildNumber: string,
        totalEndpointsFound: number,
        totalEndpointsTested: number,
        coverage: number,
        endpointsFound: Array<EndpointModel>,
        endpointsTested: Array<EndpointModel>,
        endpointsUncover: Array<EndpointModel>) {
        this.application = application;
        this.apiTested = apiTested;
        this.createAt = new Date();
        this.buildNumber = buildNumber;
        this.totalEndpointsFound = totalEndpointsFound;
        this.totalEndpointsTested = totalEndpointsTested;
        this.coverage = coverage;
        this.endpointsFound = endpointsFound;
        this.endpointsTested = endpointsTested; 
        this.endpointsUncover = endpointsUncover;

        this.totalTime = 0;
        this.totalSucceed = 0;
        this.totalFailure = 0;

        // this.totalTime = endpointsTested.reduce((accumulator, current) =>{
        //     return accumulator + current.infoPath.reduce((ac, cu) => {
        //         return ac + cu.time;
        //     }, 0);
        // }, 0);

        // this.totalSucceed = endpointsTested.reduce((accumulator, current) =>{
        //     return accumulator + current.infoPath.filter(f => f.success).reduce((ac, cu) => {
        //         return ac + cu.time;
        //     }, 0);
        // }, 0);

        // this.totalFailure = endpointsTested.reduce((accumulator, current) =>{
        //     return accumulator + current.infoPath.filter(f => !f.success).reduce((ac, cu) => {
        //         return ac + cu.time;
        //     }, 0);
        // }, 0);
    }
}