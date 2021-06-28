import { log } from "../utils/log";
import { EndpointModel } from "./EndpointModel";

export class CoverageModel {
    public tested: number;
    public existed: number;
    public coverage: number;
    public totalUncover: number;
    public uncover: Array<EndpointModel>;
    public cover: Array<EndpointModel>;

    constructor(endpointExists: EndpointModel[], endpointTested: EndpointModel[]) {
        this.tested = endpointTested.length;
        this.existed = endpointExists.length;
        this.coverage = (this.tested * 100) / this.existed;
        this.totalUncover = this.existed - this.tested;
        
        this.uncover = endpointExists.filter(el => {
            if(!endpointTested.find(f => f.path === el.path && f.verb === el.verb))
                return el;
        });

        this.cover = endpointExists.filter(el => {
            if(endpointTested.find(f => f.path === el.path && f.verb === el.verb))
                return el;
        });

        log("Analysis result generated:");
        console.log(`Existing endpoints: ${this.existed}`);
        console.log(`Tested endpoints: ${this.tested}`);
        console.log(`Untested endpoints: ${this.totalUncover}`);
        console.log(`Coverage: ${this.coverage} %`);
        console.log(`Uncover endpoints: ${JSON.stringify(this.uncover.map(el => `${el.verb} ${el.path}`))}`);
        console.log(`Cover endpoints: ${JSON.stringify(this.cover.map(el => `${el.verb} ${el.path}`))}`);
    }
}