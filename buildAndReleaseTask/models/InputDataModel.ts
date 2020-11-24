import { environment } from "../environments/environment";
import { inputBasicValidation, webhookValidation } from "../utils/validations";
import { TestType } from "./enums/TestType";

export class InputDataModel {
    url: string;
    testResultPath: string;
    testType: TestType;
    webhook: string | undefined;
    buildNumber: string | undefined;
    application: string | undefined;

    constructor(
        apiUrl: string | undefined, 
        swaggerPath: string | undefined,
        testResultPath: string | undefined,
        testType: string | undefined) {
    
        const errors = inputBasicValidation(apiUrl, swaggerPath, testResultPath);
        if(errors.length > 0) {
            throw new Error(JSON.stringify(errors));
        }

        apiUrl = apiUrl?.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        swaggerPath = swaggerPath?.startsWith('/') ? swaggerPath.substring(1) : swaggerPath;

        this.url = `${apiUrl}/${swaggerPath}`;
        this.testResultPath = testResultPath ?? '';

        if(testType === 'testSuite') {
            this.testType = TestType.TestSuite;
        } else if(testType === 'testCase') {
            this.testType = TestType.TestCase;
        } else {
            throw new Error('Invalid test type.');
        }
    }

    public setWebHookData = (
        webhook: string | undefined, 
        build: string | undefined, 
        application: string | undefined) => {
        if(!webhook) {
            const errors = webhookValidation(build, application);
            if(errors.length > 0) {
                throw new Error(JSON.stringify(errors));
            }

            this.webhook = webhook;
            this.buildNumber = build;
            this.application = application;
        }
    }
}