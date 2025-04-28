import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 導入路由
import yogaRoutes from './routes/yoga-actions.routes';
import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmarks.routes';

// 初始化環境變數
dotenv.config();

// 創建 Express 應用
const app = express();
const port = process.env.PORT || 3001;

// 中間件設置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根路由
app.get('/api', (req, res) => {
  res.json({ 
    message: '瑜伽應用 API 已成功運行', 
    version: '1.0.0',
    endpoints: {
      yogaActions: '/api/yoga-actions',
      auth: '/api/auth',
      bookmarks: '/api/bookmarks'
    }
  });
});

// 路由設置
app.use('/api/yoga-actions', yogaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// 通用錯誤處理中間件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// 處理 404 錯誤
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: '找不到請求的資源' });
});

// 啟動服務器
app.listen(port, () => {
  console.log(`伺服器運行在 http://localhost:${port}`);
  console.log(`API 基礎路徑: http://localhost:${port}/api`);
}); 