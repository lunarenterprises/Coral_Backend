const formidable = require('formidable');
const XLSX = require('xlsx');
const { parseAmount } = require('../util/parseAmount')
const model = require('../model/uploadExcel')

module.exports.UploadInvestmentCalculaterExcel = async (req, res) => {
    try {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(400).send({
                    result: false,
                    message: 'Error parsing form'
                });
            }

            const file = files.file;

            if (!file) {
                return res.status(400).send({
                    result: false,
                    message: "no file found."
                });
            }

            try {
                const filePath = file.filepath;
                const workbook = XLSX.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[1]];

                // Convert to JSON with formatted values
                const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // 👈 `raw: false` gives displayed values
                // Transform data to match DB schema
                const dbData = data.map(row => {
                    // Convert percentage strings to decimals
                    let duration = row['Duration']?.toLowerCase() === "1 year" ? "1" :
                        row['Duration']?.toLowerCase() === "2 year" ? "2" :
                            row['Duration']?.toLowerCase() === "3 year" ? "3" :
                                row['Duration']?.toLowerCase() === "above 3 years" ? ">3" :
                                    row['Duration']?.toLowerCase() === "minimum 2.5 years" ? ">2.5" :
                                        row['Duration']?.toLowerCase() === "minimum 2 years" ? ">2" : ""

                    let amountText = row['Amount']
                    const parsedAmount = parseAmount(Array.isArray(amountText) ? amountText.join('-') : amountText);


                    return {
                        ri_amount_from: parsedAmount?.from ?? null,
                        ri_amount_to: parsedAmount?.to ?? null,
                        ri_project: row['Projects'] || 'Any', // Default to 'Any' if not specified
                        ri_return_year: row['% return yearly'],
                        ri_return_month: row['Monthly Return'],
                        ri_wf: row['Withdrawal frequency'] || null, // Default to 'Any'
                        ri_duration: duration, // Handle missing duration
                        ri_security: row['Security option'],
                        // These fields aren't in Excel but are in your DB schema
                        ri_no_of_shares: null, // Default or calculate if needed
                        ri_profit: null,       // Default or calculate if needed
                        ri_payout_amount: null // Default or calculate if needed
                    };
                });

                let createdData = await model.AddToDB(dbData)
                if (createdData.affectedRows > 0) {
                    return res.send({
                        result: true,
                        message: "Investment Calculater Data inserted successfully"
                    })
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to insert Investment Calculater data."
                    })
                }
            } catch (error) {
                console.error('Processing error:', error);
                return res.status(500).send({
                    result: false,
                    message: error.message
                });
            }
        })
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}


module.exports.UploadHGFSExcel = async (req, res) => {
    try {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(400).send({
                    result: false,
                    message: 'Error parsing form'
                });
            }

            const file = files.file;

            if (!file) {
                return res.status(400).send({
                    result: false,
                    message: "No file found."
                });
            }

            try {
                const filePath = file.filepath;
                const workbook = XLSX.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[2]]; // Use first sheet

                // Read and convert to JSON
                const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                console.log(data, "datat");

                // Transform to DB schema
                const dbData = data.map(row => {
                    return {
                        industry: row['Industry']?.trim() || null,
                        previous_year_growth: parseFloat(row['Previous year growth'].replace('%', '')) || 0,
                        last_year_growth: parseFloat(row['Last year Growth'].replace('%', '')) || 0,
                        growth: parseFloat(row['Growth'].replace('%', '')) || 0
                    };
                });
                console.log(dbData, "dbData");

                // Insert into DB
                const createdData = await model.AddHgfsData(dbData);

                if (createdData.affectedRows > 0 || createdData.insertId) {
                    return res.send({
                        result: true,
                        message: "Data inserted successfully"
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to insert data."
                    });
                }
            } catch (error) {
                console.error('Processing error:', error);
                return res.status(500).send({
                    result: false,
                    message: error.message
                });
            }
        });
    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};



module.exports.UploadCurrentInvestmentExcel = async (req, res) => {
    try {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(400).send({
                    result: false,
                    message: 'Error parsing form'
                });
            }

            const file = files.file;

            if (!file) {
                return res.status(400).send({
                    result: false,
                    message: "No file found."
                });
            }

            try {
                const filePath = file.filepath;
                const workbook = XLSX.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[3]];

                const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                const parseAED = (val) => {
                    if (!val) return 0;
                    return parseFloat(
                        val.toString().replace(/[^\d.]/g, '').replace(/,/g, '')
                    ) || 0;
                };

                const dbData = data.map(row => ({
                    company: row['Companies']?.trim() || null,
                    current_investment: parseAED(row['Current Investment']),
                    growth_percent: parseFloat(row['Growth %']) || 0,
                    min_investment: parseAED(row['Minimum Investment (Private investors can join with for Project wise CWI investment pools)']),
                    tc_current_CAGR: null,
                    tc_expected_CAGR: null


                }));

                const result = await model.AddCurrentInvestmentData(dbData);

                if (result.affectedRows > 0 || result.insertId) {
                    return res.send({
                        result: true,
                        message: "Current investment data inserted successfully"
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to insert current investment data."
                    });
                }
            } catch (error) {
                console.error('Processing error:', error);
                return res.status(500).send({
                    result: false,
                    message: error.message
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message
        });
    }
};



module.exports.UploadFutureInvestmentExcel = async (req, res) => {
    try {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                return res.status(400).send({
                    result: false,
                    message: 'Error parsing form'
                });
            }

            const file = files.file;

            if (!file) {
                return res.status(400).send({
                    result: false,
                    message: "No file found."
                });
            }

            try {
                const filePath = file.filepath;
                const workbook = XLSX.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[4]]; // Sheet 4

                const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                const parseAED = (val) => {
                    if (!val) return 0;
                    return parseFloat(val.toString().replace(/[^\d.]/g, '').replace(/,/g, '')) || 0;
                };

                const dbData = data.map(row => {
                    const expectedRoi = row['Expected ROI']
                        ? row['Expected ROI'].toString().replace(/[%\s]/g, '')
                        : null;

                    return {
                        industry: row['Industries']?.trim() || null,
                        planned_investment: parseAED(row['Planned Investments']),
                        expected_roi: expectedRoi,
                        min_investment: parseAED(row['Minimum Investment'])
                    };
                });
                console.log(dbData, "dd");

                const result = await model.AddFutureInvestmentData(dbData);

                if (result.affectedRows > 0 || result.insertId) {
                    return res.send({
                        result: true,
                        message: "Future investment data inserted successfully"
                    });
                } else {
                    return res.send({
                        result: false,
                        message: "Failed to insert Future investment data."
                    });
                }
            } catch (error) {
                console.error('Processing error:', error);
                return res.status(500).send({
                    result: false,
                    message: error.message
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            result: false,
            message: error.message
        });
    }
};
