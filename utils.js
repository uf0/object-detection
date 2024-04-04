import fs from "fs"
import path from "path"

// Function to write a file and create folder if it doesn't exist
export function writeFileWithFolderCreation(filePath, data, encoding = "utf-8") {
    // Extract directory path
    const directory = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, data, encoding);
}

export function readExtensionFiles(directoryPath, ext) {
    // Get all items in the directory
    const items = fs.readdirSync(directoryPath);

    // Filter out only CSV files
    const files = items.filter(item => {
        return path.extname(item).toLowerCase() === ext;
    });

    return files;
}

// Function to list all images in one folder
export function listImages(directoryPath) {
    // Get all items in the directory
    const items = fs.readdirSync(directoryPath);

    // Filter out only images
    const images = items.filter(item => {
        return ['.jpg', '.jpeg', '.png'].includes(path.extname(item).toLowerCase());
    });

    return images;
}