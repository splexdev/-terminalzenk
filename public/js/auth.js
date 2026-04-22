document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    const authBtnUpdates = document.getElementById('auth-btn-updates');
    if (authBtnUpdates) {
        authBtnUpdates.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.openUpdatesModal) window.openUpdatesModal();
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const captchaToken = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse(loginWidget) : '';

        if (!captchaToken) {
            return showToast('Por favor, resolva o Captcha antes de logar.', 'error');
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, captchaToken })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                showToast('Login realizado com sucesso!', 'success');
                checkAuth();
            } else {
                showToast(data.error || 'Erro ao fazer login', 'error');
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset(loginWidget);
            }
        } catch (err) {
            showToast('Erro de conexão com o servidor', 'error');
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset(loginWidget);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const captchaToken = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse(registerWidget) : '';

        if (!captchaToken) {
            return showToast('Por favor, resolva o Captcha antes de registrar.', 'error');
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, captchaToken })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                showToast('Conta criada com sucesso!', 'success');
                checkAuth();
            } else {
                showToast(data.error || 'Erro ao criar conta', 'error');
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset(registerWidget);
            }
        } catch (err) {
            showToast('Erro de conexão com o servidor', 'error');
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset(registerWidget);
        }
    });

    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            authContainer.classList.remove('hidden');
            appContainer.classList.add('hidden');
            document.getElementById('sales-container').classList.add('hidden');
            return;
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const user = await res.json();
                window.currentUser = user;
                authContainer.classList.add('hidden');
                
                const now = Date.now();
                const hasPlan = user.expiresAt && user.expiresAt > now;

                if (hasPlan || user.role === 'admin') {
                    if (user.role === 'admin') {
                        const adminMenu = document.getElementById('admin-menu');
                        if(adminMenu) adminMenu.classList.remove('hidden');
                    }
                    appContainer.classList.remove('hidden');
                    document.getElementById('sales-container').classList.add('hidden');
                    updateUserProfile(user);
                    initApp();
                } else {
                    appContainer.classList.add('hidden');
                    document.getElementById('sales-container').classList.remove('hidden');
                    initSalesPage();
                }
            } else {
                localStorage.removeItem('token');
                authContainer.classList.remove('hidden');
                appContainer.classList.add('hidden');
                document.getElementById('sales-container').classList.add('hidden');
            }
        } catch (err) {
            console.error('Auth check failed', err);
        }
    }

    function initSalesPage() {
        document.getElementById('sales-btn-plans').onclick = () => {
            if (window.openPlanModal) window.openPlanModal();
        };
        document.getElementById('sales-btn-redeem').onclick = () => {
            if (window.openRedeemModal) window.openRedeemModal();
        };
        document.getElementById('sales-btn-updates').onclick = () => {
            if (window.openUpdatesModal) window.openUpdatesModal();
        };
        document.getElementById('sales-logout').onclick = () => {
            localStorage.removeItem('token');
            location.reload();
        };
    }

    window.showToast = (message, type = '') => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    };

    function updateUserProfile(user) {
        document.getElementById('user-name').textContent = user.username;
        const planBadge = document.getElementById('user-plan');
        planBadge.textContent = `Plano: ${user.plan || 'NENHUM'}`;
        
        const now = Date.now();
        if (user.expiresAt && user.expiresAt > now) {
            planBadge.style.background = 'var(--success)';
        } else {
            planBadge.style.background = 'var(--error)';
            planBadge.textContent += ' (Expirado)';
        }
    }

    checkAuth();
});