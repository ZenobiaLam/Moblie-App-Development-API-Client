import { Router } from 'express';
import { getYogaActionsList, getYogaActionDetail } from '../controllers/yoga-actions.controller';

const router = Router();

// 獲取瑜伽動作列表
router.get('/', getYogaActionsList);

// 獲取單個瑜伽動作詳情
router.get('/:id', getYogaActionDetail);

export default router; 