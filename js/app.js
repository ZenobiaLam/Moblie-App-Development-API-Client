document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const searchbar = document.getElementById('searchbar');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const effectFilter = document.getElementById('effect-filter');
    const yogaList = document.getElementById('yoga-list');
    
    // 當前過濾條件
    let currentFilters = {
        search: '',
        difficulty: 'all',
        effect: 'all'
    };

    // 全局儲存瑜伽動作
    let yogaActionsData = [];
    
    // 初始化頁面 - 檢查API狀態並載入數據
    initPage();
    
    // 事件監聽器
    searchbar.addEventListener('ionInput', handleSearch);
    difficultyFilter.addEventListener('ionChange', handleDifficultyFilter);
    effectFilter.addEventListener('ionChange', handleEffectFilter);
    
    // 初始化頁面
    async function initPage() {
        try {
            // 檢查API狀態
            await API.checkStatus();
            // 無論結果如何，都加載瑜伽動作
            loadYogaActions();
        } catch (error) {
            console.error('初始化頁面失敗:', error);
            loadYogaActions(); // 即使API檢查失敗，仍嘗試載入資料
        }
    }
    
    // 從API加載瑜伽動作
    async function loadYogaActions() {
        try {
            // 顯示載入中狀態
            yogaList.innerHTML = `
                <ion-item>
                    <ion-label class="ion-text-center">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>加載中...</p>
                    </ion-label>
                </ion-item>
            `;
            
            // 從API獲取資料
            const params = {};
            
            // 如果有搜索詞，添加到參數
            if (currentFilters.search) {
                params.search = currentFilters.search;
            }
            
            // 如果有難度過濾，添加到參數
            if (currentFilters.difficulty !== 'all') {
                params.difficulty = currentFilters.difficulty;
            }
            
            // 從API獲取瑜伽動作
            try {
                const data = await API.yoga.getYogaActions(params);
                console.log('API返回數據:', data);
                yogaActionsData = data.items || data || [];
                
                // 確保所有資料都有效果標籤
                processYogaData(yogaActionsData);
                
                // 本地過濾效果（假設API不支持按效果過濾）
                applyFilters();
            } catch (apiError) {
                console.error('API請求錯誤:', apiError);
                // API請求失敗，嘗試使用本地數據
                if (typeof yogaPoses !== 'undefined') {
                    console.log('使用本地數據作為回退');
                    yogaActionsData = yogaPoses;
                    processYogaData(yogaActionsData);
                    applyFilters();
                    
                    // 顯示輕微的錯誤提示，但不中斷用戶體驗
                    const toast = document.createElement('ion-toast');
                    toast.message = '無法連接到API伺服器，正在使用本地資料顯示';
                    toast.duration = 3000;
                    toast.position = 'bottom';
                    document.body.appendChild(toast);
                    toast.present();
                } else {
                    throw apiError; // 如果沒有本地數據，重新拋出錯誤
                }
            }
        } catch (error) {
            console.error('載入瑜伽動作完全失敗:', error);
            yogaList.innerHTML = `
                <ion-item>
                    <ion-label class="ion-text-center">
                        <ion-icon name="warning-outline" size="large" color="danger"></ion-icon>
                        <p>無法載入瑜伽動作。請檢查API伺服器是否運行。</p>
                        <ion-button onclick="loadYogaActions()">重試</ion-button>
                    </ion-label>
                </ion-item>
            `;
        }
    }
    
    // 處理瑜伽數據，確保有效果標籤
    function processYogaData(data) {
        // 確保瑜伽動作有效果標籤
        data.forEach(pose => {
            if (!pose.effectTags) {
                pose.effectTags = [];
                
                // 根據效果描述添加標籤
                const effect = pose.effect || '';
                
                if (effect.includes('強化') || effect.includes('力量')) {
                    pose.effectTags.push('strength');
                }
                
                if (effect.includes('伸展') || effect.includes('靈活性') || effect.includes('柔軟')) {
                    pose.effectTags.push('flexibility');
                }
                
                if (effect.includes('平衡')) {
                    pose.effectTags.push('balance');
                }
                
                if (effect.includes('放鬆') || effect.includes('舒緩') || effect.includes('減壓')) {
                    pose.effectTags.push('relax');
                }
                
                // 如果沒有標籤，添加一個預設標籤
                if (pose.effectTags.length === 0) {
                    pose.effectTags.push('balance');
                }
            }
        });
    }
    
    // 搜尋處理函數
    function handleSearch(event) {
        currentFilters.search = event.target.value.toLowerCase();
        loadYogaActions(); // 重新從API載入，使用搜尋參數
    }
    
    // 難度過濾處理函數
    function handleDifficultyFilter(event) {
        currentFilters.difficulty = event.target.value;
        loadYogaActions(); // 重新從API載入，使用難度參數
    }
    
    // 效果過濾處理函數
    function handleEffectFilter(event) {
        currentFilters.effect = event.target.value;
        applyFilters(); // 本地過濾效果標籤
    }
    
    // 應用過濾條件
    function applyFilters() {
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        
        const filteredPoses = yogaActionsData.filter(pose => {
            // 效果過濾 (本地過濾)
            const matchesEffect = currentFilters.effect === 'all' || 
                                 (pose.effectTags && pose.effectTags.includes(currentFilters.effect));
            
            return matchesEffect;
        });
        
        renderYogaList(filteredPoses);
    }
    
    // 將 applyFilters 設為全局可訪問
    window.applyFilters = applyFilters;
    window.loadYogaActions = loadYogaActions;
    
    // 渲染瑜伽動作列表
    function renderYogaList(poses) {
        // 清空當前列表
        yogaList.innerHTML = '';
        
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        
        if (poses.length === 0) {
            yogaList.innerHTML = `
                <ion-item>
                    <ion-label>
                        <h2>${isEnglish ? 'No yoga poses match your criteria' : '沒有符合條件的瑜伽動作'}</h2>
                        <p>${isEnglish ? 'Please try other search criteria' : '請嘗試其他搜尋條件'}</p>
                    </ion-label>
                </ion-item>
            `;
            return;
        }
        
        // 定義難度對應的中文
        const difficultyMap = {
            'beginner': '初級',
            'intermediate': '中級',
            'advanced': '高級'
        };

        // 定義效果分類標籤
        const effectTags = {
            'strength': '增強力量',
            'flexibility': '提升柔軟度',
            'balance': '改善平衡',
            'relax': '放鬆減壓'
        };
        
        // 為每個動作創建列表項
        poses.forEach(pose => {
            const item = document.createElement('ion-item');
            item.setAttribute('button', true);
            item.setAttribute('detail', false);
            item.setAttribute('lines', 'none');
            item.classList.add('animate-fade-in');
            
            // 設置點擊事件
            item.addEventListener('click', () => {
                window.location.href = `detail.html?id=${pose.id}`;
            });
            
            // 創建效果標籤HTML
            const effectTagsHTML = (pose.effectTags || []).map(tag => {
                return `<span class="tag ${tag}">${isEnglish ? tag : effectTags[tag]}</span>`;
            }).join('');
            
            // 設置動作列表項內容
            item.innerHTML = `
                <div class="yoga-item-content">
                    <img src="${pose.image}" alt="${isEnglish ? pose.name_en : pose.name}" class="yoga-thumbnail">
                    <div class="yoga-info">
                        <div class="yoga-name">
                            ${isEnglish ? pose.name_en : pose.name}
                        </div>
                        <div class="yoga-difficulty">
                            <span class="tag ${pose.difficulty}">${isEnglish ? pose.difficulty : difficultyMap[pose.difficulty]}</span>
                            ${effectTagsHTML}
                        </div>
                        <div class="yoga-effect">
                            ${isEnglish ? pose.effect_en : pose.effect}
                        </div>
                    </div>
                </div>
            `;
            
            yogaList.appendChild(item);
        });
    }

    // 檢查用戶登入狀態
    checkUserAuth();

    async function checkUserAuth() {
        try {
            const { isLoggedIn, user } = await API.auth.checkAuth();
            
            if (isLoggedIn) {
                // 添加用戶信息和登出按鈕到頂部工具欄
                const toolbar = document.querySelector('ion-toolbar');
                const userButton = document.createElement('ion-button');
                userButton.setAttribute('slot', 'end');
                userButton.innerHTML = `
                    <ion-icon slot="start" name="person-outline"></ion-icon>
                    ${user || '用戶'}
                `;
                
                // 插入到工具欄的前面位置
                const existingButtons = document.querySelector('ion-buttons[slot="end"]');
                existingButtons.prepend(userButton);
                
                // 添加登出按鈕
                const logoutButton = document.createElement('ion-button');
                logoutButton.setAttribute('slot', 'end');
                logoutButton.innerHTML = `
                    <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
                `;
                logoutButton.addEventListener('click', handleLogout);
                
                existingButtons.prepend(logoutButton);
            } else {
                // 添加登入按鈕
                const toolbar = document.querySelector('ion-toolbar');
                const loginButton = document.createElement('ion-button');
                loginButton.setAttribute('slot', 'end');
                loginButton.innerHTML = `
                    <ion-icon slot="start" name="log-in-outline"></ion-icon>
                    登入
                `;
                loginButton.addEventListener('click', () => {
                    window.location.href = 'login.html';
                });
                
                // 插入到工具欄
                const existingButtons = document.querySelector('ion-buttons[slot="end"]');
                existingButtons.prepend(loginButton);
            }
        } catch (error) {
            console.error('檢查登入狀態失敗:', error);
        }
    }

    // 處理登出
    async function handleLogout() {
        try {
            // 登出
            API.auth.logout();
            // 重新加載頁面
            window.location.reload();
        } catch (error) {
            console.error('登出失敗:', error);
        }
    }
}); 