const fastCsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

module.exports.convertToCSV = async (userId, results) => {
    // ✅ Define the EBS-mounted directory and CSV file path
    const dirname = path.join('/mnt/ebs500/uploads/statements'); // Use EBS directory
    const timestamp = Date.now(); // Get the current timestamp
    const outputFilePath = path.join(dirname, `wallet_statement_user_${userId}_${timestamp}.csv`);

    // ✅ Ensure the folder exists on EBS
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        // ✅ Write the CSV file
        fastCsv.writeToPath(outputFilePath, results, { headers: true })
            .on('finish', () => {
                resolve(outputFilePath.replace('/mnt/ebs500', '')); // Resolve with full path
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};