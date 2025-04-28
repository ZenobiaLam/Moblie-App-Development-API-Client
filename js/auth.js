// 用戶認證相關功能
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否在登入/註冊頁面
    const isAuthPage = window.location.pathname.includes('login.html');

    // 如果不是登入頁面，直接返回
    if (!isAuthPage) return;

    // 獲取DOM元素
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');

    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    const signupButton = document.getElementById('signup-button');
    const signupMessage = document.getElementById('signup-message');

    // 檢查當前用戶是否已登入
    checkCurrentUser();

    // 註冊事件監聽器
    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignup);

    // 按下Enter鍵提交表單
    loginPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    signupConfirmPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSignup();
        }
    });

    // 處理登入
    async function handleLogin() {
        // 清空消息區域
        loginMessage.innerHTML = '';
        loginMessage.className = 'message-box';

        // 獲取輸入值
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        // 基本表單驗證
        if (!username || !password) {
            loginMessage.textContent = '請填寫用戶名和密碼';
            loginMessage.className = 'message-box error';
            return;
        }

        try {
            // 顯示載入狀態
            loginButton.disabled = true;
            loginButton.innerHTML = `
                <ion-spinner name="crescent" style="width: 20px; height: 20px;"></ion-spinner>
                <span style="margin-left: 8px;">登入中...</span>
            `;

            // 呼叫登入API
            const data = await API.auth.login(username, password);

            // 登入成功
            loginMessage.textContent = '登入成功！重定向中...';
            loginMessage.className = 'message-box success';

            // 延遲後重定向回首頁
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('登入失敗:', error);
            loginMessage.textContent = error.message || '登入失敗，請檢查用戶名和密碼';
            loginMessage.className = 'message-box error';
            
            // 重置按鈕狀態
            loginButton.disabled = false;
            loginButton.innerHTML = `
                <span class="zh">登入</span>
                <span class="en">Login</span>
            `;
        }
    }

    // 處理註冊
    async function handleSignup() {
        // 清空消息區域
        signupMessage.innerHTML = '';
        signupMessage.className = 'message-box';

        // 獲取輸入值
        const username = signupUsername.value.trim();
        const password = signupPassword.value.trim();
        const confirmPassword = signupConfirmPassword.value.trim();

        // 基本表單驗證
        if (!username || !password || !confirmPassword) {
            signupMessage.textContent = '請填寫所有欄位';
            signupMessage.className = 'message-box error';
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent = '兩次輸入的密碼不匹配';
            signupMessage.className = 'message-box error';
            return;
        }

        if (password.length < 6) {
            signupMessage.textContent = '密碼長度至少為6個字符';
            signupMessage.className = 'message-box error';
            return;
        }

        try {
            // 顯示載入狀態
            signupButton.disabled = true;
            signupButton.innerHTML = `
                <ion-spinner name="crescent" style="width: 20px; height: 20px;"></ion-spinner>
                <span style="margin-left: 8px;">註冊中...</span>
            `;

            // 呼叫註冊API
            const data = await API.auth.signup(username, password);

            // 註冊成功
            signupMessage.textContent = '註冊成功！重定向中...';
            signupMessage.className = 'message-box success';

            // 延遲後重定向回首頁
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('註冊失敗:', error);
            signupMessage.textContent = error.message || '註冊失敗，請嘗試其他用戶名';
            signupMessage.className = 'message-box error';
            
            // 重置按鈕狀態
            signupButton.disabled = false;
            signupButton.innerHTML = `
                <span class="zh">註冊</span>
                <span class="en">Register</span>
            `;
        }
    }

    // 檢查當前用戶是否已登入
    async function checkCurrentUser() {
        try {
            const { isLoggedIn, user } = await API.auth.checkAuth();
            
            if (isLoggedIn) {
                // 如果已登入，顯示已登入信息並提供登出選項
                document.querySelector('ion-content').innerHTML = `
                    <div class="ion-padding ion-text-center">
                        <ion-icon name="person-circle-outline" size="large" color="primary"></ion-icon>
                        <h2>您已經登入</h2>
                        <p>用戶ID: ${user}</p>
                        <ion-button id="logout-button" expand="block" color="medium">登出</ion-button>
                        <ion-button id="back-home-button" expand="block" color="primary">返回首頁</ion-button>
                    </div>
                `;
                
                // 添加登出按鈕事件
                document.getElementById('logout-button').addEventListener('click', async () => {
                    API.auth.logout();
                    window.location.reload();
                });
                
                // 添加返回首頁按鈕事件
                document.getElementById('back-home-button').addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
        } catch (error) {
            console.error('檢查登入狀態失敗:', error);
        }
    }
}); 