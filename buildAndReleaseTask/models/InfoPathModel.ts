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

    public setTime(time: number): void {
        this.time = time;
    }

    public setExecuteDate(executeAt: Date): void {
        this.executeAt = executeAt;
    }
}