import { environment } from "./environments/environment";
import { CoverageModel } from "./models/CoverageModel";
import { EndpointModel } from "./models/EndpointModel";
import { TestType } from "./models/enums/TestType";
import { InputDataModel } from "./models/InputDataModel";
import { getValidFiles } from "./utils/directory";
import { log } from "./utils/log";
import { endpointsMap, testCaseMap, testSuiteMap } from "./utils/mappers";
import {
    findUncoverEndpoints,
    generateWebhookPayload,
    makePostRequest,
    makeGetRequest,
} from "./utils/operations";

const xml2js = require("xml2js");
const fs = require("fs");
const task = require("azure-pipelines-task-lib/task");
const parser = new xml2js.Parser({ attrkey: "ATTR" });

async function run() {
    try {
        log("Start coverage process.");

        let inputData: InputDataModel;

        if (environment.production) {
            inputData = new InputDataModel(
                task.getInput("ApiUrl", true),
                task.getInput("SwaggerJsonPath", true),
                task.getInput("TestsResultPath", true),
                task.getInput("WhereIsTheTest", true),
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
                environment.whereIsTheTest,
                environment.minimumQualityGate
            );

            inputData.setWebHookData(
                environment.webhook,
                environment.buildNumber,
                environment.applicationName
            );
        }

        log(`Reading test result directory: ${inputData.testResultPath}`);

        log(`Files found:`);
        const validFiles = getValidFiles(inputData.testResultPath, []);
        console.log(validFiles);

        validFiles.forEach((file) => {
            processAnalysis(file, inputData);
        });
    } catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

async function processAnalysis(file: string, inputData: InputDataModel) {
    log(`Reading file: ${file}.`);
    const testResultsFile = fs.readFileSync(file, "utf8");
    parser.parseString(testResultsFile, (error: any, result: any) => {
        if (error) {
            throw error;
        } else {
            let endpointsTested: Array<EndpointModel> = new Array<EndpointModel>();
            let endpointsExists: Array<EndpointModel> = new Array<EndpointModel>();
            let coverage: CoverageModel = new CoverageModel();

            if (inputData.testType === TestType.TestSuite) {
                testSuiteMap(result.testsuites.testsuite, endpointsTested);
            } else {
                testCaseMap(result.testsuites.testsuite, endpointsTested);
            }

            coverage.tested = EndpointModel.totalEndpoints(
                "Endpoints tested",
                endpointsTested
            );

            log(`Reading Swagger of API: ${inputData.url}`);
            makeGetRequest(inputData.url)
                .then((response: any) => {
                    endpointsMap(response.data, endpointsExists);

                    coverage.existed = EndpointModel.totalEndpoints(
                        "Endpoints found",
                        endpointsExists
                    );

                    coverage.uncover = findUncoverEndpoints(
                        endpointsExists,
                        endpointsTested
                    );

                    coverage.coverLog();
                    coverage.uncoverLog();

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
                .catch((error) => {
                    throw error;
                });
        }
    });
}

run();
