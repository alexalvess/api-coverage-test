import { environment } from "./environments/environment";
import { CoverageModel } from "./models/CoverageModel";
import { TestType } from "./models/enums/TestType";
import { InputDataModel } from "./models/InputDataModel";
import { WebhookModel } from "./models/WebhookModel";
import { information, debug } from "./utils/log";
import { endpointsMap, postmanMap } from "./utils/mappers";
import { makePostRequest, makeGetRequest } from "./utils/operations";

const fs = require("fs");
const task = require("azure-pipelines-task-lib/task");

async function run() {
    try {
        information("Reading input data variables...");
        let inputData: InputDataModel = getInputVariables();

        information("Starting the process analysis...");
        processAnalysis(inputData);
    } catch (err) {
        information("An error occurred:");
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

        environment.debugger = task.getInput("Debugger", true);
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
    let endpointsTested = processPostmanTestResults(inputData.testType, inputData.testResultPath);

    makeGetRequest(inputData.url)
        .then((response: any) => {
            information("Reading the Swagger Documentation...");
            const endpointsExists = endpointsMap(response.data);

            let coverage = new CoverageModel(endpointsExists, endpointsTested);

            if (inputData.webhook) {
                information(`Sending data to ${inputData.webhook}...`);

                const webhook = new WebhookModel(inputData, coverage);
                const payload = JSON.stringify(webhook);

                inputData.webhook.forEach((url) =>
                    makePostRequest(payload, url)
                );
            }

            if(inputData.minimumQualityGate > coverage.coverage) {
                throw new Error("You have not reached the minimum coverage percentage.");
            }

            information("End of analysis");
        })
        .catch(error => { throw error; });
}

function processPostmanTestResults(testType: TestType, testResultPath: string) {
    debug('Reading the postman test result file: ' + testResultPath);
    fs.readdir('./', (err: any, files: any) => {
        debug(`Files found in Directory: ${JSON.stringify(files)}`);
    });

    if(testType === TestType.Postman) {
        let fileTestResult = fs.readFileSync(testResultPath, 'utf8');
        let jsonTestResult = JSON.parse(fileTestResult);

        information("Reading the Postman tests results...");
        let endpointsTested = postmanMap(jsonTestResult);
        return endpointsTested;
    } else {
        throw new Error("It is currently only implemented for postman.");
    }
}

run();