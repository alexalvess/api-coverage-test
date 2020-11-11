import { InfoPathModel } from "./InfoPathModel";

export class EndpointModel {
    public path: string;
    public infoPath: Array<InfoPathModel>;

    constructor () {
        this.path = '';
        this.infoPath = new Array<InfoPathModel>();
    }

    public addInfoPath (verb: string, time: number, executeAt: Date): void {
        if(!this.infoPath.find(f => f.verb === verb.toUpperCase())) {
            const infoPath = new InfoPathModel(verb.toUpperCase());
            infoPath.setTime(time);
            infoPath.setExecuteDate(executeAt);

            this.infoPath.push(infoPath);
        }
    }

    public setByTestProp (testName: string, time: number, executeAt: Date): void {
        const info = testName.split(' ');
        const path = info[info.length - 1];
        const verb = info[info.length - 2];
        this.path = path;

        this.addInfoPath(verb, time, executeAt);
    }

    public static setSamePath(endpoints: Array<EndpointModel>, testName: string, time: number, executeAt: Date): void {
        const info = testName.split(' ');
        const path = info[info.length - 1];
        const verb = info[info.length - 2];

        let endpoint = endpoints.find(f => f.path === path);

        if(endpoint) {
            endpoint.addInfoPath(verb, time, executeAt);
        } else {
            endpoint = new EndpointModel();
            endpoint.path = path;
            endpoint.addInfoPath(verb, time, executeAt);
            endpoints.push(endpoint);
        }
    }

    public static log(context: string, endpoints: Array<EndpointModel>): number {
        const total = endpoints.reduce((accumulator, current) => accumulator + current.infoPath.length, 0)
        console.log(`############### ${context}: ${total}`);
        
        endpoints.forEach((element) => {
            console.log(`Path: ${element.path} | Verbs: ${element.infoPath.map(item => item.verb)}`);
        });

        return total;
    }
}