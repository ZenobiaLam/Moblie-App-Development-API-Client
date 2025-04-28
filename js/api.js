// API服務
const API_BASE_URL = 'http://localhost:3001/api';

// 儲存用戶資訊
let currentUser = null;
let authToken = localStorage.getItem('yoga_auth_token');

// 通用請求方法
async function apiRequest(endpoint, options = {}) {
    // 設置默認headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // 如果有token，添加到headers
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // 檢查是否為401未授權錯誤
        if (response.status === 401) {
            // 清除本地存儲的token
            localStorage.removeItem('yoga_auth_token');
            localStorage.removeItem('userId');
            authToken = null;
            currentUser = null;
            
            // 可以選擇重定向到登入頁面
            // window.location.href = 'login.html';
            
            throw new Error('未授權，請重新登入');
        }

        // 解析JSON響應
        const data = await response.json();
        
        // 如果API返回錯誤
        if (!response.ok) {
            throw new Error(data.error || '請求失敗');
        }

        return data;
    } catch (error) {
        console.error('API請求錯誤:', error);
        throw error;
    }
}

// 瑜伽動作API
const yogaAPI = {
    // 獲取瑜伽動作列表
    async getYogaActions(params = {}) {
        const queryParams = new URLSearchParams();
        
        // 添加查詢參數
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return apiRequest(`/yoga-actions${queryString}`, { method: 'GET' });
    },

    // 獲取單個瑜伽動作詳情
    async getYogaActionById(id) {
        return apiRequest(`/yoga-actions/${id}`, { method: 'GET' });
    }
};

// 認證API
const authAPI = {
    // 用戶註冊
    async signup(username, password) {
        const data = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        // 保存token和用戶信息
        if (data.token) {
            authToken = data.token;
            currentUser = data.user_id;
            localStorage.setItem('yoga_auth_token', authToken);
            localStorage.setItem('userId', data.user_id);
        }
        
        return data;
    },

    // 用戶登入
    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        // 保存token和用戶信息
        if (data.token) {
            authToken = data.token;
            currentUser = data.user_id;
            localStorage.setItem('yoga_auth_token', authToken);
            localStorage.setItem('userId', data.user_id);
        }
        
        return data;
    },

    // 檢查用戶登入狀態
    async checkAuth() {
        if (!authToken) return { isLoggedIn: false };
        
        try {
            // 注意：這裡我們不需要在请求體中發送userId，因為伺服器端會從token中提取
            const data = await apiRequest('/auth/check', { method: 'GET' });
            currentUser = data.user_id;
            return { isLoggedIn: true, user: data.user_id };
        } catch (error) {
            // 檢查失敗，清除token
            localStorage.removeItem('yoga_auth_token');
            localStorage.removeItem('userId');
            authToken = null;
            currentUser = null;
            return { isLoggedIn: false };
        }
    },

    // 登出
    logout() {
        localStorage.removeItem('yoga_auth_token');
        localStorage.removeItem('userId');
        authToken = null;
        currentUser = null;
    }
};

// 收藏API
const bookmarkAPI = {
    // 獲取用戶收藏列表
    async getBookmarks() {
        const data = await apiRequest('/bookmarks', { method: 'GET' });
        // 后端返回的是 { item_ids: [...] }，我們需要轉換為與前端匹配的格式
        return data.item_ids ? data.item_ids.map(id => ({ item_id: id })) : [];
    },

    // 添加收藏
    async addBookmark(itemId) {
        return apiRequest(`/bookmarks/${itemId}`, { method: 'POST' });
    },

    // 移除收藏
    async removeBookmark(itemId) {
        return apiRequest(`/bookmarks/${itemId}`, { method: 'DELETE' });
    }
};

// 導出API模塊
const API = {
    yoga: yogaAPI,
    auth: authAPI,
    bookmark: bookmarkAPI
}; 