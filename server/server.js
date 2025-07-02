const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: '../.env' });

// Expressアプリの初期化
const app = express();

// ミドルウェア
app.use(express.json());
app.use(cors());

// MongoDBへの接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genscope')
  .then(() => console.log('MongoDB接続成功'))
  .catch(err => console.error('MongoDB接続エラー:', err));

// ルート
app.use('/api/auth', require('./routes/auth'));

// 本番環境では静的ファイルを提供
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// ポート設定
const PORT = process.env.PORT || 5000;

// サーバー起動
app.listen(PORT, () => console.log(`サーバーがポート${PORT}で起動しました`));
