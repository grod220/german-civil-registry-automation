const puppeteer = require('puppeteer');
const alert = require('alert-node');
const cron = require('node-cron');

const MARRIAGE_MAIN_PAGE = 'https://service.berlin.de/standort/122913/';
const TERMIN_PAGE_LINK_SELECTOR = 'a[href*="dienstleister=122913&anliegen[]=318961"]';

const TEST_PAGE = 'https://service.berlin.de/dienstleistung/120686/';
const TEST_SELECTOR = 'a[href*="https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&anliegen[]=120686&dienstleisterlist=122210,122217,122219,122227&herkunft=http%3A%2F%2Fservice.berlin.de%2Fdienstleistung%2F120686%2F"]';

async function findAppointments() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(MARRIAGE_MAIN_PAGE, {waitUntil: 'networkidle2'});
    await page.click(TERMIN_PAGE_LINK_SELECTOR)
    await page.waitForSelector('.calendar-month-table:nth-of-type(2) th.month')
    const month = await page.$eval('.calendar-month-table:nth-of-type(2) th.month', el => el.textContent);
    const results = await page.$$eval('.calendar-month-table:nth-of-type(2) td.buchbar', els => els.map(el => el.textContent));
    const formatted = results.map(result => `${month.replace(' 2020', '')} ${result}`)
    if (formatted.length) {
        alert(`PING! results: ${formatted}`)
        return true;
    }
    await browser.close();
}

const task = cron.schedule('* * * * *', async () => {
    console.log('Running findAppointments()...', Date.now());
    const result = await findAppointments();
    if (result) {
        console.log('Success! Exiting...')
        task.stop();
    }
});