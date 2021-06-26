import { environment } from "./environments/environment";
import { CoverageModel } from "./models/CoverageModel";
import { EndpointModel } from "./models/EndpointModel";
import { TestType } from "./models/enums/TestType";
import { InputDataModel } from "./models/InputDataModel";
import { log } from "./utils/log";
import { endpointsMap, postmanMap } from "./utils/mappers";
import {
    findUncoverEndpoints,
    generateWebhookPayload,
    makePostRequest,
    makeGetRequest,
} from "./utils/operations";

const fs = require("fs");
const task = require("azure-pipelines-task-lib/task");

async function run() {
    try {
        log("Reading input data variables");
        let inputData: InputDataModel = getInputVariables();
        log("Input data variables was read")

        log("Starting the process analysis");
        processAnalysis(inputData);
        log("The process analysis ended");
    } catch (err) {
        log("An error occurred:");
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

function getInputVariables(): InputDataModel {
    let inputData: InputDataModel;

    if (environment.production) {
        inputData = new InputDataModel(
            task.getInput("ApiUrl", true),
            task.getInput("SwaggerJsonPath", true),
            task.getInput("TestsResultPath", true),
            task.getInput("TestType", true),
            task.getInput("MinimumQualityGate", true)
        );

        inputData.setWebHookData(
            task.getInput("Webhook", false),
            task.getInput("BuildNumber", true),
            task.getInput("ApplicationName", true)
        );
    } else {
        inputData = new InputDataModel(
            environment.apiUrl,
            environment.swaggerJsonPath,
            environment.testResultPath,
            environment.testType,
            environment.minimumQualityGate
        );

        inputData.setWebHookData(
            environment.webhook,
            environment.buildNumber,
            environment.applicationName
        );
    }

    return inputData;
}

async function processAnalysis(inputData: InputDataModel) {
    let endpointsTested: EndpointModel[];

    if(inputData.testType === TestType.Postman) {
        let fileTestResult = fs.readFileSync(inputData.testResultPath, 'utf8');
        let jsonTestResult = JSON.parse(fileTestResult);

        log("Reading the Postman tests results");
        endpointsTested = postmanMap(jsonTestResult);
        log("The Postman test result was read");
    } else {
        throw new Error("It is currently only implemented for postman.");
    }

    makeGetRequest(inputData.url)
        .then((response: any) => {
            log("Reading the Swagger Documentation");
            const endpointsExists = endpointsMap(response.data);
            log("The Swagger Documentation was read");

            let coverage: CoverageModel = new CoverageModel(endpointsExists, endpointsTested);

            if (inputData.webhook) {
                const payload = generateWebhookPayload(
                    inputData,
                    coverage,
                    endpointsExists,
                    endpointsTested
                );
                inputData.webhook.forEach((url) =>
                    makePostRequest(payload, url)
                );
            }

            if(inputData.minimumQualityGate > coverage.coverage) {
                throw new Error("You have not reached the minimum coverage percentage.");
            }
        })
        .catch(error => { throw error; });
}

run();