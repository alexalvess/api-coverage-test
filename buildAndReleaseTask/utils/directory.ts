import fs = require('fs');

function verifySubDirectory(directory: string, fileName: string): boolean {
    return fs.statSync(`${directory}\\${fileName}`).isDirectory();
}

export function getValidFiles(directory: string, validFiles: string[], extension: string = '.xml'): string[] {
    let filesAndSubdirectory: string[] = fs.readdirSync(directory);
    filesAndSubdirectory = filesAndSubdirectory.filter(f => f.endsWith(extension) || verifySubDirectory(directory, f));
    const xmlFiles = filesAndSubdirectory.filter(f => f.endsWith(extension));
    const subDirectories = filesAndSubdirectory.filter(f => !f.endsWith(extension));
    validFiles = validFiles.concat(...xmlFiles.map(m => `${directory}\\${m}`));

    subDirectories.forEach((file) => {
        validFiles = [...getValidFiles(`${directory}\\${file}`, validFiles)];
    });

    return validFiles;
}