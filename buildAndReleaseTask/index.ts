import task = require('azure-pipelines-task-lib/task');

const request = require('request');
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

async function run() {
    try {
        let apiUrl: string | undefined = task.getInput('ApiUrl', true);
        let swaggerJsonPath: string | undefined = task.getInput('SwaggerJsonPath', true);
        const testResultPath: string | undefined = task.getInput('TestsResultPath', true);
        const whereIsTheTest: string | undefined = task.getInput('WhereIsTheTest', true);

        apiUrl = apiUrl?.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        swaggerJsonPath = swaggerJsonPath?.startsWith('/') ? swaggerJsonPath.substring(1) : swaggerJsonPath;

        const url = `${apiUrl}/${swaggerJsonPath}`;
        
        Log(`Reading test result file: ${testResultPath}`);
        const testResultsFile = fs.readFileSync(testResultPath, "utf8");
        parser.parseString(testResultsFile, (error: any, result: any) => {
            if(error) {
                task.setResult(task.TaskResult.Failed, JSON.stringify(error));
            } else {
                let endpointsInFile: Array<{path: string, verb: string}> = [];

                if(whereIsTheTest === 'testSuite') {
                    endpointsInFile = result.testsuites.testsuite.map((item: any) => {
                        const value = (item.ATTR.name as string).split(' ');
    
                        return {
                            path: value[1],
                            verb: value[0].toUpperCase()
                        };
                    });
                } else {
                    result.testsuites.testsuite.map((item: any) => {
                        if(item.testcase) {
                            item.testcase.map((tc: any) => {
                                const infos: string[] = tc.ATTR.classname.toString().split(' ');
                                endpointsInFile.push({
                                    path: infos[infos.length - 1],
                                    verb: infos[infos.length - 2].toUpperCase()
                                });
                            });
                        }
                    });
                }

                let endpointsTested: Array<{path: string, verbs: string[]}> = []

                endpointsInFile.forEach(element => {
                    const endpoint = endpointsTested.find(f => f.path === element.path)
                    if(endpoint) {
                        endpointsTested.find(f => f.path === element.path)?.verbs.push(element.verb);
                    } else {
                        endpointsTested.push({
                            path: element.path,
                            verbs: [element.verb]
                        });
                    }
                });

                Log(`Endpoints tested: ${endpointsTested.reduce((acumulator, currenct) => acumulator + currenct.verbs.length, 0)}`);
                endpointsTested.forEach((element) => {
                    console.log(`Path: ${element.path} | Verbs: ${element.verbs}`)
                });

                Log(`Reading Swagger of API: ${url}`);
                Log(`Get endpoints of API`);
                request(url, { json: true }, (error: any, response: any, body: any) => {
                    if(error) {
                        task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                    } else if(!error && response.statusCode == 200) {
                        const endpointsExists: Array<{path: string, verbs: string[]}> = [];

                        Object.keys(body.paths).forEach(element => {
                            endpointsExists.push({
                                path: element,
                                verbs: Object.keys(body.paths[element]).map(el => el.toUpperCase())
                            });
                        });

                        Log(`Endpoints found: ${endpointsExists.reduce((acumulator, currenct) => acumulator + currenct.verbs.length, 0)}`)
                        endpointsExists.forEach(element => {
                            console.log(`Path: ${element.path} | Verbs: ${element.verbs}`);
                        });

                        let totalEndpoints = 0;
                        endpointsExists.forEach(el => {
                            totalEndpoints += el.verbs.length;
                        });

                        const uncoverageEndpoints = endpointsExists.map(f => {
                            const endpoint = endpointsTested.find(fi => fi.path == f.path);
                            
                            if(endpoint == undefined) {
                                return f;
                            } else {
                                const verbsUncoverage = f.verbs.filter(f => !endpoint.verbs.includes(f));

                                if(verbsUncoverage && verbsUncoverage.length > 0) {
                                    return {
                                        path: f.path,
                                        verbs: verbsUncoverage
                                    };
                                }
                            }
                        });

                        let cover = 0;
                        endpointsTested.forEach(item => cover += item.verbs.length);

                        let uncover = 0;
                        uncoverageEndpoints.forEach(item => {
                            if(item) {
                                uncover += item.verbs.length
                            }
                        });

                        let coverage = (cover * 100) / totalEndpoints;
                        Log(`Coverage: ${coverage} %`);

                        Log(`Uncoverage endpoints: ${uncover}`);
                        uncoverageEndpoints.forEach(item => {
                            if(item) {
                                console.log(`Path: ${item.path} | Verbs: ${item.verbs}`);
                            }
                        });
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