const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ 無法開啟資料庫:', err.message);
        return;
    }
    console.log('✅ 成功開啟資料庫:', dbPath);

    db.run(`
        CREATE TABLE IF NOT EXISTS flight_prices (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     origin TEXT,
                                                     destination TEXT,
                                                     departure_date TEXT,
                                                     return_date TEXT,
                                                     airline TEXT,
                                                     price INTEGER,
                                                     crawl_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (tableErr) => {
        if (tableErr) {
            console.error('❌ 建立 flight_prices 失敗:', tableErr.message);
        } else {
            console.log('✅ flight_prices 資料表已建立（如尚未存在）');
        }
    });
});

module.exports = db;
