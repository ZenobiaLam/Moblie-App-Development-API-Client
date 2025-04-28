// 收藏相關功能
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否在收藏頁面
    const isBookmarkPage = window.location.pathname.includes('bookmarks.html');

    // 如果不是收藏頁面，直接返回
    if (!isBookmarkPage) return;

    // 獲取DOM元素
    const bookmarksList = document.getElementById('bookmarks-list');

    // 加載收藏列表
    loadBookmarks();

    // 從API加載用戶收藏
    async function loadBookmarks() {
        try {
            // 檢查用戶是否登入
            const { isLoggedIn, user } = await API.auth.checkAuth();
            
            if (!isLoggedIn) {
                // 未登入，顯示提示
                bookmarksList.innerHTML = `
                    <div class="ion-padding ion-text-center">
                        <ion-icon name="lock-closed-outline" size="large" color="medium"></ion-icon>
                        <h2>請先登入</h2>
                        <p>您需要登入才能查看收藏的瑜伽動作</p>
                        <ion-button expand="block" onclick="window.location.href='login.html'">前往登入</ion-button>
                    </div>
                `;
                return;
            }
            
            // 顯示載入中狀態
            bookmarksList.innerHTML = `
                <div class="ion-padding ion-text-center">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>加載中...</p>
                </div>
            `;
            
            // 從API獲取收藏列表
            const bookmarks = await API.bookmark.getBookmarks();
            
            if (!bookmarks || bookmarks.length === 0) {
                // 沒有收藏項目
                bookmarksList.innerHTML = `
                    <div class="ion-padding ion-text-center">
                        <ion-icon name="bookmark-outline" size="large" color="medium"></ion-icon>
                        <h2>暫無收藏</h2>
                        <p>您還沒有收藏任何瑜伽動作</p>
                        <ion-button expand="block" onclick="window.location.href='index.html'">瀏覽瑜伽動作</ion-button>
                    </div>
                `;
                return;
            }
            
            // 清空列表
            bookmarksList.innerHTML = '';
            
            // 獲取每個收藏項目的詳細信息
            for (const bookmark of bookmarks) {
                try {
                    // 獲取瑜伽動作詳情
                    const yogaAction = await API.yoga.getYogaActionById(bookmark.item_id);
                    
                    // 使用瑜伽動作信息渲染項目
                    renderBookmarkItem(yogaAction);
                } catch (error) {
                    console.error(`獲取收藏項目 ${bookmark.item_id} 詳情失敗:`, error);
                }
            }
            
            // 如果API無法獲取瑜伽動作詳情，嘗試從本地數據中獲取
            if (bookmarksList.innerHTML === '' && typeof yogaPoses !== 'undefined') {
                for (const bookmark of bookmarks) {
                    const yogaAction = yogaPoses.find(pose => pose.id === bookmark.item_id);
                    if (yogaAction) {
                        renderBookmarkItem(yogaAction);
                    }
                }
            }
            
            // 再次檢查是否渲染了任何項目
            if (bookmarksList.innerHTML === '') {
                bookmarksList.innerHTML = `
                    <div class="ion-padding ion-text-center">
                        <ion-icon name="warning-outline" size="large" color="danger"></ion-icon>
                        <h2>無法載入收藏</h2>
                        <p>載入收藏項目時出現問題</p>
                        <ion-button expand="block" onclick="window.location.reload()">重新載入</ion-button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('載入收藏失敗:', error);
            bookmarksList.innerHTML = `
                <div class="ion-padding ion-text-center">
                    <ion-icon name="warning-outline" size="large" color="danger"></ion-icon>
                    <h2>載入失敗</h2>
                    <p>獲取收藏列表時出現錯誤</p>
                    <ion-button expand="block" onclick="window.location.reload()">重新載入</ion-button>
                </div>
            `;
        }
    }

    // 渲染收藏項目
    function renderBookmarkItem(yogaAction) {
        const isEnglish = document.documentElement.getAttribute('lang') === 'en';
        
        const item = document.createElement('ion-item');
        item.setAttribute('button', true);
        item.setAttribute('detail', true);
        
        // 設置點擊事件
        item.addEventListener('click', () => {
            window.location.href = `detail.html?id=${yogaAction.id}`;
        });
        
        // 定義難度對應的中文
        const difficultyMap = {
            'beginner': '初級',
            'intermediate': '中級',
            'advanced': '高級'
        };
        
        // 設置項目內容
        item.innerHTML = `
            <ion-thumbnail slot="start">
                <img src="${yogaAction.image}" alt="${isEnglish ? yogaAction.name_en : yogaAction.name}">
            </ion-thumbnail>
            <ion-label>
                <h2>${isEnglish ? yogaAction.name_en : yogaAction.name}</h2>
                <p>${isEnglish ? yogaAction.effect_en : yogaAction.effect}</p>
                <div class="yoga-difficulty">
                    <span class="tag ${yogaAction.difficulty}">
                        ${isEnglish ? yogaAction.difficulty : difficultyMap[yogaAction.difficulty]}
                    </span>
                </div>
            </ion-label>
            <ion-button slot="end" color="danger" fill="clear" class="remove-bookmark-button">
                <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
        `;
        
        // 添加刪除按鈕事件
        const removeButton = item.querySelector('.remove-bookmark-button');
        removeButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // 阻止事件冒泡到item
            await removeBookmark(yogaAction.id, item);
        });
        
        // 添加到列表
        bookmarksList.appendChild(item);
    }

    // 移除收藏
    async function removeBookmark(itemId, element) {
        try {
            // 顯示確認對話框
            const alert = document.createElement('ion-alert');
            alert.header = '確認刪除';
            alert.message = '確定要移除此收藏嗎？';
            alert.buttons = [
                {
                    text: '取消',
                    role: 'cancel'
                },
                {
                    text: '確定',
                    handler: async () => {
                        try {
                            // 呼叫API移除收藏
                            const result = await API.bookmark.removeBookmark(itemId);
                            
                            // 檢查結果
                            if (result.message === 'bookmark removed' || result.message === 'not bookmarked') {
                                // 從DOM中移除元素，使用動畫效果
                                element.style.transition = 'all 0.3s ease';
                                element.style.opacity = '0';
                                element.style.height = '0';
                                
                                setTimeout(() => {
                                    element.remove();
                                    
                                    // 檢查是否還有收藏項目
                                    if (bookmarksList.children.length === 0) {
                                        loadBookmarks(); // 重新載入，顯示空狀態
                                    }
                                }, 300);
                                
                                // 顯示成功提示
                                const toast = document.createElement('ion-toast');
                                toast.message = '已從收藏中移除';
                                toast.duration = 2000;
                                document.body.appendChild(toast);
                                toast.present();
                            } else {
                                throw new Error('移除收藏失敗');
                            }
                        } catch (error) {
                            console.error('移除收藏失敗:', error);
                            
                            // 顯示錯誤提示
                            const toast = document.createElement('ion-toast');
                            toast.message = '移除失敗，請稍後再試';
                            toast.duration = 2000;
                            toast.color = 'danger';
                            document.body.appendChild(toast);
                            toast.present();
                        }
                    }
                }
            ];
            document.body.appendChild(alert);
            alert.present();
        } catch (error) {
            console.error('顯示確認對話框失敗:', error);
        }
    }
}); 