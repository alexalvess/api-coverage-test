import task = require("azure-pipelines-task-lib/task");
import https = require("https");
import { environment } from "./environments/environment";
import { CoverageModel } from "./models/CoverageModel";
import { EndpointModel } from "./models/EndpointModel";
import { TestType } from "./models/enums/TestType";
import { InfoPathModel } from "./models/InfoPathModel";
import { InputDataModel } from "./models/InputDataModel";
import { WebhookModel } from "./models/WebhookModel";
import { getValidFiles } from "./utils/directory";
import { log } from "./utils/log";
import { endpointsMap, testCaseMap, testSuiteMap } from "./utils/mappers";

const request = require("request");
const fs = require("fs");
const xml2js = require("xml2js");
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
                task.getInput("WhereIsTheTest", true)
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
                environment.whereIsTheTest
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

        log(`Reading file: ${validFiles[0]}.`);
        const testResultsFile = fs.readFileSync(validFiles[0], "utf8");
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
                request(
                    inputData.url,
                    { json: true },
                    (error: any, response: any, body: any) => {
                        if (error) {
                            throw error;
                        } else if (!error && response.statusCode == 200) {
                            endpointsMap(body, endpointsExists);

                            coverage.existed = EndpointModel.totalEndpoints(
                                "Endpoints found",
                                endpointsExists
                            );

                            endpointsExists.forEach((item: EndpointModel) => {
                                let endpoint = endpointsTested.find(
                                    (fi) => fi.path == item.path
                                );

                                if (endpoint) {
                                    const verbsInExisted = item.infoPath.map(
                                        (m) => m.verb
                                    );
                                    const verbsInTested = endpoint.infoPath.map(
                                        (m) => m.verb
                                    );

                                    const verbsUncover = verbsInExisted.filter(
                                        (f) => !verbsInTested.includes(f)
                                    );

                                    if (
                                        verbsUncover &&
                                        verbsUncover.length > 0
                                    ) {
                                        endpoint = new EndpointModel();
                                        endpoint.path = item.path;
                                        endpoint.infoPath = [
                                            ...verbsUncover.map(
                                                (m) => new InfoPathModel(m)
                                            ),
                                        ];
                                        coverage.uncover.push(endpoint);
                                    }
                                } else {
                                    coverage.uncover.push(item);
                                }
                            });

                            coverage.coverLog();
                            coverage.uncoverLog();

                            if (inputData.webhook) {
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

                                var rq = https.request(
                                    inputData.webhook,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Content-Length": data.length,
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
                                            task.setResult(
                                                task.TaskResult.Failed,
                                                "Error to make request"
                                            );
                                        }
                                    }
                                );

                                rq.write(data);
                            }
                        }
                    }
                );
            }
        });
    } catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();
