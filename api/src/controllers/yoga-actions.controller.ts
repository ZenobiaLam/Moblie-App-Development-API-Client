import { Request, Response } from 'express';
import { getYogaActions, getYogaActionById } from '../models/yoga-actions';

// 獲取瑜伽動作列表
export const getYogaActionsList = (req: Request, res: Response) => {
  try {
    // 獲取查詢參數
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const difficulty = req.query.difficulty as string || '';
    const sort = req.query.sort as string || 'id';
    const order = req.query.order as string || 'asc';
    
    // 驗證排序參數
    const validSortFields = ['id', 'name', 'difficulty'];
    const validOrderValues = ['asc', 'desc'];
    
    const safeSort = validSortFields.includes(sort) ? sort : 'id';
    const safeOrder = validOrderValues.includes(order) ? order : 'asc';
    
    // 驗證難度參數
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    const safeDifficulty = validDifficulties.includes(difficulty) ? difficulty : '';
    
    // 獲取篩選後的數據
    const result = getYogaActions(
      page,
      limit,
      search,
      safeDifficulty,
      safeSort,
      safeOrder
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('獲取瑜伽動作時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
};

// 根據ID獲取單個瑜伽動作
export const getYogaActionDetail = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
        
    if (isNaN(id)) {
      return res.status(400).json({ error: '無效的ID參數' });
    }
    
    const yogaAction = getYogaActionById(id);
    
    if (!yogaAction) {
      return res.status(404).json({ error: '找不到指定的瑜伽動作' });
    }
    
    res.status(200).json(yogaAction);
  } catch (error) {
    console.error('獲取瑜伽動作詳情時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
}; 