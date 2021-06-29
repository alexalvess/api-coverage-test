import { information } from "../utils/log";
import { EndpointModel } from "./EndpointModel";

export class CoverageModel {
    public testsFound: number;
    public testedEndpoints: number;
    public untestedEndpoints: number;
    public existingEndpoints: number;
    public coverage: number;
    public uncover: Array<EndpointModel>;
    public cover: Array<EndpointModel>;

    constructor(endpointExists: EndpointModel[], endpointTested: EndpointModel[]) {
        this.cover = endpointTested
            .map(el => new EndpointModel('', el.path, el.verb, true))
            .filter((el, index, self) => self.indexOf(el) === index);

        this.uncover = endpointExists
            .map(el => new EndpointModel('', el.path, el.verb, true))
            .filter(el => {
                if(this.cover.filter(f => f.verb === el.verb && f.path === el.path).length === 0)
                    return el;
            });

        this.testsFound = endpointTested.length;
        this.testedEndpoints = this.cover.length;
        this.untestedEndpoints = this.uncover.length;
        this.existingEndpoints = endpointExists.length;
        this.coverage = (this.testedEndpoints * 100) / this.existingEndpoints;

        if(this.coverage > 100) this.coverage = 100;
        
        information("Analysis result generated:");
        console.log(`Existing endpoints: ${this.existingEndpoints}`);
        console.log(`Tests found: ${this.testsFound}`);
        console.log(`Tested endpoints: ${this.testedEndpoints}`);
        console.log(`Untested endpoints: ${this.untestedEndpoints}`);
        console.log(`Coverage: ${this.coverage} %`);
        console.log(`Cover endpoints: ${JSON.stringify(this.cover.map(el => `${el.verb} ${el.path}`))}`);
        console.log(`Uncover endpoints: ${JSON.stringify(this.uncover.map(el => `${el.verb} ${el.path}`))}`);
    }
}