document.addEventListener('DOMContentLoaded', function () {
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

    // 分頁參數
    let pagination = {
        page: 1,
        limit: 10,
        hasMore: true
    };

    // 確保images目錄存在並下載測試圖片
    ensureImagesDirectory();

    // 初始化頁面 - 從API獲取數據
    loadYogaActions();

    // 事件監聽器
    searchbar.addEventListener('ionInput', handleSearch);
    difficultyFilter.addEventListener('ionChange', handleDifficultyFilter);
    effectFilter.addEventListener('ionChange', handleEffectFilter);

    // 確保images目錄存在並下載測試圖片
    function ensureImagesDirectory() {
        // 創建一個測試圖片
        const testImage = new Image();
        testImage.onload = function () {
            console.log('測試圖片加載成功');
        };
        testImage.onerror = function () {
            console.log('測試圖片加載失敗，可能是images目錄不存在');
        };

        // 嘗試加載測試圖片
        testImage.src = 'images/placeholder.txt?' + new Date().getTime();
    }

    // 從API加載瑜伽動作
    async function loadYogaActions(isLoadMore = false) {
        try {
            // 重置分頁信息（如果不是加載更多）
            if (!isLoadMore) {
                pagination.page = 1;
                pagination.hasMore = true;
                yogaActionsData = [];

                // 顯示載入中動畫
                yogaList.innerHTML = `
                    <div class="ion-padding ion-text-center">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>載入瑜伽動作中...</p>
                    </div>
                `;
            } else {
                // 如果是加載更多，顯示載入更多的動畫
                const loadMoreButton = document.getElementById('load-more-button');
                if (loadMoreButton) {
                    loadMoreButton.innerHTML = `
                        <ion-spinner name="crescent" size="small"></ion-spinner>
                        載入中...
                    `;
                    loadMoreButton.disabled = true;
                }
            }

            // 構建請求參數
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };

            // 如果有搜索詞，添加到參數
            if (currentFilters.search) {
                params.search = currentFilters.search;
            }

            // 如果有難度過濾，添加到參數
            if (currentFilters.difficulty !== 'all') {
                params.difficulty = currentFilters.difficulty;
            }

            // 從API獲取瑜伽動作
            console.log('請求參數:', params);
            const data = await API.yoga.getYogaActions(params);
            console.log('API返回瑜伽數據:', data);

            // 檢查API返回的數據結構
            let newPoses = [];
            if (Array.isArray(data)) {
                newPoses = data;
            } else if (data.items && Array.isArray(data.items)) {
                newPoses = data.items;
            } else if (data.data && Array.isArray(data.data)) {
                newPoses = data.data;
            } else if (data.poses && Array.isArray(data.poses)) {
                newPoses = data.poses;
            } else if (data.yogaPoses && Array.isArray(data.yogaPoses)) {
                newPoses = data.yogaPoses;
            } else if (data.results && Array.isArray(data.results)) {
                newPoses = data.results;
            } else {
                // 嘗試找出數據中的陣列
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        console.log(`找到可能的瑜伽動作陣列在 'data.${key}'`);
                        newPoses = data[key];
                        break;
                    }
                }

                // 如果仍然未找到陣列，設為空陣列
                if (!newPoses || newPoses.length === 0) {
                    newPoses = [];
                    console.error('未能識別API返回的數據結構:', data);
                }
            }

            // 檢查是否還有更多數據可加載
            pagination.hasMore = newPoses.length >= pagination.limit;

            // 如果加載更多，將新數據添加到現有數據中
            if (isLoadMore) {
                yogaActionsData = [...yogaActionsData, ...newPoses];
            } else {
                yogaActionsData = newPoses;
            }

            // 為下一次加載更多準備
            pagination.page += 1;

            console.log('處理後的瑜伽數據:', yogaActionsData);

            // 檢查第一個項目的結構
            if (yogaActionsData.length > 0) {
                console.log('第一個瑜伽動作項目結構:', yogaActionsData[0]);

                // 檢查並修正可能缺少的屬性
                yogaActionsData = yogaActionsData.map(pose => {
                    // 確保所有必要的屬性都存在
                    const processedPose = { ...pose };

                    // 處理可能的命名差異
                    if (!processedPose.name && processedPose.name_zh) processedPose.name = processedPose.name_zh;
                    if (!processedPose.name && processedPose.title) processedPose.name = processedPose.title;
                    if (!processedPose.name && processedPose.title_zh) processedPose.name = processedPose.title_zh;

                    if (!processedPose.name_en && processedPose.english_name) processedPose.name_en = processedPose.english_name;
                    if (!processedPose.name_en && processedPose.title_en) processedPose.name_en = processedPose.title_en;

                    if (!processedPose.effect && processedPose.description) processedPose.effect = processedPose.description;
                    if (!processedPose.effect && processedPose.description_zh) processedPose.effect = processedPose.description_zh;

                    if (!processedPose.effect_en && processedPose.english_description) processedPose.effect_en = processedPose.english_description;
                    if (!processedPose.effect_en && processedPose.description_en) processedPose.effect_en = processedPose.description_en;

                    if (!processedPose.image && processedPose.imageUrl) processedPose.image = processedPose.imageUrl;
                    if (!processedPose.image && processedPose.img) processedPose.image = processedPose.img;
                    if (!processedPose.image && processedPose.picture) processedPose.image = processedPose.picture;

                    if (!processedPose.difficulty && processedPose.level) processedPose.difficulty = processedPose.level;

                    // 確保ID是數字
                    if (typeof processedPose.id === 'string') {
                        processedPose.id = parseInt(processedPose.id);
                    }

                    // 提供默認值
                    if (!processedPose.name) processedPose.name = '未命名瑜伽動作';
                    if (!processedPose.name_en) processedPose.name_en = 'Unnamed Yoga Pose';
                    if (!processedPose.effect) processedPose.effect = '暫無描述';
                    if (!processedPose.effect_en) processedPose.effect_en = 'No description available';
                    if (!processedPose.difficulty) processedPose.difficulty = 'beginner';
                    if (!processedPose.image_url) processedPose.image_url = 'https://via.placeholder.com/150?text=No+Image';

                    return processedPose;
                });

                console.log('處理後的第一個瑜伽動作項目:', yogaActionsData[0]);
            }

            // 確保所有資料都有效果標籤
            processYogaData(yogaActionsData);

            // 本地過濾效果（假設API不支持按效果過濾）
            applyFilters();
        } catch (error) {
            console.error('載入瑜伽動作失敗:', error);

            // 如果有錯誤發生，使用本地數據
            if (typeof yogaPoses !== 'undefined' && Array.isArray(yogaPoses)) {
                console.log('錯誤發生，使用本地數據作為備份');

                // 如果是加載更多，只使用尚未加載的部分
                if (isLoadMore) {
                    const startIndex = yogaActionsData.length;
                    const newPoses = yogaPoses.slice(startIndex, startIndex + pagination.limit);

                    if (newPoses.length > 0) {
                        yogaActionsData = [...yogaActionsData, ...newPoses];
                        pagination.hasMore = yogaActionsData.length < yogaPoses.length;
                        pagination.page += 1;
                    } else {
                        pagination.hasMore = false;
                    }
                } else {
                    yogaActionsData = yogaPoses.slice(0, pagination.limit);
                    pagination.hasMore = yogaActionsData.length < yogaPoses.length;
                    pagination.page = 2;
                }

                // 確保所有瑜伽動作有效果標籤
                processYogaData(yogaActionsData);

                // 應用過濾和渲染
                applyFilters();

                // 顯示提示訊息
                const toast = document.createElement('ion-toast');
                toast.message = '當前使用離線數據，部分功能可能受限';
                toast.duration = 3000;
                toast.position = 'bottom';
                toast.color = 'warning';
                document.body.appendChild(toast);
                toast.present();
            } else {
                // 如果沒有本地數據可用，顯示錯誤訊息
                if (!isLoadMore) {
                    yogaList.innerHTML = `
                        <ion-item>
                            <ion-label class="ion-text-center">
                                <ion-icon name="warning-outline" size="large" color="danger"></ion-icon>
                                <p>無法載入瑜伽動作。請檢查API伺服器是否運行或網絡連接。</p>
                                <p>錯誤詳情: ${error.message}</p>
                                <ion-button onclick="window.loadYogaActions()">重試</ion-button>
                            </ion-label>
                        </ion-item>
                    `;
                } else {
                    // 顯示加載更多失敗的提示
                    const loadMoreButton = document.getElementById('load-more-button');
                    if (loadMoreButton) {
                        loadMoreButton.innerHTML = '載入更多';
                        loadMoreButton.disabled = false;
                    }

                    const toast = document.createElement('ion-toast');
                    toast.message = '載入更多數據失敗，請稍後再試';
                    toast.duration = 3000;
                    toast.position = 'bottom';
                    toast.color = 'danger';
                    document.body.appendChild(toast);
                    toast.present();
                }
            }
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

    // 渲染瑜伽動作列表
    function renderYogaList(poses) {
        // 清空當前列表
        yogaList.innerHTML = '';

        const isEnglish = document.documentElement.getAttribute('lang') === 'en';

        if (poses.length === 0) {
            yogaList.innerHTML = `
                <ion-item>
                    <ion-label class="ion-text-center">
                        <p>${isEnglish ? 'No yoga poses found matching your criteria.' : '找不到符合條件的瑜伽動作。'}</p>
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
            // 確保圖片URL是有效的
            let imageUrl = pose.image || pose.imageUrl || pose.img || pose.picture || pose.image_url;
            console.log('pose:', pose)

            const item = document.createElement('ion-item');
            item.setAttribute('button', true);
            item.setAttribute('detail', false);
            item.setAttribute('lines', 'none');
            item.classList.add('animate-fade-in');

            // 設置點擊事件
            item.addEventListener('click', () => {
                window.location.href = `detail.html?id=${pose.id}&title=${pose.title}`;
            });

            // 創建效果標籤HTML
            const effectTagsHTML = (pose.effectTags || []).map(tag => {
                return `<span class="tag ${tag}">${isEnglish ? tag : (effectTags[tag] || tag)}</span>`;
            }).join('');

            // 獲取難度顯示
            const difficulty = pose.difficulty || pose.level || 'beginner';
            const difficultyDisplay = isEnglish ? difficulty : (difficultyMap[difficulty] || difficulty);

            // 設置動作列表項內容
            item.innerHTML = `
                <div class="yoga-item-content">
                    <div class="yoga-icon-container" style="width:80px; height:80px; overflow:hidden; border-radius:8px; position:relative;">
                        <img src="${imageUrl}" alt="${pose.name}" class="yoga-list-image" 
                             style="width:100%; height:100%; object-fit:cover;" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div style="display:none; width:100%; height:100%; background-color:#f5f5f5; position:absolute; top:0; left:0; flex-direction:column; justify-content:center; align-items:center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 4h-1a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h1"></path>
                                <path d="M6 4h1a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6"></path>
                                <path d="M12 9v6"></path>
                                <path d="M9 12h6"></path>
                            </svg>
                            <div style="font-size:10px; margin-top:5px; color:#777;">${difficultyDisplay}</div>
                        </div>
                    </div>
                    <div class="yoga-info">
                        <div class="yoga-name">
                            ${isEnglish ? pose.name_en : pose.name}
                        </div>
                        <div class="yoga-difficulty">
                            <span class="tag ${difficulty}">${difficultyDisplay}</span>
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

        // 添加載入更多按鈕(如果還有更多數據)
        if (pagination.hasMore) {
            const loadMoreItem = document.createElement('ion-item');
            loadMoreItem.classList.add('ion-text-center');
            loadMoreItem.lines = 'none';

            const loadMoreButton = document.createElement('ion-button');
            loadMoreButton.id = 'load-more-button';
            loadMoreButton.expand = 'block';
            loadMoreButton.fill = 'outline';
            loadMoreButton.innerHTML = isEnglish ? 'Load More' : '載入更多';

            loadMoreButton.addEventListener('click', () => {
                loadYogaActions(true); // 傳入true表示這是加載更多
            });

            loadMoreItem.appendChild(loadMoreButton);
            yogaList.appendChild(loadMoreItem);
        }
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

    // 將 loadYogaActions 設為全局可訪問（帶有默認參數）
    window.loadYogaActions = function () {
        loadYogaActions(false);
    };
}); 