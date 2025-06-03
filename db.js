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
        console.error('無法開啟資料庫:', err.message);
        return;
    }
    console.log('成功開啟資料庫:', dbPath);

    db.run(`DROP TABLE IF EXISTS flights_table`, (dropErr) => {
        if (dropErr) {
            console.error('刪除舊資料表失敗:', dropErr.message);
            return;
        }
        console.log('舊的 flights_table 已刪除');

        db.run(`
            CREATE TABLE IF NOT EXISTS flights_table (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         flight_number TEXT NOT NULL,
                                                         departure TEXT NOT NULL,
                                                         arrival TEXT NOT NULL,
                                                         date TEXT NOT NULL,
                                                         price REAL
            )
        `, (tableErr) => {
            if (tableErr) {
                console.error('建立 flights_table 失敗:', tableErr.message);
                return;
            }
            console.log('flights_table 已建立');

            const mayFlights = [
                7900, 8100, 8300, 8200, 8000, 7800, 7700, 7600, 7500, 7400,
                7300, 7200, 7100, 7000, 6900, 6800, 6700, 6600, 6500, 6400,
                6300, 6200, 6100, 6000, 5900, 5800, 5700, 5600, 5500, 5400, 5300
            ];

            // 新增 5 月與 6 月資料
            for (let i = 0; i < 31; i++) {
                const day = (i + 1).toString().padStart(2, '0');
                const basePrice = mayFlights[i];
                const mayDate = `2025-05-${day}`;
                const juneDate = `2025-06-${day}`;

                const mayPrice = basePrice;
                const junePrice = Math.round(basePrice * (1 + (Math.random() * 0.1 - 0.05))); // ±5%

                // 插入 5 月
                db.run(
                    `INSERT INTO flights_table (flight_number, departure, arrival, date, price) VALUES (?, ?, ?, ?, ?)`,
                    ['長榮航空', '台北', '東京', mayDate, mayPrice],
                    (err) => {
                        if (err) console.error('新增 5 月失敗:', err.message);
                    }
                );

                // 插入 6 月
                db.run(
                    `INSERT INTO flights_table (flight_number, departure, arrival, date, price) VALUES (?, ?, ?, ?, ?)`,
                    ['長榮航空', '台北', '東京', juneDate, junePrice],
                    (err) => {
                        if (err) console.error('新增 6 月失敗:', err.message);
                    }
                );
            }
        });
    });
});

module.exports = db;