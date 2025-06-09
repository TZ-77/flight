// 📁 utils/crawler.js
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../db/sqlite.db');

async function runSeleniumAndGetPrice() {
    console.log('🚀 runSeleniumAndGetPrice 開始執行...');

    const origin = 'TPE';
    const destination = 'TYO';
    const departure_date = '2025-07-29';
    const return_date = '2025-08-05';

    const url = `https://tw.trip.com/flights/showfarefirst?dcity=${origin}&acity=${destination}&ddate=${departure_date}&rdate=${return_date}&triptype=rt&class=y&quantity=1&locale=zh-TW&curr=TWD`;
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('🌐 開始瀏覽網址：', url);
        await driver.get(url);

        console.log('⏳ 等待完成...');
        await driver.sleep(25000); // 手動驗證

        console.log('🔍 等待票價元素出現...');
        await driver.wait(until.elementLocated(By.css('span[data-price]')), 10000);
        console.log('🎯 票價元素已找到！');

        const priceElem = await driver.findElement(By.css('span[data-price]'));
        const price = parseInt(await priceElem.getAttribute('data-price'));

        const airlineElem = await driver.findElement(By.css('div.flights-name'));
        const airline = await airlineElem.getText();

        // ✅ 台灣時間格式（YYYY-MM-DD HH:MM:SS）
        const now = new Date();
        now.setHours(now.getHours() + 8); // UTC+8
        const crawlTime = now.toISOString().replace('T', ' ').substring(0, 19);

        console.log('💾 準備寫入資料庫...');
        const db = new sqlite3.Database(dbPath);
        db.run(`
            INSERT INTO flight_prices (
                origin, destination, departure_date, return_date,
                airline, price, crawl_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [origin, destination, departure_date, return_date, airline, price, crawlTime], function (err) {
            if (err) {
                console.error('❌ 寫入失敗:', err.message);
            } else {
                console.log(`✅ 寫入成功：${airline} NT$${price} @ ${crawlTime}`);
            }
        });
        db.close();

        return {
            origin,
            destination,
            departure_date,
            return_date,
            airline,
            price,
            time: crawlTime
        };
    } catch (err) {
        console.error('❌ 爬蟲錯誤：', err.message);
        throw err;
    } finally {
        await driver.quit();
        console.log('🛑 driver 關閉');
    }
}

module.exports = { runSeleniumAndGetPrice };
