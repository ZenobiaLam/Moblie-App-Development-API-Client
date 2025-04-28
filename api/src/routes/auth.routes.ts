import { Router } from 'express';
import { signup, login, checkAuth } from '../controllers/auth.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// 用戶註冊
router.post('/signup', signup);

// 用戶登入
router.post('/login', login);

// 檢查登入狀態
router.get('/check', authenticateToken, checkAuth);

export default router; 