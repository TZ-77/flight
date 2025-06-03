const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const db = require('./db');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000;


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 查詢所有票價
app.get('/api/price', (req, res) => {
    db.all('SELECT * FROM flights_table', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 查詢某年份票價 (GET)
app.get('/api', (req, res) => {
    const year = req.query.year;
    if (!year) return res.status(400).json({ error: '請提供 year 參數' });

    db.all(
        `SELECT * FROM flights_table WHERE strftime('%Y', date) = ?`,
        [year],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 查詢某年份票價 (POST)
app.post('/api', (req, res) => {
    const year = req.body.year;
    if (!year) return res.status(400).json({ error: '請提供 year 參數' });

    db.all(
        `SELECT * FROM flights_table WHERE strftime('%Y', date) = ?`,
        [year],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 查詢單一日期票價
app.get('/api/flight/:date', (req, res) => {
    const date = req.params.date;
    db.get(`SELECT * FROM flights_table WHERE date = ?`, [date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json(null);
        res.json(row);
    });
});

// 查詢整個 2025 年 5 月的票價
app.get('/api/flights/may', (req, res) => {
    db.all(
        `SELECT * FROM flights_table WHERE date LIKE '2025-05-%' ORDER BY date ASC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 查詢整個 2025 年 6 月的票價
app.get('/api/flights/june', (req, res) => {
    db.all(
        `SELECT * FROM flights_table WHERE date LIKE '2025-06-%' ORDER BY date ASC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ✅ 新增或更新（只需日期與價格）
app.post('/api/upsert', (req, res) => {
    const { date, price } = req.body;
    if (!date || !price) {
        return res.status(400).json({ error: '請提供 date 和 price' });
    }

    db.get(`SELECT * FROM flights_table WHERE date = ?`, [date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // 若已存在 -> 更新價格
            db.run(
                `UPDATE flights_table SET price = ? WHERE date = ?`,
                [price, date],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, message: '更新成功' });
                }
            );
        } else {
            // 若不存在 -> 新增預設資料（只需填基本欄位）
            db.run(
                `INSERT INTO flights_table (flight_number, departure, arrival, date, price) VALUES (?, ?, ?, ?, ?)`,
                ['長榮航空', '台北', '東京', date, price],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, message: '新增成功' });
                }
            );
        }
    });
});

app.listen(port, () => {
    console.log(`伺服器已啟動：http://localhost:${port}`);
});

module.exports = app;
