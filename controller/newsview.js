// const puppeteer = require('puppeteer');
// const newPath = require('path');

// module.exports.NewsApi = async (req, res) => {
//     try {
//         (async () => {
//             let { keyword } = req.body;

//             const browser = await puppeteer.launch({
//                 args: ["--no-sandbox", "--disable-setuid-sandbox"],
//                 headless: true,
//                 // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//                 executablePath: newPath.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
//             });
//             const page = await browser.newPage();

//             const baseURL = `https://www.cnbc.com/search/?query=${keyword}`; // Use the keyword for search

//             await page.goto(baseURL);

//             await page.waitForSelector('a.resultlink');

//             const news = await page.evaluate(() => {
//                 const elements = document.querySelectorAll('a.resultlink');
//                 return Array.from(elements, element => {
//                     const headline = element.querySelector('span.Card-title')?.textContent.trim();
//                     const link = element.href;

//                     if (headline) {
//                         return { headline, link };
//                     }
//                 }).filter(item => item !== undefined);
//             });

//             await browser.close();
//             return res.send({
//                 result: true,
//                 message: "data retrieved",
//                 data: news
//             })

//         })();

//     } catch (error) {
//         return res.send({
//             result: false,
//             message: error.message
//         })
//     }
// }


const puppeteer = require('puppeteer');
const path = require('path');

module.exports.NewsApi = async (req, res) => {
    let browser;

    try {
        const { keyword } = req.body;

        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
            executablePath: path.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
        });

        const page = await browser.newPage();
        const baseURL = `https://www.cnbc.com/search/?query=${keyword}`;

        await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

        try {
            await page.waitForSelector('a.resultlink', { timeout: 30000 });
        } catch (e) {
            throw new Error("News articles not found on the page within timeout");
        }

        const news = await page.evaluate(() => {
            const elements = document.querySelectorAll('a.resultlink');
            return Array.from(elements, element => {
                const headline = element.querySelector('span.Card-title')?.textContent?.trim();
                const link = element.href;
                if (headline) return { headline, link };
            }).filter(Boolean);
        });

        await browser.close();
        return res.send({
            result: true,
            message: "Data retrieved successfully",
            data: news
        });

    } catch (error) {
        if (browser) await browser.close(); // Safely close even on error
        if (!res.headersSent) {
            return res.status(500).send({
                result: false,
                message: error.message || "An error occurred while fetching news"
            });
        }
    }
};

