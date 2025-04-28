document.addEventListener('DOMContentLoaded', function() {
    // 獲取URL參數中的瑜伽動作ID
    const urlParams = new URLSearchParams(window.location.search);
    const yogaId = parseInt(urlParams.get('id'));
    
    // 如果沒有ID或ID無效，重定向回首頁
    if (!yogaId) {
        window.location.href = 'index.html';
        return;
    }
    
    // 獲取DOM元素
    const yogaTitle = document.getElementById('yoga-title');
    const yogaName = document.getElementById('yoga-name');
    const yogaNameEn = document.getElementById('yoga-name-en');
    const yogaDifficulty = document.getElementById('yoga-difficulty');
    const yogaEffect = document.getElementById('yoga-effect');
    const yogaEffectEn = document.getElementById('yoga-effect-en');
    const yogaCaution = document.getElementById('yoga-caution');
    const yogaCautionEn = document.getElementById('yoga-caution-en');
    const yogaImage = document.getElementById('yoga-image');
    const yogaVideo = document.getElementById('yoga-video');
    const bookmarkButton = document.getElementById('bookmark-button');
    
    // 當前瑜伽動作資料
    let yogaPose = null;
    
    // 難度對應的中文
    const difficultyMap = {
        'beginner': '初級',
        'intermediate': '中級',
        'advanced': '高級'
    };

    // 效果分類標籤
    const effectTags = {
        'strength': '增強力量',
        'flexibility': '提升柔軟度',
        'balance': '改善平衡',
        'relax': '放鬆減壓'
    };
    
    // 為中文內容元素添加 class="zh"
    yogaName.classList.add('zh');
    yogaEffect.classList.add('zh');
    yogaCaution.classList.add('zh');
    
    // 從API獲取詳細資訊
    loadYogaPoseDetails();
    
    // 設置為全局可訪問的函數，用於語言切換後更新內容
    window.updateYogaPoseDetails = updateYogaPoseDetails;
    
    // 從API載入瑜伽動作詳情
    async function loadYogaPoseDetails() {
        try {
            // 顯示載入中狀態
            document.querySelector('ion-content').innerHTML = `
                <div class="ion-padding ion-text-center">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>加載中...</p>
                </div>
            `;
            
            // 從API獲取瑜伽動作詳情
            yogaPose = await API.yoga.getYogaActionById(yogaId);
            
            // 處理效果標籤
            if (!yogaPose.effectTags) {
                yogaPose.effectTags = [];
                
                // 根據效果描述添加標籤
                const effect = yogaPose.effect || '';
                
                if (effect.includes('強化') || effect.includes('力量')) {
                    yogaPose.effectTags.push('strength');
                }
                
                if (effect.includes('伸展') || effect.includes('靈活性') || effect.includes('柔軟')) {
                    yogaPose.effectTags.push('flexibility');
                }
                
                if (effect.includes('平衡')) {
                    yogaPose.effectTags.push('balance');
                }
                
                if (effect.includes('放鬆') || effect.includes('舒緩') || effect.includes('減壓')) {
                    yogaPose.effectTags.push('relax');
                }
                
                // 如果沒有標籤，添加一個預設標籤
                if (yogaPose.effectTags.length === 0) {
                    yogaPose.effectTags.push('balance');
                }
            }
            
            // 恢復原始內容結構
            document.querySelector('ion-content').innerHTML = `
                <div class="ion-padding">
                    <ion-card>
                        <img id="yoga-image" src="" alt="" />
                        <ion-card-header>
                            <ion-card-title>
                                <span id="yoga-name" class="zh"></span>
                                <span id="yoga-name-en" class="en"></span>
                                <ion-icon name="bookmark-outline" id="bookmark-button"></ion-icon>
                            </ion-card-title>
                            <ion-card-subtitle>
                                <span id="yoga-difficulty"></span>
                            </ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content>
                            <h2 class="zh">效果</h2>
                            <h2 class="en">Effect</h2>
                            <p id="yoga-effect" class="zh"></p>
                            <p id="yoga-effect-en" class="en"></p>
                            
                            <h2 class="zh">注意事項</h2>
                            <h2 class="en">Caution</h2>
                            <p id="yoga-caution" class="zh"></p>
                            <p id="yoga-caution-en" class="en"></p>
                            
                            <h2 class="zh">示範影片</h2>
                            <h2 class="en">Demonstration Video</h2>
                            <iframe id="yoga-video" width="100%" height="315" src="https://www.youtube.com/embed/xxxxxxxx" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </ion-card-content>
                    </ion-card>
                </div>
            `;
            
            // 重新獲取DOM元素
            yogaTitle = document.getElementById('yoga-title');
            yogaName = document.getElementById('yoga-name');
            yogaNameEn = document.getElementById('yoga-name-en');
            yogaDifficulty = document.getElementById('yoga-difficulty');
            yogaEffect = document.getElementById('yoga-effect');
            yogaEffectEn = document.getElementById('yoga-effect-en');
            yogaCaution = document.getElementById('yoga-caution');
            yogaCautionEn = document.getElementById('yoga-caution-en');
            yogaImage = document.getElementById('yoga-image');
            yogaVideo = document.getElementById('yoga-video');
            bookmarkButton = document.getElementById('bookmark-button');
            
            // 更新頁面內容
            updateYogaPoseDetails();
            
            // 檢查收藏狀態
            checkBookmarkStatus();
            
            // 添加收藏按鈕事件
            if (bookmarkButton) {
                bookmarkButton.addEventListener('click', toggleBookmark);
            }
            
            // 添加圖片點擊放大功能
            if (yogaImage) {
                yogaImage.addEventListener('click', function() {
                    const modal = document.createElement('ion-modal');
                    modal.component = yogaImage.cloneNode(true);
                    document.body.appendChild(modal);
                    modal.present();
                });
            }
        } catch (error) {
            console.error('載入瑜伽動作詳情失敗:', error);
            document.querySelector('ion-content').innerHTML = `
                <div class="ion-padding ion-text-center">
                    <ion-icon name="warning-outline" size="large" color="danger"></ion-icon>
                    <p>無法載入瑜伽動作詳情。請檢查API伺服器是否運行或返回首頁。</p>
                    <ion-button onclick="window.location.href='index.html'">返回首頁</ion-button>
                </div>
            `;
            
            // 使用本地數據作為回退
            if (typeof yogaPoses !== 'undefined') {
                console.log('使用本地數據作為回退');
                yogaPose = yogaPoses.find(pose => pose.id === yogaId);
                
                if (yogaPose) {
                    // 恢復原始內容結構並更新
                    document.querySelector('ion-content').innerHTML = `
                        <div class="ion-padding">
                            <ion-card>
                                <img id="yoga-image" src="" alt="" />
                                <ion-card-header>
                                    <ion-card-title>
                                        <span id="yoga-name" class="zh"></span>
                                        <span id="yoga-name-en" class="en"></span>
                                    </ion-card-title>
                                    <ion-card-subtitle>
                                        <span id="yoga-difficulty"></span>
                                    </ion-card-subtitle>
                                </ion-card-header>
                                <ion-card-content>
                                    <h2 class="zh">效果</h2>
                                    <h2 class="en">Effect</h2>
                                    <p id="yoga-effect" class="zh"></p>
                                    <p id="yoga-effect-en" class="en"></p>
                                    
                                    <h2 class="zh">注意事項</h2>
                                    <h2 class="en">Caution</h2>
                                    <p id="yoga-caution" class="zh"></p>
                                    <p id="yoga-caution-en" class="en"></p>
                                    
                                    <h2 class="zh">示範影片</h2>
                                    <h2 class="en">Demonstration Video</h2>
                                    <iframe id="yoga-video" width="100%" height="315" src="https://www.youtube.com/embed/xxxxxxxx" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </ion-card-content>
                            </ion-card>
                        </div>
                    `;
                    
                    // 重新獲取DOM元素
                    yogaTitle = document.getElementById('yoga-title');
                    yogaName = document.getElementById('yoga-name');
                    yogaNameEn = document.getElementById('yoga-name-en');
                    yogaDifficulty = document.getElementById('yoga-difficulty');
                    yogaEffect = document.getElementById('yoga-effect');
                    yogaEffectEn = document.getElementById('yoga-effect-en');
                    yogaCaution = document.getElementById('yoga-caution');
                    yogaCautionEn = document.getElementById('yoga-caution-en');
                    yogaImage = document.getElementById('yoga-image');
                    yogaVideo = document.getElementById('yoga-video');
                    
                    // 更新頁面內容
                    updateYogaPoseDetails();
                    
                    // 添加圖片點擊放大功能
                    if (yogaImage) {
                        yogaImage.addEventListener('click', function() {
                            const modal = document.createElement('ion-modal');
                            modal.component = yogaImage.cloneNode(true);
                            document.body.appendChild(modal);
                            modal.present();
                        });
                    }
                }
            }
        }
    }
    
    // 檢查收藏狀態
    async function checkBookmarkStatus() {
        try {
            const { isLoggedIn } = await API.auth.checkAuth();
            
            if (isLoggedIn) {
                // 獲取收藏列表
                const bookmarks = await API.bookmark.getBookmarks();
                
                // 檢查當前瑜伽動作是否在收藏列表中
                const isBookmarked = bookmarks.some(bookmark => bookmark.item_id === yogaId);
                
                // 更新收藏按鈕狀態
                if (isBookmarked) {
                    bookmarkButton.setAttribute('name', 'bookmark');
                    bookmarkButton.setAttribute('color', 'primary');
                } else {
                    bookmarkButton.setAttribute('name', 'bookmark-outline');
                    bookmarkButton.removeAttribute('color');
                }
            } else {
                // 未登入狀態下隱藏收藏按鈕或顯示登入提示
                bookmarkButton.style.display = 'none';
            }
        } catch (error) {
            console.error('檢查收藏狀態失敗:', error);
            // 隱藏收藏按鈕
            bookmarkButton.style.display = 'none';
        }
    }
    
    // 切換收藏狀態
    async function toggleBookmark() {
        try {
            const { isLoggedIn } = await API.auth.checkAuth();
            
            if (!isLoggedIn) {
                // 未登入，顯示提示
                const alert = document.createElement('ion-alert');
                alert.header = '請先登入';
                alert.message = '您需要先登入才能收藏瑜伽動作';
                alert.buttons = [
                    {
                        text: '取消',
                        role: 'cancel'
                    },
                    {
                        text: '前往登入',
                        handler: () => {
                            window.location.href = 'login.html';
                        }
                    }
                ];
                document.body.appendChild(alert);
                alert.present();
                return;
            }
            
            // 判斷當前收藏狀態
            const isCurrentlyBookmarked = bookmarkButton.getAttribute('name') === 'bookmark';
            
            if (isCurrentlyBookmarked) {
                // 移除收藏
                const result = await API.bookmark.removeBookmark(yogaId);
                
                // 檢查結果
                if (result.message === 'bookmark removed' || result.message === 'not bookmarked') {
                    bookmarkButton.setAttribute('name', 'bookmark-outline');
                    bookmarkButton.removeAttribute('color');
                    
                    // 顯示提示
                    const toast = document.createElement('ion-toast');
                    toast.message = '已從收藏中移除';
                    toast.duration = 2000;
                    document.body.appendChild(toast);
                    toast.present();
                } else {
                    throw new Error('移除收藏失敗');
                }
            } else {
                // 添加收藏
                const result = await API.bookmark.addBookmark(yogaId);
                
                // 檢查結果
                if (result.message === 'newly bookmarked' || result.message === 'already bookmarked') {
                    bookmarkButton.setAttribute('name', 'bookmark');
                    bookmarkButton.setAttribute('color', 'primary');
                    
                    // 顯示提示
                    const toast = document.createElement('ion-toast');
                    toast.message = '已添加到收藏';
                    toast.duration = 2000;
                    document.body.appendChild(toast);
                    toast.present();
                } else {
                    throw new Error('添加收藏失敗');
                }
            }
        } catch (error) {
            console.error('切換收藏狀態失敗:', error);
            
            // 顯示錯誤提示
            const toast = document.createElement('ion-toast');
            toast.message = '操作失敗，請稍後再試';
            toast.duration = 2000;
            toast.color = 'danger';
            document.body.appendChild(toast);
            toast.present();
        }
    }
    
    // 更新瑜伽動作詳細信息的函數
    function updateYogaPoseDetails() {
        if (!yogaPose) return;
        
        // 更新頁面標題
        document.title = `${yogaPose.name} | ${yogaPose.name_en} - 瑜伽動作詳細資訊 | Yoga Pose Details`;
        
        // 填充中文內容
        yogaName.textContent = yogaPose.name;
        yogaEffect.textContent = "";  // 清空原來的內容
        yogaCaution.textContent = yogaPose.caution;
        
        // 填充英文內容
        yogaNameEn.textContent = yogaPose.name_en;
        yogaEffectEn.textContent = "";  // 清空原來的內容
        yogaCautionEn.textContent = yogaPose.caution_en;
        
        // 設置難度
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        yogaDifficulty.textContent = isEnglish ? yogaPose.difficulty : difficultyMap[yogaPose.difficulty];
        yogaDifficulty.className = '';  // 清除所有類別
        yogaDifficulty.classList.add(yogaPose.difficulty);
        
        // 設置圖片和影片
        yogaImage.src = yogaPose.image;
        yogaImage.alt = isEnglish ? yogaPose.name_en : yogaPose.name;
        
        // 設置視頻
        if (yogaPose.video) {
            let videoId;
            try {
                videoId = new URL(yogaPose.video).searchParams.get('v');
            } catch (e) {
                // 如果URL無效，嘗試其他格式
                const match = yogaPose.video.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                videoId = match ? match[1] : null;
            }
            
            if (videoId) {
                yogaVideo.src = `https://www.youtube.com/embed/${videoId}`;
            }
        }
        
        // 添加效果標籤
        const effectTagsHTML_zh = (yogaPose.effectTags || []).map(tag => {
            return `<span class="tag ${tag}">${effectTags[tag]}</span>`;
        }).join(' ');
        
        const effectTagsHTML_en = (yogaPose.effectTags || []).map(tag => {
            return `<span class="tag ${tag}">${tag}</span>`;
        }).join(' ');
        
        yogaEffect.innerHTML = `${yogaPose.effect}<br><div class="tags-container">${effectTagsHTML_zh}</div>`;
        yogaEffectEn.innerHTML = `${yogaPose.effect_en}<br><div class="tags-container">${effectTagsHTML_en}</div>`;
        
        // 確保所有語言元素的顯示/隱藏狀態正確
        document.querySelectorAll('.zh, .en').forEach(el => {
            if (el.classList.contains(isEnglish ? 'en' : 'zh')) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }
}); 