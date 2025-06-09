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

// 中介層設定
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 靜態資源：使用 public/index.html 為首頁
app.use(express.static(path.join(__dirname, 'public')));

// 📄 瀏覽器請求首頁會回傳 public/index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由（包含 /api/live-price 和 /api/today-history）
app.use('/users', usersRouter);
app.use('/', indexRouter);

// 啟動伺服器
app.listen(port, () => {
    console.log(`🚀 伺服器已啟動：http://localhost:${port}`);
});

module.exports = app;
