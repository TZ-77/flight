const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { runSeleniumAndGetPrice } = require('../utils/crawler');

const dbPath = path.join(__dirname, '../db/sqlite.db');

// ✅ 首頁：打開時執行爬蟲並回傳 index.html（不是 EJS）
router.get('/', async (req, res) => {
    try {
        await runSeleniumAndGetPrice(); // 執行即時爬蟲，寫入 DB
        res.sendFile(path.join(__dirname, '../public/index.html')); // 回傳 HTML
    } catch (e) {
        console.error('首頁載入錯誤：', e.message);
        res.sendFile(path.join(__dirname, '../public/index.html')); // 即使錯誤也顯示頁面
    }
});

// ✅ API: 即時爬取一筆票價資料並回傳 JSON
router.get('/api/live-price', async (req, res) => {
    try {
        const data = await runSeleniumAndGetPrice();
        res.json(data);
    } catch (e) {
        console.error('即時爬蟲錯誤：', e.message);
        res.status(500).json({ error: '爬蟲失敗', message: e.message });
    }
});

// ✅ API: 回傳所有票價紀錄（不過濾日期）
router.get('/api/today-history', (req, res) => {
    const db = new sqlite3.Database(dbPath);
    db.all(
        `SELECT airline, price, strftime('%H:%M', crawl_time) AS time
         FROM flight_prices
         ORDER BY crawl_time ASC`,
        [],
        (err, rows) => {
            if (err) {
                console.error('歷史資料查詢錯誤：', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

module.exports = router;
