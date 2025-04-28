var jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// 獲取 JWT 密鑰，如果不存在則使用預設值
const JWT_SECRET = process.env.JWT_SECRET || 'yoga_app_secret_key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

// 生成 JWT Token
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// 驗證 JWT Token
export const verifyToken = (token: string): { userId: number } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
};

// 身份驗證中間件
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 從請求頭中獲取 Authorization 頭
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供認證令牌' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '無效或過期的令牌' });
  }
  
  // 將用戶信息附加到請求對象
  // 擴展Request類型
  (req as any).user = { userId: decoded.userId };
  
  next();
}; 