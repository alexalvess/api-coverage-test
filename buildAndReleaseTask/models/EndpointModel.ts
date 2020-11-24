import { log } from "../utils/log";
import { InfoPathModel } from "./InfoPathModel";

export class EndpointModel {
    public path: string;
    public infoPath: Array<InfoPathModel>;

    constructor () {
        this.path = '';
        this.infoPath = new Array<InfoPathModel>();
    }

    public addInfoPath (verb: string, time: number, executeAt: Date, success: boolean, message: string | undefined): void {
        if(!this.infoPath.find(f => f.verb === verb.toUpperCase())) {
            const infoPath = new InfoPathModel(verb.toUpperCase());
            infoPath.time = time;
            infoPath.executeAt = executeAt;
            infoPath.success = success;
            infoPath.failureMessage = message;

            this.infoPath.push(infoPath);
        }
    }

    public setByTestProp (testName: string, time: number, executeAt: Date, success: boolean, message: string | undefined): void {
        const info = testName.split(' ');
        const path = info[info.length - 1];
        const verb = info[info.length - 2];
        this.path = path;

        this.addInfoPath(verb, time, executeAt, success, message);
    }

    public static setSamePath(endpoints: Array<EndpointModel>, testName: string, time: number, executeAt: Date, success: boolean, message: string | undefined): void {
        const info = testName.split(' ');
        const path = info[info.length - 1];
        const verb = info[info.length - 2];

        let endpoint = endpoints.find(f => f.path === path);

        if(endpoint) {
            endpoint.addInfoPath(verb, time, executeAt, success, message);
        } else {
            endpoint = new EndpointModel();
            endpoint.path = path;
            endpoint.addInfoPath(verb, time, executeAt, success, message);
            endpoints.push(endpoint);
        }
    }

    public static totalEndpoints(context: string, endpoints: Array<EndpointModel>): number {
        const total = endpoints.reduce((accumulator, current) => accumulator + current.infoPath.length, 0)
        log(`${context}: ${total}`);
        
        endpoints.forEach((element) => {
            console.log(`Path: ${element.path} | Verbs: ${element.infoPath.map(item => item.verb)}`);
        });

        return total;
    }
}