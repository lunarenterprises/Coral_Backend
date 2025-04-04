const fastCsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

module.exports.convertToCSV = async (userId, results) => {
    // Define the directory and file path
    const dirname = path.join(__dirname, '../uploads/statements'); // Corrected path
    const timestamp = Date.now(); // Get the current timestamp
    const outputFilePath = path.join(dirname, `wallet_statement_user_${userId}_${timestamp}.csv`); // Full file path

    // Ensure the folder exists
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true }); // Create directories recursively
    }

    return new Promise((resolve, reject) => {
        // Write the CSV file
        const csvStream = fastCsv.writeToPath(outputFilePath, results, { headers: true })
            .on('finish', () => {
                resolve(outputFilePath); // Resolve with the file path
            })
            .on('error', (err) => {
                reject(err); // Reject if an error occurs
            });
    });
};