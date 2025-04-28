import { Request, Response } from 'express';
import { findUserByUsername, findUserById, createUser, validateUserPassword } from '../models/users';
import { generateToken, verifyToken } from '../utils/auth';

// 用戶註冊
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // 驗證請求數據
    if (!username || !password) {
      return res.status(400).json({ error: '用戶名和密碼都是必填項' });
    }
    
    // 密碼長度檢查
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度必須至少為6個字符' });
    }
    
    // 創建新用戶
    try {
      const newUser = await createUser(username, password);
      
      // 生成 JWT
      const token = generateToken(newUser.id);
      
      // 返回用戶數據和令牌
      return res.status(201).json({
        user_id: newUser.id,
        token
      });
    } catch (error) {
      if (error instanceof Error && error.message === '用戶名已存在') {
        return res.status(400).json({ error: '用戶名已存在' });
      }
      throw error;
    }
  } catch (error) {
    console.error('註冊用戶時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
};

// 用戶登入
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // 驗證請求數據
    if (!username || !password) {
      return res.status(400).json({ error: '用戶名和密碼都是必填項' });
    }
    
    // 查找用戶
    const user = findUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }
    
    // 驗證密碼
    const isPasswordValid = await validateUserPassword(user, password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }
    
    // 生成 JWT
    const token = generateToken(user.id);
    
    // 返回用戶數據和令牌
    return res.status(200).json({
      user_id: user.id,
      token
    });
  } catch (error) {
    console.error('登入用戶時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
};

// 檢查登入狀態
export const checkAuth = (req: Request, res: Response) => {
  try {
    // 從請求中獲取用戶ID
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: '未找到有效的用戶ID' });
    }
    
    // 查找用戶
    const user = findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '找不到用戶' });
    }
    
    res.status(200).json({ user_id: user.id });
  } catch (error) {
    console.error('檢查用戶認證狀態時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
}; 