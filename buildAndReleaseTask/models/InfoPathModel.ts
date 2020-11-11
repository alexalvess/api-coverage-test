export class InfoPathModel {
    verb: string;
    time: number;
    executeAt: Date;
    success: boolean;
    failureMessage: string | undefined;

    constructor(verb: string) {
        this.verb = verb;
        this.time = 0;
        this.executeAt = new Date();
        this.success = true;
    }
}