import { Router } from 'express';
import { getBookmarks, addItemToBookmarks, removeItemFromBookmarks } from '../controllers/bookmarks.controller';
import { authenticateToken } from '../utils/auth';

const router = Router();

// 所有收藏相關的路由都需要身份驗證
router.use(authenticateToken);

// 獲取用戶收藏列表
router.get('/', getBookmarks);

// 添加收藏
router.post('/:item_id', addItemToBookmarks);

// 移除收藏
router.delete('/:item_id', removeItemFromBookmarks);

export default router; 