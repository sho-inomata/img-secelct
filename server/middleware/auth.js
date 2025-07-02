const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWTトークンを検証し、ユーザーを認証するミドルウェア
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // BearerトークンからJWTを取得
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Cookieからトークンを取得
    token = req.cookies.token;
  }

  // トークンが存在しない場合
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '認証が必要です'
    });
  }

  try {
    // トークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ユーザーを取得
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '認証に失敗しました'
    });
  }
};

// 特定のロールを持つユーザーのみアクセスを許可
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'このリソースへのアクセス権限がありません'
      });
    }
    next();
  };
};
