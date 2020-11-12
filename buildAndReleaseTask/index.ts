import task = require('azure-pipelines-task-lib/task');
// import httpsRequest = require('https');
import { CoverageModel } from './models/CoverageModel';
import { EndpointModel } from './models/EndpointModel';
import { InfoPathModel } from './models/InfoPathModel';
import { WebhookModel } from './models/WebhookModel';

const request = require('request');
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

async function run() {
    try {
        Log('Start coverage process.');

        let apiUrl: string | undefined = task.getInput('ApiUrl', true);
        let swaggerJsonPath: string | undefined = task.getInput('SwaggerJsonPath', true);
        const testResultPath: string | undefined = task.getInput('TestsResultPath', true);
        const whereIsTheTest: string | undefined = task.getInput('WhereIsTheTest', true);
        const webhook: string | undefined = task.getInput('Webhook', false);
        // const buildNumber: string | undefined = task.getInput('BuildNumber', true);
        // const applicationName: string | undefined = task.getInput('ApplicationName', true);

        apiUrl = apiUrl?.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        swaggerJsonPath = swaggerJsonPath?.startsWith('/') ? swaggerJsonPath.substring(1) : swaggerJsonPath;

        const url = `${apiUrl}/${swaggerJsonPath}`;
        
        Log(`Reading test result file: ${testResultPath}`);
        const testResultsFile = fs.readFileSync(testResultPath, "utf8");
        parser.parseString(testResultsFile, (error: any, result: any) => {
            if(error) {
                task.setResult(task.TaskResult.Failed, JSON.stringify(error));
            } else {
                let endpointsTested: Array<EndpointModel> = new Array<EndpointModel>();
                let endpointsExists: Array<EndpointModel> = new Array<EndpointModel>();
                let coverage: CoverageModel = new CoverageModel();

                if(whereIsTheTest === 'testSuite') {
                    result.testsuites.testsuite.map((item: any) => {
                        const testName = item.ATTR.name as string;
                        const time = item.ATTR.time as number;
                        const executeAt = item.ATTR.timestamp as Date;
                        const success = (item.ATTR.failures as number) > 0 ? false : true;
                        let message: string | undefined;

                        if(!success) {
                            message = item.testcase[0].failure[0].ATTR.message;
                        }

                        EndpointModel.setSamePath(endpointsTested, testName, time, executeAt, success, message);
                    });
                } else {
                    result.testsuites.testsuite.map((item: any) => {
                        if(item.testcase) {
                            const executeAt = item.ATTR.timestamp as Date;

                            item.testcase.map((tc: any) => {
                                const testName = tc.ATTR.classname as string;
                                const time = tc.ATTR.time as number;
                                let success: boolean = true;
                                let message: string | undefined;
                                
                                if(tc.failure) {
                                    success = false;
                                    message = tc.failure[0].ATTR.message;
                                }
                                
                                EndpointModel.setSamePath(endpointsTested, testName, time, executeAt, success, message);
                            });
                        }
                    });
                }

                coverage.tested = EndpointModel.log('Endpoints tested', endpointsTested);

                Log(`Reading Swagger of API: ${url}`);
                request(url, { json: true }, (error: any, response: any, body: any) => {
                    if(error) {
                        task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                    } else if(!error && response.statusCode == 200) {
                        Object.keys(body.paths).forEach(element => {
                            let endpoint = new EndpointModel();
                            endpoint.path = element;
                            endpoint.infoPath = Object.keys(body.paths[element]).map(el => new InfoPathModel(el.toUpperCase()))
                            endpointsExists.push(endpoint);
                        });

                        coverage.existed = EndpointModel.log('Endpoints found', endpointsExists);

                        endpointsExists.forEach((item: EndpointModel) => {
                            let endpoint = endpointsTested.find(fi => fi.path == item.path);
                            
                            if(endpoint) {
                                const verbsInExisted = item.infoPath.map(m => m.verb);
                                const verbsInTested = endpoint.infoPath.map(m => m.verb);
                                
                                const verbsUncover = verbsInExisted.filter(f => !verbsInTested.includes(f));

                                if(verbsUncover && verbsUncover.length > 0) {
                                    endpoint = new EndpointModel();
                                    endpoint.path = item.path;
                                    endpoint.infoPath = [...verbsUncover.map(m => new InfoPathModel(m))];
                                    coverage.uncover.push(endpoint);
                                }
                            } else {
                                coverage.uncover.push(item);
                            }
                        });

                        coverage.coverLog();
                        coverage.uncoverLog();

                        if(webhook) {
                            const payload = new WebhookModel(
                                '',
                                apiUrl ?? '', 
                                '', 
                                coverage.existed,
                                coverage.tested,
                                coverage.getCoverage(),
                                endpointsExists,
                                endpointsTested,
                                coverage.uncover);
                            
                            const data = JSON.stringify(payload);

                            Log('Payload generated:');
                            console.log(data);
                            Log(`Send to API: ${webhook}`);

                            // var rq = https.request(
                            //     webhook, 
                            //     { 
                            //         method: 'POST',
                            //         headers: {
                            //             'Content-Type': 'application/json',
                            //             'Content-Length': data.length
                            //         }
                            //     }, (response) => {
                            //         const statusCode = response.statusCode as number;
                            //         Log(`StatusCode of request: ${response.statusCode}`);

                            //         if(statusCode >= 200 && statusCode <= 299) {
                            //             Log('Request made successfully.');
                            //         } else {
                            //             Log('Error to make the request.')
                            //         }
                            //     });

                            // rq.write(data);
                        }
                    }
                });
            }
        });
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

function Log(message: string) {
    console.log(`############### ${message}`);
}

run();