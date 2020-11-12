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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var task = require("azure-pipelines-task-lib/task");
var https = require("https");
var CoverageModel_1 = require("./models/CoverageModel");
var EndpointModel_1 = require("./models/EndpointModel");
var InfoPathModel_1 = require("./models/InfoPathModel");
var WebhookModel_1 = require("./models/WebhookModel");
var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({ attrkey: "ATTR" });
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl_1, swaggerJsonPath, testResultPath, whereIsTheTest_1, webhook_1, buildNumber, applicationName, url_1, testResultsFile;
        return __generator(this, function (_a) {
            try {
                Log('Start coverage process.');
                apiUrl_1 = task.getInput('ApiUrl', true);
                swaggerJsonPath = task.getInput('SwaggerJsonPath', true);
                testResultPath = task.getInput('TestsResultPath', true);
                whereIsTheTest_1 = task.getInput('WhereIsTheTest', true);
                webhook_1 = task.getInput('Webhook', false);
                buildNumber = task.getInput('BuildNumber', true);
                applicationName = task.getInput('ApplicationName', true);
                apiUrl_1 = (apiUrl_1 === null || apiUrl_1 === void 0 ? void 0 : apiUrl_1.endsWith('/')) ? apiUrl_1.slice(0, -1) : apiUrl_1;
                swaggerJsonPath = (swaggerJsonPath === null || swaggerJsonPath === void 0 ? void 0 : swaggerJsonPath.startsWith('/')) ? swaggerJsonPath.substring(1) : swaggerJsonPath;
                url_1 = apiUrl_1 + "/" + swaggerJsonPath;
                Log("Reading test result file: " + testResultPath);
                testResultsFile = fs.readFileSync(testResultPath, "utf8");
                parser.parseString(testResultsFile, function (error, result) {
                    if (error) {
                        task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                    }
                    else {
                        var endpointsTested_1 = new Array();
                        var endpointsExists_1 = new Array();
                        var coverage_1 = new CoverageModel_1.CoverageModel();
                        if (whereIsTheTest_1 === 'testSuite') {
                            result.testsuites.testsuite.map(function (item) {
                                var testName = item.ATTR.name;
                                var time = item.ATTR.time;
                                var executeAt = item.ATTR.timestamp;
                                var success = item.ATTR.failures > 0 ? false : true;
                                var message;
                                if (!success) {
                                    message = item.testcase[0].failure[0].ATTR.message;
                                }
                                EndpointModel_1.EndpointModel.setSamePath(endpointsTested_1, testName, time, executeAt, success, message);
                            });
                        }
                        else {
                            result.testsuites.testsuite.map(function (item) {
                                if (item.testcase) {
                                    var executeAt_1 = item.ATTR.timestamp;
                                    item.testcase.map(function (tc) {
                                        var testName = tc.ATTR.classname;
                                        var time = tc.ATTR.time;
                                        var success = true;
                                        var message;
                                        if (tc.failure) {
                                            success = false;
                                            message = tc.failure[0].ATTR.message;
                                        }
                                        EndpointModel_1.EndpointModel.setSamePath(endpointsTested_1, testName, time, executeAt_1, success, message);
                                    });
                                }
                            });
                        }
                        coverage_1.tested = EndpointModel_1.EndpointModel.log('Endpoints tested', endpointsTested_1);
                        Log("Reading Swagger of API: " + url_1);
                        request(url_1, { json: true }, function (error, response, body) {
                            if (error) {
                                task.setResult(task.TaskResult.Failed, JSON.stringify(error));
                            }
                            else if (!error && response.statusCode == 200) {
                                Object.keys(body.paths).forEach(function (element) {
                                    var endpoint = new EndpointModel_1.EndpointModel();
                                    endpoint.path = element;
                                    endpoint.infoPath = Object.keys(body.paths[element]).map(function (el) { return new InfoPathModel_1.InfoPathModel(el.toUpperCase()); });
                                    endpointsExists_1.push(endpoint);
                                });
                                coverage_1.existed = EndpointModel_1.EndpointModel.log('Endpoints found', endpointsExists_1);
                                endpointsExists_1.forEach(function (item) {
                                    var endpoint = endpointsTested_1.find(function (fi) { return fi.path == item.path; });
                                    if (endpoint) {
                                        var verbsInExisted = item.infoPath.map(function (m) { return m.verb; });
                                        var verbsInTested_1 = endpoint.infoPath.map(function (m) { return m.verb; });
                                        var verbsUncover = verbsInExisted.filter(function (f) { return !verbsInTested_1.includes(f); });
                                        if (verbsUncover && verbsUncover.length > 0) {
                                            endpoint = new EndpointModel_1.EndpointModel();
                                            endpoint.path = item.path;
                                            endpoint.infoPath = __spreadArrays(verbsUncover.map(function (m) { return new InfoPathModel_1.InfoPathModel(m); }));
                                            coverage_1.uncover.push(endpoint);
                                        }
                                    }
                                    else {
                                        coverage_1.uncover.push(item);
                                    }
                                });
                                coverage_1.coverLog();
                                coverage_1.uncoverLog();
                                if (webhook_1) {
                                    var payload = new WebhookModel_1.WebhookModel('', apiUrl_1 !== null && apiUrl_1 !== void 0 ? apiUrl_1 : '', '', coverage_1.existed, coverage_1.tested, coverage_1.getCoverage(), endpointsExists_1, endpointsTested_1, coverage_1.uncover);
                                    var data = JSON.stringify(payload);
                                    Log('Payload generated:');
                                    console.log(data);
                                    Log("Send to API: " + webhook_1);
                                    var rq = https.request(webhook_1, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Content-Length': data.length
                                        }
                                    }, function (response) {
                                        var statusCode = response.statusCode;
                                        Log("StatusCode of request: " + response.statusCode);
                                        if (statusCode >= 200 && statusCode <= 299) {
                                            Log('Request made successfully.');
                                        }
                                        else {
                                            Log('Error to make the request.');
                                        }
                                    });
                                    rq.write(data);
                                }
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
