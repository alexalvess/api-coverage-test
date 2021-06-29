import { CoverageModel } from "./CoverageModel";
import { EndpointModel } from "./EndpointModel";
import { InputDataModel } from "./InputDataModel";

export class WebhookModel {
    application: string;
    apiUrl: string;
    buildNumber: string;
    executeAt: Date;
    existingEndpoints: number;
    testedEndpoints: number;
    coverage: number;
    totalFailure: number;
    coverEndpoints: Array<EndpointModel>;
    uncoverEndpoints: Array<EndpointModel>;

    constructor(inputData: InputDataModel, coverage: CoverageModel) {
        if(!inputData.application)
            throw new Error("The application name is required.");
        if(!inputData.buildNumber)
            throw new Error("The build number of the application is required.")

        this.application = inputData.application;
        this.apiUrl = inputData.url;
        this.buildNumber = inputData.buildNumber;
        this.executeAt = new Date();

        this.existingEndpoints = coverage.existingEndpoints;
        this.testedEndpoints = coverage.testedEndpoints;
        this.coverage = coverage.coverage;
        this.totalFailure = coverage.cover.filter(f => !f.isSuccess).length;
        this.coverEndpoints = coverage.cover;
        this.uncoverEndpoints = coverage.uncover;
    }
}