import { log } from "../utils/log";
import { EndpointModel } from "./EndpointModel";

export class CoverageModel {
    public tested: number;
    public existed: number;
    public coverage: number;
    public totalUncover: number;
    public uncover: Array<EndpointModel>;

    constructor(endpointExists: EndpointModel[], endpointTested: EndpointModel[]) {
        this.tested = endpointTested.length;
        this.existed = endpointExists.length;
        this.coverage = (this.tested * 100) / this.existed;
        this.totalUncover = this.existed - this.tested;
        this.uncover = endpointExists.filter(el => {
            if(!endpointTested.find(f => f.path === el.path && f.verb === el.verb))
                return el;
        });
    }
}