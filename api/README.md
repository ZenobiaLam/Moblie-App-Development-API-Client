# 瑜伽應用程式 API 服務

這是一個使用 Express 和 TypeScript 實現的瑜伽應用程式後端 API 服務。

## 功能特點

- 瑜伽動作列表：查詢、分頁、排序、搜尋和篩選功能
- 用戶認證：註冊、登入和認證狀態檢查
- 收藏功能：添加收藏、移除收藏和獲取收藏列表

## 技術棧

- Node.js
- Express.js
- TypeScript
- JWT 認證
- bcrypt 密碼加密

## 安裝與設置

1. 克隆項目

```bash
git clone <repository-url>
cd <project-directory>
```

2. 安裝依賴

```bash
npm install
```

3. 設置環境變數

```bash
# 複製環境變數範例文件
cp .env.example .env
# 編輯 .env 文件設置你的環境變數
```

## 啟動服務

### 開發模式

```bash
npm run dev
```

### 生產模式

```bash
npm run build
npm start
```

## API 文檔

### 基礎 URL

```
http://localhost:3001/api
```

### 瑜伽動作 API

- `GET /yoga-actions`：獲取瑜伽動作列表
  - 可選參數：`page`, `limit`, `search`, `difficulty`, `sort`, `order`
- `GET /yoga-actions/:id`：獲取單個瑜伽動作詳情

### 認證 API

- `POST /auth/signup`：用戶註冊
  - 請求體：`{ "username": "用戶名", "password": "密碼" }`
- `POST /auth/login`：用戶登入
  - 請求體：同上
- `GET /auth/check`：檢查用戶登入狀態
  - 請求頭：`Authorization: Bearer <token>`

### 收藏 API

- `GET /bookmarks`：獲取用戶收藏列表
  - 請求頭：`Authorization: Bearer <token>`
- `POST /bookmarks/:item_id`：添加收藏
  - 請求頭：`Authorization: Bearer <token>`
- `DELETE /bookmarks/:item_id`：移除收藏
  - 請求頭：`Authorization: Bearer <token>`

## 測試

系統已內置一個測試用戶：

- 用戶名：demo
- 密碼：password
