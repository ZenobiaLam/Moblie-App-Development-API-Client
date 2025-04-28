import { Bookmark } from '../types';
import { getYogaActionById } from './yoga-actions';

// 模擬收藏數據庫
let bookmarks: Bookmark[] = [
  { userId: 1, itemId: 1 },
  { userId: 1, itemId: 3 }
];

// 獲取用戶的所有收藏
export const getUserBookmarks = (userId: number): number[] => {
  return bookmarks
    .filter(bookmark => bookmark.userId === userId)
    .map(bookmark => bookmark.itemId);
};

// 添加收藏
export const addBookmark = (userId: number, itemId: number): boolean => {
  // 檢查物品是否存在
  const yogaAction = getYogaActionById(itemId);
  if (!yogaAction) {
    return false;
  }
  
  // 檢查是否已收藏
  const existingBookmark = bookmarks.find(
    b => b.userId === userId && b.itemId === itemId
  );
  
  if (existingBookmark) {
    return false;
  }
  
  // 添加收藏
  bookmarks.push({ userId, itemId });
  return true;
};

// 移除收藏
export const removeBookmark = (userId: number, itemId: number): boolean => {
  const initialLength = bookmarks.length;
  
  bookmarks = bookmarks.filter(
    bookmark => !(bookmark.userId === userId && bookmark.itemId === itemId)
  );
  
  // 返回是否成功移除
  return bookmarks.length < initialLength;
};

// 檢查項目是否已被收藏
export const isBookmarked = (userId: number, itemId: number): boolean => {
  return bookmarks.some(bookmark => bookmark.userId === userId && bookmark.itemId === itemId);
}; 