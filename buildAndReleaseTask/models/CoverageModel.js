"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageModel = void 0;
var CoverageModel = /** @class */ (function () {
    function CoverageModel() {
        this.tested = 0;
        this.existed = 0;
        this.coverage = 0;
        this.totalUncover = 0;
        this.uncover = new Array();
    }
    CoverageModel.prototype.getCoverage = function () {
        this.coverage = (this.tested * 100) / this.existed;
        return this.coverage;
    };
    CoverageModel.prototype.coverLog = function () {
        this.coverage = (this.tested * 100) / this.existed;
        console.log("############### Coverage: " + this.coverage + " %");
    };
    CoverageModel.prototype.uncoverLog = function () {
        this.totalUncover = this.uncover.reduce(function (accumulator, current) { return accumulator + current.infoPath.length; }, 0);
        console.log("############### Uncover endpoints: " + this.totalUncover);
        this.uncover.forEach(function (item) {
            console.log("Path: " + item.path + " | Verbs: " + item.infoPath.map(function (m) { return m.verb; }));
        });
    };
    return CoverageModel;
}());
exports.CoverageModel = CoverageModel;
