import { information, debug } from "./log";
import https = require("https");
const axios = require('axios');

export function makePostRequest(payload: any, url: string): void {
    information(`Send to API: ${url}`);
    const instance = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        }),
        headers: {'content-type': 'application/json'}
    });

    instance.post(url, payload)
        .then(() => {
            information("Request made successfully.");
        })
        .catch((error: any) => {
            information("Error: ");
            console.log(error);
            throw new Error('Error to make request');
    });
}

export function makeGetRequest(url: string): Promise<any> {
    information(`Make request to: ${url}`);
    const instance = axios.create({
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        }),
        headers: {'content-type': 'application/json'}
    });

    return instance.get(url);
}