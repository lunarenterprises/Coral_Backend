const puppeteer = require('puppeteer');
const newPath = require('path');

module.exports.NewsApi = async (req, res) => {
    try {
        (async () => {
            let { keyword } = req.body;

            const browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                headless: true,
                // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                executablePath: newPath.resolve(process.env.HOME, 'chromium/chrome-linux/chrome')
            });
            const page = await browser.newPage();

            const baseURL = `https://www.cnbc.com/search/?query=${keyword}`; // Use the keyword for search

            await page.goto(baseURL);

            await page.waitForSelector('a.resultlink');

            const news = await page.evaluate(() => {
                const elements = document.querySelectorAll('a.resultlink');
                return Array.from(elements, element => {
                    const headline = element.querySelector('span.Card-title')?.textContent.trim();
                    const link = element.href;

                    if (headline) {
                        return { headline, link };
                    }
                }).filter(item => item !== undefined);
            });

            await browser.close();
            return res.send({
                result: true,
                message: "data retrieved",
                data: news
            })

        })();

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}

