import { environment } from "../environments/environment";
import { inputBasicValidation, webhookValidation } from "../utils/validations";
import { TestType } from "./enums/TestType";

export class InputDataModel {
    url: string;
    testResultPath: string;
    testType: TestType;
    minimumQualityGate: number;
    webhook: Array<string> | undefined;
    buildNumber: string | undefined;
    application: string | undefined;

    constructor(
        apiUrl: string | undefined, 
        swaggerPath: string | undefined,
        testResultPath: string | undefined,
        testType: string | undefined,
        minimumQualityGate: number | undefined) {
    
        this.minimumQualityGate = minimumQualityGate ?? 0;

        const errors = inputBasicValidation(apiUrl, swaggerPath, testResultPath);
        if(errors.length > 0) {
            throw new Error(JSON.stringify(errors));
        }

        apiUrl = apiUrl?.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        swaggerPath = swaggerPath?.startsWith('/') ? swaggerPath.substring(1) : swaggerPath;

        this.url = `${apiUrl}/${swaggerPath}`;
        this.testResultPath = testResultPath ?? '';

        if(testType === 'postman') {
            this.testType = TestType.Postman;
        } else if(testType === 'mocha') {
            this.testType = TestType.Mocha;
        } else {
            throw new Error('Invalid test type.');
        }
    }

    public setWebHookData = (
        webhook: string | undefined, 
        build: string | undefined, 
        application: string | undefined) => {
        if(webhook && webhook !== '') {
            const errors = webhookValidation(build, application);
            if(errors.length > 0) {
                throw new Error(JSON.stringify(errors));
            }

            this.webhook = webhook?.split(';');
            this.buildNumber = build;
            this.application = application;
        }
    }
}