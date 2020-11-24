let errors: Array<{prop: string, message: string}>;

export function inputBasicValidation(
    apiUrl: string | undefined, 
    swaggerPath: string | undefined, 
    testResultPath: string | undefined) {
    errors = new Array<{prop: string, message: string}>();
    
    if(!apiUrl) {
        errors.push({
            prop: 'apiUrl',
            message: 'Inform a valid API url.'
        });
    }

    if(!swaggerPath) {
        errors.push({
            prop: 'swaggerPath',
            message: 'Inform a valid SWAGGER path.'
        });
    }

    if(!testResultPath || testResultPath.includes('.')) {
        errors.push({
            prop: 'testResultPath',
            message: 'Inform a valid PATH Location for Test Result.'
        });
    }

    return errors;
}

export function webhookValidation(buildNumber: string | undefined, application: string | undefined) {
    errors = new Array<{prop: string, message: string}>();

    if(!buildNumber) {
        errors.push({
            prop: 'buildNumber',
            message: 'Inform a valid BUILD NUMBER.'
        });
    }

    if(!application) {
        errors.push({
            prop: 'application',
            message: 'Inform a valid APPLICATION name.'
        });
    }

    return errors;
}