document.addEventListener('DOMContentLoaded', function() {
    // 獲取URL參數
    const urlParams = new URLSearchParams(window.location.search);
    const yogaId = urlParams.get('id');
    
    // 獲取DOM元素
    const yogaDetail = document.getElementById('yoga-detail');
    const bookmarkButton = document.getElementById('bookmark-btn');
    const bookmarkIcon = document.getElementById('bookmark-icon');
    
    // 全局變量
    let currentYoga = null;
    let isBookmarked = false;

    // 初始化頁面
    initPage();
    
    // 初始化頁面
    async function initPage() {
        if (!yogaId) {
            showError('缺少瑜伽動作ID');
            return;
        }
        
        await loadYogaDetail(yogaId);
        await checkBookmarkStatus();
        
        // 設置收藏按鈕事件
        bookmarkButton.addEventListener('click', toggleBookmark);
    }
    
    // 加載瑜伽動作詳情
    async function loadYogaDetail(id) {
        try {
            // 嘗試從API獲取數據
            let yogaData = null;
            
            try {
                if (API.isOnline() !== false) { // 如果API狀態未知或在線
                    yogaData = await API.yoga.getYogaActionById(id);
                }
            } catch (apiError) {
                console.error('API獲取詳細信息失敗:', apiError);
            }
            
            // 如果API獲取失敗，嘗試使用本地數據
            if (!yogaData && typeof yogaPoses !== 'undefined') {
                yogaData = yogaPoses.find(pose => pose.id.toString() === id.toString());
            }
            
            if (!yogaData) {
                showError('找不到指定的瑜伽動作');
                return;
            }
            
            // 保存當前瑜伽數據
            currentYoga = yogaData;
            
            // 更新頁面標題
            document.title = `${yogaData.name} | ${yogaData.name_en}`;
            
            // 構建詳情HTML
            const detailHTML = `
                <ion-card>
                    <img src="${yogaData.image}" alt="${yogaData.name}" class="full-width-image" />
                    <ion-card-header>
                        <ion-card-title>
                            <span class="zh">${yogaData.name}</span>
                            <span class="en">${yogaData.name_en}</span>
                        </ion-card-title>
                        <ion-card-subtitle>
                            <span class="tag ${yogaData.difficulty}">${getDifficultyText(yogaData.difficulty)}</span>
                        </ion-card-subtitle>
                    </ion-card-header>
                    <ion-card-content>
                        <h2 class="zh">效果</h2>
                        <h2 class="en">Effect</h2>
                        <p class="zh">${yogaData.effect}</p>
                        <p class="en">${yogaData.effect_en}</p>
                        
                        <h2 class="zh">注意事項</h2>
                        <h2 class="en">Caution</h2>
                        <p class="zh">${yogaData.caution}</p>
                        <p class="en">${yogaData.caution_en}</p>
                        
                        <h2 class="zh">示範影片</h2>
                        <h2 class="en">Demonstration Video</h2>
                        <div class="video-container">
                            <iframe 
                                width="100%" 
                                height="315" 
                                src="${getEmbedUrl(yogaData.video)}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </ion-card-content>
                </ion-card>
            `;
            
            // 更新頁面內容
            yogaDetail.innerHTML = detailHTML;
            
        } catch (error) {
            console.error('載入瑜伽動作詳情失敗:', error);
            showError('載入瑜伽動作詳情失敗');
        }
    }
    
    // 顯示錯誤信息
    function showError(message) {
        yogaDetail.innerHTML = `
            <ion-card>
                <ion-card-header>
                    <ion-card-title color="danger">
                        <ion-icon name="alert-circle-outline"></ion-icon>
                        <span class="zh">錯誤</span>
                        <span class="en">Error</span>
                    </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <p>${message}</p>
                    <ion-button href="index.html" expand="block">
                        <span class="zh">返回首頁</span>
                        <span class="en">Back to Home</span>
                    </ion-button>
                </ion-card-content>
            </ion-card>
        `;
    }
    
    // 獲取YouTube嵌入URL
    function getEmbedUrl(url) {
        if (!url) return '';

        // 處理YouTube網址
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            
            if (url.includes('v=')) {
                videoId = url.split('v=')[1];
                const ampersandPosition = videoId.indexOf('&');
                if(ampersandPosition !== -1) {
                    videoId = videoId.substring(0, ampersandPosition);
                }
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        
        return url; // 如果不是YouTube網址，則返回原始網址
    }
    
    // 獲取難度的顯示文字
    function getDifficultyText(difficulty) {
        const difficultyMap = {
            'beginner': {
                zh: '初級',
                en: 'Beginner'
            },
            'intermediate': {
                zh: '中級',
                en: 'Intermediate'
            },
            'advanced': {
                zh: '高級',
                en: 'Advanced'
            }
        };
        
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        return difficultyMap[difficulty] ? 
            (isEnglish ? difficultyMap[difficulty].en : difficultyMap[difficulty].zh) : 
            difficulty;
    }
    
    // 檢查是否已收藏
    async function checkBookmarkStatus() {
        if (!yogaId) return;
        
        try {
            // 檢查用戶是否登入
            const { isLoggedIn } = await API.auth.checkAuth();
            
            if (!isLoggedIn) {
                return; // 未登入，無需檢查收藏狀態
            }
            
            // 從API獲取收藏列表
            const bookmarks = await API.bookmark.getBookmarks();
            
            // 檢查當前動作是否在收藏列表中
            isBookmarked = bookmarks.some(bookmark => bookmark.item_id.toString() === yogaId.toString());
            
            // 更新收藏圖標
            updateBookmarkIcon();
            
        } catch (error) {
            console.error('檢查收藏狀態失敗:', error);
        }
    }
    
    // 更新收藏圖標
    function updateBookmarkIcon() {
        if (isBookmarked) {
            bookmarkIcon.setAttribute('name', 'bookmark');
            bookmarkIcon.style.color = 'var(--ion-color-warning)';
        } else {
            bookmarkIcon.setAttribute('name', 'bookmark-outline');
            bookmarkIcon.style.color = '';
        }
    }
    
    // 切換收藏狀態
    async function toggleBookmark() {
        try {
            // 檢查用戶是否登入
            const { isLoggedIn } = await API.auth.checkAuth();
            
            if (!isLoggedIn) {
                // 顯示提示
                const toast = document.createElement('ion-toast');
                toast.message = '請先登入才能收藏';
                toast.duration = 2000;
                toast.position = 'bottom';
                toast.buttons = [
                    {
                        text: '前往登入',
                        handler: () => {
                            window.location.href = `login.html?redirect=detail.html?id=${yogaId}`;
                        }
                    },
                    {
                        text: '取消',
                        role: 'cancel'
                    }
                ];
                document.body.appendChild(toast);
                toast.present();
                return;
            }
            
            if (isBookmarked) {
                // 移除收藏
                await API.bookmark.removeBookmark(yogaId);
                isBookmarked = false;
            } else {
                // 添加收藏
                await API.bookmark.addBookmark(yogaId);
                isBookmarked = true;
            }
            
            // 更新收藏圖標
            updateBookmarkIcon();
            
            // 顯示提示
            const toast = document.createElement('ion-toast');
            toast.message = isBookmarked ? '已添加到收藏' : '已從收藏中移除';
            toast.duration = 2000;
            toast.position = 'bottom';
            document.body.appendChild(toast);
            toast.present();
            
        } catch (error) {
            console.error('切換收藏狀態失敗:', error);
            
            // 顯示錯誤提示
            const toast = document.createElement('ion-toast');
            toast.message = '操作失敗，請稍後再試';
            toast.duration = 2000;
            toast.position = 'bottom';
            toast.color = 'danger';
            document.body.appendChild(toast);
            toast.present();
        }
    }
}); 