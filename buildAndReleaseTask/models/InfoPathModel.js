"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoPathModel = void 0;
var InfoPathModel = /** @class */ (function () {
    function InfoPathModel(verb) {
        this.verb = verb;
        this.time = 0;
        this.executeAt = new Date();
        this.success = true;
    }
    return InfoPathModel;
}());
exports.InfoPathModel = InfoPathModel;
