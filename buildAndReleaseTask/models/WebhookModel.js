"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModel = void 0;
var WebhookModel = /** @class */ (function () {
    function WebhookModel(application, apiTested, buildNumber, totalEndpointsFound, totalEndpointsTested, coverage, endpointsFound, endpointsTested, endpointsUncover) {
        this.application = application;
        this.apiTested = apiTested;
        this.createAt = new Date();
        this.buildNumber = buildNumber;
        this.totalEndpointsFound = totalEndpointsFound;
        this.totalEndpointsTested = totalEndpointsTested;
        this.coverage = coverage;
        this.endpointsFound = endpointsFound;
        this.endpointsTested = endpointsTested;
        this.endpointsUncover = endpointsUncover;
        this.totalTime = endpointsTested.reduce(function (accumulator, current) {
            return accumulator + current.infoPath.reduce(function (ac, cu) {
                return ac + cu.time;
            }, 0);
        }, 0);
        this.totalSucceed = endpointsTested.reduce(function (accumulator, current) {
            return accumulator + current.infoPath.filter(function (f) { return f.success; }).reduce(function (ac, cu) {
                return ac + cu.time;
            }, 0);
        }, 0);
        this.totalFailure = endpointsTested.reduce(function (accumulator, current) {
            return accumulator + current.infoPath.filter(function (f) { return !f.success; }).reduce(function (ac, cu) {
                return ac + cu.time;
            }, 0);
        }, 0);
    }
    return WebhookModel;
}());
exports.WebhookModel = WebhookModel;
