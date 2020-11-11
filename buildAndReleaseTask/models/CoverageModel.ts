import { EndpointModel } from "./EndpointModel";

export class CoverageModel {
    public tested: number;
    public existed: number;
    public coverage: number;
    public totalUncover: number;
    public uncover: Array<EndpointModel>;

    constructor() {
        this.tested = 0;
        this.existed = 0;
        this.coverage = 0;
        this.totalUncover = 0;
        this.uncover = new Array<EndpointModel>();
    }

    public getCoverage(): number {
        this.coverage = (this.tested * 100) / this.existed;
        return this.coverage;
    }

    public coverLog(): void {
        this.coverage = (this.tested * 100) / this.existed;
        console.log(`############### Coverage: ${this.coverage} %`);
    }

    public uncoverLog(): void {
        this.totalUncover = this.uncover.reduce((accumulator, current) => accumulator + current.infoPath.length, 0);

        console.log(`############### Uncover endpoints: ${this.totalUncover}`);
        this.uncover.forEach(item => {
            console.log(`Path: ${item.path} | Verbs: ${item.infoPath.map(m => m.verb)}`);
        });
    }
}