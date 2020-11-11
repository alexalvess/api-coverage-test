"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointModel = void 0;
var InfoPathModel_1 = require("./InfoPathModel");
var EndpointModel = /** @class */ (function () {
    function EndpointModel() {
        this.path = '';
        this.infoPath = new Array();
    }
    EndpointModel.prototype.addInfoPath = function (verb, time, executeAt) {
        if (!this.infoPath.find(function (f) { return f.verb === verb.toUpperCase(); })) {
            var infoPath = new InfoPathModel_1.InfoPathModel(verb.toUpperCase());
            infoPath.setTime(time);
            infoPath.setExecuteDate(executeAt);
            this.infoPath.push(infoPath);
        }
    };
    EndpointModel.prototype.setByTestProp = function (testName, time, executeAt) {
        var info = testName.split(' ');
        var path = info[info.length - 1];
        var verb = info[info.length - 2];
        this.path = path;
        this.addInfoPath(verb, time, executeAt);
    };
    EndpointModel.setSamePath = function (endpoints, testName, time, executeAt) {
        var info = testName.split(' ');
        var path = info[info.length - 1];
        var verb = info[info.length - 2];
        var endpoint = endpoints.find(function (f) { return f.path === path; });
        if (endpoint) {
            endpoint.addInfoPath(verb, time, executeAt);
        }
        else {
            endpoint = new EndpointModel();
            endpoint.path = path;
            endpoint.addInfoPath(verb, time, executeAt);
            endpoints.push(endpoint);
        }
    };
    EndpointModel.log = function (context, endpoints) {
        var total = endpoints.reduce(function (accumulator, current) { return accumulator + current.infoPath.length; }, 0);
        console.log("############### " + context + ": " + total);
        endpoints.forEach(function (element) {
            console.log("Path: " + element.path + " | Verbs: " + element.infoPath.map(function (item) { return item.verb; }));
        });
        return total;
    };
    return EndpointModel;
}());
exports.EndpointModel = EndpointModel;
