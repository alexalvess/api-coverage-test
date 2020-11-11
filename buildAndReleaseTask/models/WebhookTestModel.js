"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookTestModel = void 0;
var WebhookTestModel = /** @class */ (function () {
    function WebhookTestModel() {
        this.createDate = new Date();
        this.buildNumber = '';
        this.totalEndpointsFound = 0;
        this.totalEndpointsTested = 0;
        this.coverage = 0;
        this.totalTime = 0;
        this.totalSucceed = 0;
        this.totalFailure = 0;
        this.endpoints = new Array();
    }
    return WebhookTestModel;
}());
exports.WebhookTestModel = WebhookTestModel;
