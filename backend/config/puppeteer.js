const puppeteer = require('puppeteer');

const launchBrowser = async () => {
  return await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/chromium', // Confirm this path
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
};

module.exports = launchBrowser;