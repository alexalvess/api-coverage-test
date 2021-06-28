import { environment } from "../environments/environment";

export function information(message: string) {
    console.log(`############### ${message}`);
}

export function debug(message: string) {
    if(environment.debugger) {
        console.log(`>>>> ${message}`);
    }
}