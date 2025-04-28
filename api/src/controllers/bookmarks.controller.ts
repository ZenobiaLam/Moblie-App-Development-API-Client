import { Request, Response } from 'express';
import { getUserBookmarks, addBookmark, removeBookmark, isBookmarked } from '../models/bookmarks';
import { getYogaActionById } from '../models/yoga-actions';

// 獲取用戶收藏列表
export const getBookmarks = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: '未提供有效的用戶ID' });
    }
    
    const bookmarkedItemIds = getUserBookmarks(userId);
    
    res.status(200).json({ item_ids: bookmarkedItemIds });
  } catch (error) {
    console.error('獲取收藏列表時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
};

// 添加收藏
export const addItemToBookmarks = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const itemId = parseInt(req.params.item_id);
    
    if (!userId) {
      return res.status(401).json({ error: '未提供有效的用戶ID' });
    }
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: '無效的項目ID' });
    }
    
    // 檢查該項目是否存在
    const yogaAction = getYogaActionById(itemId);
    if (!yogaAction) {
      return res.status(404).json({ error: '找不到指定的瑜伽動作' });
    }
    
    // 檢查是否已經收藏
    if (isBookmarked(userId, itemId)) {
      return res.status(200).json({ message: 'already bookmarked' });
    }
    
    // 添加收藏
    const success = addBookmark(userId, itemId);
    
    if (!success) {
      return res.status(400).json({ error: '無法添加收藏' });
    }
    
    res.status(200).json({ message: 'newly bookmarked' });
  } catch (error) {
    console.error('添加收藏時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
};

// 移除收藏
export const removeItemFromBookmarks = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const itemId = parseInt(req.params.item_id);
    
    if (!userId) {
      return res.status(401).json({ error: '未提供有效的用戶ID' });
    }
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: '無效的項目ID' });
    }
    
    // 檢查該項目是否已收藏
    if (!isBookmarked(userId, itemId)) {
      return res.status(200).json({ message: 'not bookmarked' });
    }
    
    // 移除收藏
    const success = removeBookmark(userId, itemId);
    
    if (!success) {
      return res.status(400).json({ error: '無法移除收藏' });
    }
    
    res.status(200).json({ message: 'bookmark removed' });
  } catch (error) {
    console.error('移除收藏時出錯:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
}; 