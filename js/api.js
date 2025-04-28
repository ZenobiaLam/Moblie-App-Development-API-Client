// API服務
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3001/api' 
    : '/api'; // 當部署到生產環境時，API會在相同域名下，所以使用相對路徑

// 儲存用戶資訊
let currentUser = null;
let authToken = localStorage.getItem('yoga_auth_token');

// API狀態追蹤
let apiOnline = null; // null表示未知，true表示在線，false表示離線

// 通用請求方法
async function apiRequest(endpoint, options = {}) {
    // 如果已知API離線，立即拋出錯誤
    if (apiOnline === false && !options.ignoreOffline) {
        throw new Error('API服務離線中');
    }
    
    // 設置默認headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // 如果有token，添加到headers
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`發送API請求到: ${url}`, { method: options.method || 'GET', headers, body: options.body });

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        console.log(`API響應狀態: ${response.status} ${response.statusText}`);

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

        // 嘗試解析JSON響應
        let data;
        try {
            data = await response.json();
            console.log('API響應數據:', data);
        } catch (parseError) {
            console.error('無法解析API響應為JSON:', parseError);
            throw new Error('無法解析API響應');
        }
        
        // 如果到達這一步，API在線
        apiOnline = true;
        
        // 如果API返回錯誤
        if (!response.ok) {
            throw new Error(data.error || '請求失敗');
        }

        return data;
    } catch (error) {
        // 如果是網絡連接錯誤，標記API為離線
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            apiOnline = false;
            console.warn('API服務離線中 - 無法連接到伺服器');
        }
        
        console.error('API請求錯誤:', error);
        throw error;
    }
}

// 檢查API是否在線
async function checkApiStatus() {
    try {
        // 嘗試訪問基礎API端點，忽略離線狀態
        await apiRequest('', { method: 'GET', ignoreOffline: true });
        apiOnline = true;
        return true;
    } catch (error) {
        apiOnline = false;
        return false;
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
        // 重新從localStorage獲取token，以確保是最新的值
        authToken = localStorage.getItem('yoga_auth_token');
        const userId = localStorage.getItem('userId');
        
        console.log('檢查用戶認證狀態:', { authToken: !!authToken, userId });
        
        if (!authToken) {
            console.warn('認證檢查失敗: 沒有找到authToken');
            return { isLoggedIn: false };
        }
        
        try {
            console.log('發送認證檢查請求，使用token:', authToken.substring(0, 10) + '...');
            
            // 注意：這裡我們不需要在请求體中發送userId，因為伺服器端會從token中提取
            const data = await apiRequest('/auth/check', { 
                method: 'GET',
                // 確保請求頭中包含有效的認證令牌
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            console.log('認證檢查成功:', data);
            currentUser = data.user_id;
            return { isLoggedIn: true, user: data.user_id };
        } catch (error) {
            console.error('認證檢查失敗:', error);
            
            // 檢查具體的錯誤類型
            if (error.message && error.message.includes('未授權')) {
                console.warn('令牌無效或已過期');
            } else if (error.message && error.message.includes('Failed to fetch')) {
                console.warn('網絡連接問題，保留登入狀態');
                // 如果是網絡連接問題，我們可以選擇不清除token
                // 讓用戶保持"看似登入"的狀態，直到網絡恢復
                if (userId) {
                    return { isLoggedIn: true, user: userId };
                }
            }
            
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
    bookmark: bookmarkAPI,
    checkStatus: checkApiStatus,
    isOnline: () => apiOnline
}; 