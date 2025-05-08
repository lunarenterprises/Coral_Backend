var puppeteer = require('puppeteer');

module.exports.createPdfWithPuppeteer = async function (htmlContent, path) {
    try {
        let browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
            // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            executablePath: "~/chromium/chrome-linux/chrome"
        });
        let page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 60000,

        });

        await page.pdf({
            path: path,
            format: "A4",
            margin: {
                top: "10px",
                bottom: "10px",
                left: "40px",
                right: "40px",
            },
            printBackground: true,
            timeout: 0,
        });

        await browser.close();
    } catch (err) {
        console.error("Error_creating_PDF", err);
    }
    return path;
}