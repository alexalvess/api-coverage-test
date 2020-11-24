export function log(message: string) {
    if(!message.endsWith('.')) {
        message += '.';
    }
    
    console.log(`############### ${message}`);
}