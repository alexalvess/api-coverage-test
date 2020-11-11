import { WebhookTestModel } from "./WebhookTestModel";

export class WebhookModel {
    apiTested: string;
    tests: Array<WebhookTestModel>;

    constructor() {
        this.apiTested = '';
        this.tests = new Array<WebhookTestModel>();
    }
}