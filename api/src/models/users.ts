import { User } from '../types';
import bcrypt from 'bcrypt';

// 模擬用戶數據庫
let users: User[] = [
  {
    id: 1,
    username: 'demo',
    password: '$2b$10$x0YHW7bxdkm.gRr2y61pTOsQNzypEmzXs2X6zpJnr9YHZG3FDWKHy' // "password"
  }
];

// 獲取用戶ID計數器
let nextUserId = 2;

// 根據用戶名查找用戶
export const findUserByUsername = (username: string): User | undefined => {
  return users.find(user => user.username === username);
};

// 根據ID查找用戶
export const findUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

// 創建新用戶
export const createUser = async (username: string, password: string): Promise<User> => {
  // 檢查用戶名是否已存在
  if (findUserByUsername(username)) {
    throw new Error('用戶名已存在');
  }
  
  // 密碼加鹽哈希
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword)
  
  // 創建新用戶
  const newUser: User = {
    id: nextUserId++,
    username,
    password: hashedPassword
  };
  
  // 添加到用戶數組
  users.push(newUser);
  
  return newUser;
};

// 驗證用戶密碼
export const validateUserPassword = async (user: User, password: string): Promise<boolean> => {
  return await bcrypt.compare(password, user.password);
}; 