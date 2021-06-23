import { environment } from "./environments/environment";
import { CoverageModel } from "./models/CoverageModel";
import { EndpointModel } from "./models/EndpointModel";
import { TestType } from "./models/enums/TestType";
import { InputDataModel } from "./models/InputDataModel";
import { log } from "./utils/log";
import { endpointsMap, testCaseMap, testSuiteMap, postmanMap } from "./utils/mappers";
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
    if(inputData.testType === TestType.Postman) {
        let fileTestResult = fs.readFileSync(inputData.testResultPath, 'utf8');
        let jsonTestResult = JSON.parse(fileTestResult);

        let endpointsTested: Array<EndpointModel> = new Array<EndpointModel>();
        log("Reading the Postman tests results");
        postmanMap(jsonTestResult, endpointsTested);
        log("The Postman test result was read");
    } else {
        throw new Error("It is currently only implemented for postman.");
    }

    // const testResultsFile = fs.readFileSync(file, "utf8");
    // parser.parseString(testResultsFile, (error: any, result: any) => {
    //     if (error) {
    //         throw error;
    //     } else {
    //         let endpointsTested: Array<EndpointModel> = new Array<EndpointModel>();
    //         let endpointsExists: Array<EndpointModel> = new Array<EndpointModel>();
    //         let coverage: CoverageModel = new CoverageModel();

    //         if (inputData.testType === TestType.TestSuite) {
    //             testSuiteMap(result.testsuites.testsuite, endpointsTested);
    //         } else {
    //             testCaseMap(result.testsuites.testsuite, endpointsTested);
    //         }

    //         coverage.tested = EndpointModel.totalEndpoints(
    //             "Endpoints tested",
    //             endpointsTested
    //         );

    //         log(`Reading Swagger of API: ${inputData.url}`);
    //         makeGetRequest(inputData.url)
    //             .then((response: any) => {
    //                 endpointsMap(response.data, endpointsExists);

    //                 coverage.existed = EndpointModel.totalEndpoints(
    //                     "Endpoints found",
    //                     endpointsExists
    //                 );

    //                 coverage.uncover = findUncoverEndpoints(
    //                     endpointsExists,
    //                     endpointsTested
    //                 );

    //                 coverage.coverLog();
    //                 coverage.uncoverLog();

    //                 if (inputData.webhook) {
    //                     const payload = generateWebhookPayload(
    //                         inputData,
    //                         coverage,
    //                         endpointsExists,
    //                         endpointsTested
    //                     );
    //                     inputData.webhook.forEach((url) =>
    //                         makePostRequest(payload, url)
    //                     );
    //                 }

    //                 if(inputData.minimumQualityGate > coverage.coverage) {
    //                     throw new Error("You have not reached the minimum coverage percentage.");
    //                 }
    //             })
    //             .catch((error) => {
    //                 throw error;
    //             });
    //     }
    // });
}

run();
