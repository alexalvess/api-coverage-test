"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var task = require("azure-pipelines-task-lib/task");
var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({ attrkey: "ATTR" });
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, swaggerJsonPath, testResultPath, whereIsTheTest_1, url_1, testResultsFile;
        return __generator(this, function (_a) {
            try {
                apiUrl = task.getInput('ApiUrl', true);
                swaggerJsonPath = task.getInput('SwaggerJsonPath', true);
                testResultPath = task.getInput('TestsResultPath', true);
                whereIsTheTest_1 = task.getInput('WhereIsTheTest', true);
                apiUrl = (apiUrl === null || apiUrl === void 0 ? void 0 : apiUrl.endsWith('/')) ? apiUrl.slice(0, -1) : apiUrl;
                swaggerJsonPath = (swaggerJsonPath === null || swaggerJsonPath === void 0 ? void 0 : swaggerJsonPath.startsWith('/')) ? swaggerJsonPath.substring(1) : swaggerJsonPath;
                url_1 = apiUrl + "/" + swaggerJsonPath;
                Log("Reading test result file: " + testResultPath);
                testResultsFile = fs.readFileSync(testResultPath, "utf8");
                parser.parseString(testResultsFile, function (error, result) {
                    if (error) {
                        task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                    }
                    else {
                        var endpointsInFile_1 = [];
                        if (whereIsTheTest_1 === 'testSuite') {
                            endpointsInFile_1 = result.testsuites.testsuite.map(function (item) {
                                var value = item.ATTR.name.split(' ');
                                return {
                                    path: value[1],
                                    verb: value[0].toUpperCase()
                                };
                            });
                        }
                        else {
                            result.testsuites.testsuite.map(function (item) {
                                if (item.testcase) {
                                    item.testcase.map(function (tc) {
                                        var infos = tc.ATTR.classname.toString().split(' ');
                                        endpointsInFile_1.push({
                                            path: infos[infos.length - 1],
                                            verb: infos[infos.length - 2].toUpperCase()
                                        });
                                    });
                                }
                            });
                        }
                        var endpointsTested_1 = [];
                        endpointsInFile_1.forEach(function (element) {
                            var _a;
                            var endpoint = endpointsTested_1.find(function (f) { return f.path === element.path; });
                            if (endpoint) {
                                (_a = endpointsTested_1.find(function (f) { return f.path === element.path; })) === null || _a === void 0 ? void 0 : _a.verbs.push(element.verb);
                            }
                            else {
                                endpointsTested_1.push({
                                    path: element.path,
                                    verbs: [element.verb]
                                });
                            }
                        });
                        Log("Endpoints tested: " + endpointsTested_1.reduce(function (acumulator, currenct) { return acumulator + currenct.verbs.length; }, 0));
                        endpointsTested_1.forEach(function (element) {
                            console.log("Path: " + element.path + " | Verbs: " + element.verbs);
                        });
                        Log("Reading Swagger of API: " + url_1);
                        Log("Get endpoints of API");
                        request(url_1, { json: true }, function (error, response, body) {
                            if (error) {
                                task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                            }
                            else if (!error && response.statusCode == 200) {
                                var endpointsExists_1 = [];
                                Object.keys(body.paths).forEach(function (element) {
                                    endpointsExists_1.push({
                                        path: element,
                                        verbs: Object.keys(body.paths[element]).map(function (el) { return el.toUpperCase(); })
                                    });
                                });
                                Log("Endpoints found: " + endpointsExists_1.reduce(function (acumulator, currenct) { return acumulator + currenct.verbs.length; }, 0));
                                endpointsExists_1.forEach(function (element) {
                                    console.log("Path: " + element.path + " | Verbs: " + element.verbs);
                                });
                                var totalEndpoints_1 = 0;
                                endpointsExists_1.forEach(function (el) {
                                    totalEndpoints_1 += el.verbs.length;
                                });
                                var uncoverageEndpoints = endpointsExists_1.map(function (f) {
                                    var endpoint = endpointsTested_1.find(function (fi) { return fi.path == f.path; });
                                    if (endpoint == undefined) {
                                        return f;
                                    }
                                    else {
                                        var verbsUncoverage = f.verbs.filter(function (f) { return !endpoint.verbs.includes(f); });
                                        if (verbsUncoverage && verbsUncoverage.length > 0) {
                                            return {
                                                path: f.path,
                                                verbs: verbsUncoverage
                                            };
                                        }
                                    }
                                });
                                var cover_1 = 0;
                                endpointsTested_1.forEach(function (item) { return cover_1 += item.verbs.length; });
                                var uncover_1 = 0;
                                uncoverageEndpoints.forEach(function (item) {
                                    if (item) {
                                        uncover_1 += item.verbs.length;
                                    }
                                });
                                var coverage = (cover_1 * 100) / totalEndpoints_1;
                                Log("Coverage: " + coverage + " %");
                                Log("Uncoverage endpoints: " + uncover_1);
                                uncoverageEndpoints.forEach(function (item) {
                                    if (item) {
                                        console.log("Path: " + item.path + " | Verbs: " + item.verbs);
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
            return [2 /*return*/];
        });
    });
}
function Log(message) {
    console.log("############### " + message);
}
run();
