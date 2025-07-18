var puppeteer = require('puppeteer');
const newPath = require('path');

// module.exports.createPdfWithPuppeteer = async function (htmlContent, path) {
//     try {
//         let browser = await puppeteer.launch({
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//             headless: true,
//             // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//             executablePath: newPath.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
//         });
//         let page = await browser.newPage();

//         await page.setContent(htmlContent, {
//             waitUntil: "networkidle0",
//             timeout: 60000,

//         });

//         await page.pdf({
//             path: path,
//             format: "A4",
//             margin: {
//                 top: "10px",
//                 bottom: "10px",
//                 left: "40px",
//                 right: "40px",
//             },
//             printBackground: true,
//             timeout: 0,
//         });

//         await browser.close();
//     } catch (err) {
//         console.error("Error_creating_PDF", err);
//     }
//     return path;
// }

// module.exports.createPdfWithPuppeteer = async (htmlContent, path) => {
//     try {
//         let browser = await puppeteer.launch({
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//             headless: "new",
//             executablePath: newPath.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
//         });
//         let page = await browser.newPage();

//         await page.setContent(htmlContent, { "waitUntil": "networkidle0", timeout: 60000 });

//         await page.pdf({
//             path: path,
//             format: "A4",
//             printBackground: true, // Only one instance of this key
//             displayHeaderFooter: true,
//             margin: { top: "50px", bottom: "50px" },
//         });

//         await browser.close();
//     } catch (err) {
//         console.error("Error_creating_PDF", err);
//     }
//     return path;
// }

module.exports.createPdfWithPuppeteer = async (htmlContent, path) => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: "new",
            executablePath: newPath.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            // waitUntil: "networkidle0",
            waitUntil: "domcontentloaded",
            timeout: 120000
        });

        await page.pdf({
            path: path,
            format: "A4",
            printBackground: true,
            displayHeaderFooter: true,
            margin: { top: "50px", bottom: "50px" },
        });

        await browser.close();
    } catch (err) {
        console.error("Error_creating_PDF", err);
    }
    return path;
};
