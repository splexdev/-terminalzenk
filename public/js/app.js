document.addEventListener('DOMContentLoaded', () => {
    const modalClose = document.querySelector('.modal-close');
    const modalContainer = document.getElementById('modal-container');
    if (modalClose && modalContainer) {
        modalClose.addEventListener('click', () => {
            modalContainer.classList.add('hidden');
        });
    }
});

window.openPlanModal = async () => {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Escolha seu Plano';
    modalBody.innerHTML = '<div class="query-loader"><div class="spinner"></div><p>Carregando planos...</p></div>';
    modalContainer.classList.remove('hidden');

    try {
        const res = await fetch('/api/plans');
        const plans = await res.json();
        
        modalBody.innerHTML = `
            <div class="plan-list">
                ${plans.map(p => `
                    <div class="plan-item" data-plan="${p.id}">
                        <div class="plan-info">
                            <h4>${p.name}</h4>
                            <p>${p.duration} de acesso total</p>
                        </div>
                        <div class="plan-price">${p.priceFormatted}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.plan-item').forEach(item => {
            item.onclick = async () => {
                const plan = item.dataset.plan;
                modalTitle.textContent = 'Pagamento Pix';
                modalBody.innerHTML = '<div class="query-loader"><div class="spinner"></div><p>Gerando QR Code...</p></div>';
                
                try {
                    const res = await fetch('/api/pix/create', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ plan })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        modalBody.innerHTML = `
                            <div class="pix-container" style="text-align: center;">
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Escaneie o QR Code abaixo:</p>
                                <div class="pix-qr">
                                    <img src="${data.qrcode}" alt="Pix QR Code">
                                </div>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Ou use o Pix Copia e Cola:</p>
                                <div class="copy-box" onclick="navigator.clipboard.writeText('${data.copy_paste}'); showToast('Copiado!', 'success')">
                                    ${data.copy_paste}
                                </div>
                                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--accent); font-size: 0.85rem;">
                                    <div class="spinner" style="width: 16px; height: 16px; border-width: 2px; border-top-color: var(--accent);"></div> 
                                    <span>A liberação é feita automaticamente.</span>
                                    <span style="opacity: 0.8; font-size: 0.75rem;">Aguarde até 5 minutos para a ativação do plano.</span>
                                </div>
                            </div>
                        `;
                        window.startPaymentMonitor();
                    } else { showToast(data.error, 'error'); }
                } catch (err) { showToast('Erro ao gerar pagamento', 'error'); }
            };
        });
    } catch (err) {
        showToast('Erro ao carregar planos', 'error');
        modalContainer.classList.add('hidden');
    }
};

window.openRedeemModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Resgatar Key';
    modalBody.innerHTML = `
        <div class="input-field">
            <label>Token de Acesso</label>
            <input type="text" id="redeem-key-input" placeholder="Cole sua Key aqui (ex: ELITE-...)">
        </div>
        <button id="confirm-redeem" class="btn-premium btn-glow" style="margin-top: 0.5rem;"><i class="fas fa-check"></i> Autenticar Token</button>
    `;
    modalContainer.classList.remove('hidden');

    document.getElementById('confirm-redeem').onclick = async () => {
        const key = document.getElementById('redeem-key-input').value.trim();
        if (!key) return;

        try {
            const res = await fetch('/api/keys/redeem', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ key })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message, 'success');
                modalContainer.classList.add('hidden');
                location.reload();
            } else {
                showToast(data.error, 'error');
            }
        } catch (err) { showToast('Erro ao resgatar key', 'error'); }
    };
};

window.openUpdatesModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Novidades do Sistema';
    modalBody.innerHTML = `
        <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid var(--accent);">
                <h4 style="color: var(--accent); margin-bottom: 0.5rem;"><i class="fas fa-cog"></i> ATUALIZAÇÃO DE SISTEMA: v4.0</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Informamos a todos os utilizadores que a nossa infraestrutura foi expandida. O terminal agora conta com novos módulos de busca para entregar o resultado mais completo do mercado.</p>
                
                <h5 style="color: white; margin-bottom: 0.5rem;">📸 NOVIDADE: MÓDULO DE FOTOS ESTADUAIS</h5>
                <ul style="font-size: 0.85rem; padding-left: 1rem; margin-bottom: 1rem; color: #ddd;">
                    <li>Identificação Visual: Retorno de fotos oficiais para os estados de SP, RJ, PR e GO.</li>
                </ul>

                <h5 style="color: white; margin-bottom: 0.5rem;">🚗 NOVIDADE: MÓDULO CNH E VEICULAR</h5>
                <ul style="font-size: 0.85rem; padding-left: 1rem; margin-bottom: 1rem; color: #ddd;">
                    <li>Dados de Habilitação: Consulta detalhada de Registro CNH e Código de Segurança.</li>
                    <li>Rastreio Automotivo: Buscas específicas e diretas por Chassi, Motor e Renavam.</li>
                </ul>

                <h5 style="color: white; margin-bottom: 0.5rem;">🔍 NOVIDADE: MÓDULO CPF VOID E CONTATOS</h5>
                <ul style="font-size: 0.85rem; padding-left: 1rem; margin-bottom: 1rem; color: #ddd;">
                    <li>Varredura Profunda: Consulta CPF Void para extração de dados e vínculos em segundo plano.</li>
                    <li>Contatos Diretos: Busca independente e atualizada de Telefones e E-mails.</li>
                </ul>

                <h5 style="color: white; margin-bottom: 0.5rem;">📄 NOVIDADE: MÓDULO DOCUMENTAL E EMPRESARIAL</h5>
                <ul style="font-size: 0.85rem; padding-left: 1rem; margin-bottom: 1rem; color: #ddd;">
                    <li>Identificação Civil: Consultas rápidas e precisas por RG e Título de Eleitor.</li>
                    <li>Dados Jurídicos: Levantamento estrutural completo via CNPJ.</li>
                </ul>
                <p style="font-size: 0.85rem; color: var(--accent); font-weight: bold; margin-top: 1rem;">A nossa tecnologia 2026 entrega o que os outros apenas prometem.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-cog"></i> ATUALIZAÇÃO DE SISTEMA: v3.0</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">A nossa infraestrutura foi expandida. O terminal agora conta com a integração de dados mais profunda do mercado brasileiro.</p>
                <h5 style="color: #ccc; margin-bottom: 0.5rem;">🔍 NOVIDADE: MÓDULO CPF (FULL)</h5>
                <ul style="font-size: 0.85rem; padding-left: 1rem; color: #aaa;">
                    <li>Dados Biométricos: Cor de pele, olhos, altura e peso.</li>
                    <li>Histórico de Saúde: Registro completo de vacinas e CNS.</li>
                    <li>Teia de Relacionamento: Parentesco detalhado com CPF e nomes.</li>
                    <li>Poder Aquisitivo: Renda estimada, Serasa Mosaic e histórico de empréstimos.</li>
                </ul>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 10px;">
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-cog"></i> ATUALIZAÇÃO DE SISTEMA: v2.4</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Servidores atualizados com novas integrações de dados.</p>
                <ul style="font-size: 0.85rem; padding-left: 1rem; color: #aaa;">
                    <li>Integração da base Placa Full.</li>
                    <li>Tempo de resposta otimizado para a máxima velocidade.</li>
                    <li>Relatórios em .txt com histórico de ocorrências.</li>
                </ul>
            </div>
        </div>
    `;
    modalContainer.classList.remove('hidden');
};

window.startPaymentMonitor = () => {
    const originalExpiry = window.currentUser?.expiresAt || 0;
    const interval = setInterval(async () => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const user = await res.json();
                if (user.expiresAt > Date.now() && user.expiresAt !== originalExpiry) {
                    clearInterval(interval);
                    showToast('Pagamento confirmado! Acesso liberado.', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            }
        } catch (e) {}
    }, 3000);
    
    const observer = new MutationObserver(() => {
        if (document.getElementById('modal-container').classList.contains('hidden')) {
            clearInterval(interval);
            observer.disconnect();
        }
    });
    observer.observe(document.getElementById('modal-container'), { attributes: true });
};

function initApp() {
    const navItems = document.querySelectorAll('.nav-item');
    const searchBtn = document.getElementById('search-btn');
    const searchQuery = document.getElementById('search-query');
    const searchLoader = document.getElementById('search-loader');
    const resultsContainer = document.getElementById('results-container');
    const logoutBtn = document.getElementById('logout-btn');

    const moduleTitle = document.getElementById('current-module-title');
    const moduleDesc = document.getElementById('current-module-desc');
    const sourceSelector = document.getElementById('source-selector-container');
    const dashWelcome = document.getElementById('dashboard-welcome');
    const profileContainer = document.getElementById('profile-container');

    const modalContainer = document.getElementById('modal-container');

    const mobileMenuOpen = document.getElementById('mobile-menu-toggle-open');
    const mobileMenuClose = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebar && sidebarOverlay) {
        if (mobileMenuOpen) {
            mobileMenuOpen.addEventListener('click', () => {
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('active');
            });
        }
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            });
        }
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    const config = {
        "cpf": [
            { "label": "credilink", "value": "cpf", "database": "credilink", "requirePlan": false },
            { "label": "serasa", "value": "cpf", "database": "serasa", "requirePlan": false },
            { "label": "cpf sus", "value": "cpf", "database": "datasus", "requirePlan": false },
            { "label": "cpf foto", "value": "cpf", "database": "tconect", "requirePlan": true },
            { "label": "cnh basico", "value": "cpf-basico", "database": "xbuscas", "requirePlan": true },
            { "label": "receita", "value": "cpf3", "database": "skynet", "requirePlan": true },
            { "label": "cnh", "value": "cnh", "database": "black", "requirePlan": true },
            { "label": "cnh pro", "value": "cnh-cpf", "database": "xbuscas", "requirePlan": true },
            { "label": "cpf pro", "value": "cpf-void", "database": "xbuscas", "requirePlan": true },
            { "label": "cpf full", "value": "cpf-1", "database": "xbuscas", "requirePlan": true },
            { "label": "completo", "value": "completo", "database": "black", "requirePlan": true }
        ],
        "nome": [
            { "label": "nome credilink", "value": "nome", "database": "credilink", "requirePlan": false },
            { "label": "nome serasa", "value": "nome", "database": "serasa", "requirePlan": false },
            { "label": "nome 1", "value": "nome", "database": "black", "requirePlan": false },
            { "label": "nome 2", "value": "nome", "database": "skynet", "requirePlan": true },
            { "label": "serasa (pai)", "value": "pai", "database": "serasa", "requirePlan": true },
            { "label": "serasa (mãe)", "value": "mae", "database": "serasa", "requirePlan": true },
            { "label": "pai (sus)", "value": "pai", "database": "datasus", "requirePlan": true },
            { "label": "mãe (sus)", "value": "mae", "database": "datasus", "requirePlan": true }
        ],
        "telefone": [
            { "label": "credilink", "value": "telefone", "database": "credilink", "requirePlan": false },
            { "label": "serasa", "value": "telefone", "database": "serasa", "requirePlan": false },
            { "label": "telecom", "value": "telefone", "database": "black", "requirePlan": false },
            { "label": "pro", "value": "telefone", "database": "xbuscas", "requirePlan": true },
            { "label": "receita", "value": "telefone", "database": "skynet", "requirePlan": true }
        ],
        "rg": [
            { "label": "sus", "value": "rg", "database": "datasus", "requirePlan": false },
            { "label": "rg", "value": "rg", "database": "xbuscas", "requirePlan": true },
            { "label": "serasa", "value": "rg", "database": "serasa", "requirePlan": true }
        ],
        "cns": [
            { "label": "sus", "value": "cns", "database": "datasus", "requirePlan": false }
        ],
        "placa": [
            { "label": "nacional", "value": "placa", "database": "skynet", "requirePlan": true },
            { "label": "cortex", "value": "max", "database": "black", "requirePlan": true },
            { "label": "placa full", "value": "placa", "database": "xbuscas", "requirePlan": true }
        ],
        "cnh": [
            { "label": "nacional", "value": "cnh", "database": "black", "requirePlan": true },
            { "label": "cnh registro", "value": "cnh-registro", "database": "xbuscas", "requirePlan": true },
            { "label": "cnh pro", "value": "cnh-codigo-de-seguranca", "database": "xbuscas", "requirePlan": true }
        ],
        "chassi": [
            { "label": "nacional", "value": "prf", "database": "black", "requirePlan": true },
            { "label": "chassi x", "value": "chassi", "database": "xbuscas", "requirePlan": true }
        ],
        "motor": [
            { "label": "motor", "value": "motor", "database": "xbuscas", "requirePlan": true }
        ],
        "renavam": [
            { "label": "renavam", "value": "renavam", "database": "xbuscas", "requirePlan": true }
        ],
        "cep": [
            { "label": "credilink", "value": "cep", "database": "credilink", "requirePlan": false },
            { "label": "serasa", "value": "cep", "database": "serasa", "requirePlan": false },
            { "label": "moradores", "value": "cep", "database": "black", "requirePlan": true }
        ],
        "foto": [
            { "label": "FOTO SP", "value": "cpf", "database": "fotosp", "requirePlan": true },
            { "label": "FOTO RJ", "value": "foto-rj-rio-de-janeiro", "database": "xbuscas", "requirePlan": true },
            { "label": "FOTO GO", "value": "foto-go-goias", "database": "xbuscas", "requirePlan": true },
            { "label": "FOTO PR", "value": "foto-pr-parana", "database": "xbuscas", "requirePlan": true }
        ],
        "titulo": [
            { "label": "serasa", "value": "titulo", "database": "serasa", "requirePlan": false },
            { "label": "TÍTULO DE ELEITOR", "value": "titulo", "database": "black", "requirePlan": true },
            { "label": "TÍTULO | PRO", "value": "titulo", "database": "black", "requirePlan": true },
            { "label": "TÍTULO X", "value": "titulo", "database": "xbuscas", "requirePlan": true }
        ],
        "cnpj": [
            { "label": "nacional", "value": "completa", "database": "black", "requirePlan": true },
            { "label": "receita", "value": "cnpj", "database": "skynet", "requirePlan": true },
            { "label": "cnpj x", "value": "cnpj", "database": "xbuscas", "requirePlan": true }
        ],
        "email": [
            { "label": "credilink", "value": "email", "database": "credilink", "requirePlan": false },
            { "label": "email", "value": "email", "database": "black", "requirePlan": true },
            { "label": "email pro", "value": "email", "database": "xbuscas", "requirePlan": true },
            { "label": "receita", "value": "email", "database": "skynet", "requirePlan": true }
        ]
    };

    let currentModule = {
        name: 'cpf',
        db: 'credilink',
        sub: 'cpf'
    };

    document.getElementById('nav-profile').onclick = (e) => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        document.getElementById('nav-profile').classList.add('active');
        dashWelcome.classList.add('hidden');
        sourceSelector.classList.add('hidden');
        document.querySelector('.search-bar-wrapper').classList.add('hidden');
        document.querySelectorAll('.result-card').forEach(c => c.remove());
        profileContainer.classList.remove('hidden');

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }

        updateProfileUI();
    };

    document.getElementById('nav-updates').onclick = (e) => {
        e.preventDefault();

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }

        if (window.openUpdatesModal) window.openUpdatesModal();
    };

    function updateProfileUI() {
        const user = window.currentUser;
        if (!user) return;

        const expires = user.expiresAt || 0;
        const now = Date.now();
        const diff = expires - now;

        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

        document.getElementById('timer-countdown').textContent = `${days}d ${hours}h`;
        document.getElementById('plan-start-date').textContent = new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR');
        document.getElementById('plan-end-date').textContent = user.expiresAt ? new Date(user.expiresAt).toLocaleDateString('pt-BR') : 'Sem plano';
        document.getElementById('stat-queries').textContent = user.queries || 0;
        document.getElementById('stat-role').textContent = user.role.toUpperCase();

        const statusText = document.getElementById('plan-status-text');
        if (diff > 0) {
            statusText.textContent = 'ATIVO';
            statusText.className = 'text-success';
        } else {
            statusText.textContent = 'EXPIRADO';
            statusText.style.color = 'var(--error)';
        }
    }

    document.getElementById('master-module-select').addEventListener('change', (e) => {
        currentModule.name = e.target.value;
        const firstSource = config[currentModule.name][0];
        currentModule.db = firstSource.database;
        currentModule.sub = firstSource.value;

        
        navItems.forEach(i => i.classList.remove('active'));
        profileContainer.classList.add('hidden');
        dashWelcome.classList.add('hidden');
        sourceSelector.classList.remove('hidden');
        document.querySelector('.search-bar-wrapper').classList.remove('hidden');

        updateSearchUI();
    });

    const btnBackSearch = document.getElementById('btn-back-to-search');
    if (btnBackSearch) {
        btnBackSearch.onclick = () => {
            navItems.forEach(i => i.classList.remove('active'));
            profileContainer.classList.add('hidden');
            dashWelcome.classList.add('hidden');
            sourceSelector.classList.remove('hidden');
            document.querySelector('.search-bar-wrapper').classList.remove('hidden');
        };
    }

    function updateSearchUI() {
        moduleTitle.textContent = `PAINEL CENTRAL DE BUSCAS`;
        moduleDesc.textContent = `MÓDULO: ${currentModule.name.toUpperCase()} | BASE: ${currentModule.db.toUpperCase()} (${currentModule.sub})`;
        searchQuery.placeholder = `Insira o dado de ${currentModule.name.toUpperCase()} aqui...`;
        searchQuery.value = '';
        document.querySelectorAll('.result-card').forEach(c => c.remove());
        renderSourceSelector();
    }

    function renderSourceSelector() {
        const sources = config[currentModule.name] || [];
        
        sourceSelector.className = 'source-select-wrapper'; 
        
        sourceSelector.innerHTML = `
            <i class="fas fa-layer-group select-icon"></i>
            <select id="source-dropdown" class="premium-select" style="font-weight: 500;">
                ${sources.map(src => {
                    return `
                    <option value="${src.database}|${src.value}|${src.label}" 
                        ${src.database === currentModule.db && src.value === currentModule.sub ? 'selected' : ''}>
                        FONTE: ${src.label.toUpperCase()}
                    </option>
                    `;
                }).join('')}
            </select>
            <i class="fas fa-chevron-down select-arrow"></i>
        `;

        document.getElementById('source-dropdown').addEventListener('change', (e) => {
            const [db, sub, label] = e.target.value.split('|');
            currentModule.db = db;
            currentModule.sub = sub;
            moduleDesc.textContent = `BASE DE DADOS: ${db.toUpperCase()} (${label})`;
        });
    }

    document.getElementById('btn-desktop-redeem')?.addEventListener('click', window.openRedeemModal);
    document.getElementById('btn-desktop-plans')?.addEventListener('click', window.openPlanModal);

    
    const bBtns = document.querySelectorAll('.bottom-nav button');
    const clearBNav = () => bBtns.forEach(b => b.classList.remove('active'));

    document.getElementById('bnav-search')?.addEventListener('click', (e) => {
        clearBNav(); e.currentTarget.classList.add('active');
        if(btnBackSearch) btnBackSearch.onclick(); 
    });
    document.getElementById('bnav-profile')?.addEventListener('click', (e) => {
        clearBNav(); e.currentTarget.classList.add('active');
        document.getElementById('nav-profile').onclick(e);
    });
    document.getElementById('bnav-redeem')?.addEventListener('click', (e) => {
        clearBNav(); e.currentTarget.classList.add('active');
        window.openRedeemModal();
    });
    document.getElementById('bnav-plans')?.addEventListener('click', (e) => {
        clearBNav(); e.currentTarget.classList.add('active');
        window.openPlanModal();
    });
    const doLogout = () => {
        localStorage.removeItem('token');
        location.reload();
    };

    document.getElementById('bnav-logout')?.addEventListener('click', doLogout);
    document.getElementById('logout-btn')?.addEventListener('click', doLogout);

    const salesBtnPlans = document.getElementById('sales-btn-plans');
    const salesBtnRedeem = document.getElementById('sales-btn-redeem');
    
    if (salesBtnPlans) salesBtnPlans.onclick = window.openPlanModal;
    if (salesBtnRedeem) salesBtnRedeem.onclick = window.openRedeemModal;

    const navAdminKeys = document.getElementById('nav-admin-keys');
    if (navAdminKeys) {
        navAdminKeys.onclick = (e) => {
            e.preventDefault();
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            
            modalTitle.textContent = 'Gerenciar Keys';
            modalBody.innerHTML = `
                <div class="admin-actions">
                    <select id="gen-plan-select" style="width: 100%; padding: 0.8rem; background: var(--bg-surface); color: white; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1.5rem; font-family: 'Inter', sans-serif;">
                        <option value="1d">Diário (1 dia)</option>
                        <option value="7d">Semanal (7 dias)</option>
                        <option value="31d">Mensal (31 dias)</option>
                    </select>
                    <button id="btn-generate-key" class="btn-premium"><i class="fas fa-plus"></i> Gerar Nova Key</button>
                </div>
                <div id="admin-keys-list" class="admin-key-list" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; max-height: 300px; overflow-y: auto;">
                    <div class="query-loader"><div class="spinner"></div></div>
                </div>
            `;
            modalContainer.classList.remove('hidden');
            loadAdminKeys();

            document.getElementById('btn-generate-key').onclick = async () => {
                const plan = document.getElementById('gen-plan-select').value;
                try {
                    const res = await fetch('/api/keys/generate', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ plan })
                    });
                    if (res.ok) {
                        showToast('Key gerada!', 'success');
                        loadAdminKeys();
                    }
                } catch (err) { showToast('Erro ao gerar key', 'error'); }
            };
        };
    }

    async function loadAdminKeys() {
        const list = document.getElementById('admin-keys-list');
        try {
            const res = await fetch('/api/keys/list', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const keys = await res.json();
            if (res.ok) {
                list.innerHTML = keys.length ? keys.map(k => `
                    <div class="key-item" style="background: var(--bg-panel); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: white;">${k._id}</span>
                        <span class="plan-tag">${k.plan.toUpperCase()}</span>
                        <i class="fas fa-copy" style="cursor: pointer; color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='var(--text-secondary)'" onclick="navigator.clipboard.writeText('${k._id}'); showToast('Copiada!', 'success')"></i>
                    </div>
                `).join('') : '<p style="text-align: center; color: var(--text-secondary)">Nenhuma key ativa.</p>';
            } else {
                list.innerHTML = `<p style="text-align: center; color: #ef4444;">Erro: Servidor recusou a listagem de chaves.</p>`;
            }
        } catch (err) { list.innerHTML = '<p style="text-align: center; color: #ef4444;">Erro de conexão com servidor.</p>'; }
    }

    searchBtn.addEventListener('click', performSearch);
    searchQuery.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    async function performSearch() {
        const query = searchQuery.value.trim();
        if (!query) return showToast('Por favor, informe o dado para buscar.', 'error');

        if (!validateQuery(currentModule.name, query)) {
            return showToast('Formato inválido para este módulo.', 'error');
        }

        const captchaToken = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse(searchWidget) : '';
        if (!captchaToken) {
            return showToast('Por favor, resolva o Captcha antes de buscar.', 'error');
        }

        searchLoader.classList.remove('hidden');
        document.querySelectorAll('.result-card').forEach(c => c.remove());
        dashWelcome.classList.add('hidden');

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    database: currentModule.db,
                    module: currentModule.name,
                    subModule: currentModule.sub,
                    query: query,
                    captchaToken: captchaToken
                })
            });

            const data = await res.json();
            searchLoader.classList.add('hidden');
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset(searchWidget);

            if (res.ok) {
                renderResults(data.result);
            } else {
                const errorCard = document.createElement('div');
                errorCard.className = 'result-card glass-panel welcome-card';
                errorCard.innerHTML = `
                    <i class="fas fa-circle-exclamation" style="color: var(--error); opacity: 0.8"></i>
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem;">Busca Independente</h4>
                        <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary)">${data.error || 'Nenhum resultado encontrado'}</p>
                    </div>
                `;
                resultsContainer.appendChild(errorCard);
            }
        } catch (err) {
            searchLoader.classList.add('hidden');
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset(searchWidget);
            showToast('Erro de conexão com servidor.', 'error');
        }
    }

    function validateQuery(module, query) {
        const numOnly = /^\d+$/;
        const alphaNum = /^[a-zA-Z0-9]+$/;
        switch (module) {
            case 'cpf': return numOnly.test(query) && query.length === 11;
            case 'cnh': return numOnly.test(query) && query.length === 11;
            case 'cnpj': return numOnly.test(query) && query.length === 14;
            case 'cep': return numOnly.test(query) && query.length === 8;
            case 'chassi': return alphaNum.test(query) && query.length === 17;
            case 'placa': return alphaNum.test(query) && query.length === 7;
            case 'rg': return numOnly.test(query) && (query.length === 8 || query.length === 9);
            case 'telefone': return numOnly.test(query) && query.length === 11;
            case 'cns': return numOnly.test(query) && query.length === 15;
            case 'titulo': return numOnly.test(query) && query.length === 12;
            case 'foto': return numOnly.test(query) && query.length === 11;
            default: return true;
        }
    }

    function renderResults(result) {
        if (!result) {
            resultsContainer.innerHTML = '<p>Resposta vazia do servidor.</p>';
            return;
        }

        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
            result = result.data;
        }

        const card = document.createElement('div');
        card.className = 'result-card glass-panel';

        const isFotoModule = currentModule.name === 'foto' || currentModule.sub.includes('foto');
        const isBase64Image = typeof result === 'string' && (result.startsWith('/9j/') || (result.length > 1000 && !result.includes(' ')));

        if (isFotoModule || isBase64Image) {
            card.innerHTML = `
                <div class="data-label">REGISTRO VISUAL</div>
                <img src="data:image/jpeg;base64,${result}" class="result-image" alt="Evidence" style="max-width: 100%; border-radius: 10px; border: 1px solid var(--accent)">
            `;
        } 
        else if (typeof result === 'string') {
            const base64Match = result.match(/(?:[*_`\s]*(?:FOTO|FOTOS|IMAGEM)[*_`\s]*:?\s*)?(\/9j\/[a-zA-Z0-9+/=\r\n]+|iVBORw0KGgo[a-zA-Z0-9+/=\r\n]+)/i);
            
            if (base64Match) {
                const fullMatch = base64Match[0];
                const base64Data = base64Match[1].replace(/[\r\n\s]/g, '');
                let cleanText = result.replace(fullMatch, '').replace(/[*_`]/g, '');
                cleanText = cleanText.replace(/CREDILINK|XBUSCAS|SKYNET|BLACK|SERASA|TCP|CADSUS/ig, 'SISTEMA INTEGRADO');
                
                card.innerHTML = `
                    <pre class="result-raw" style="color: var(--text-primary); font-family: 'JetBrains Mono', monospace; white-space: pre-wrap;">${cleanText}</pre>
                    <div style="margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                        <span class="data-label" style="font-size: 0.8rem; color: var(--accent);">REGISTRO FOTOGRÁFICO</span>
                        <img src="data:image/jpeg;base64,${base64Data}" class="result-image" alt="Evidence" style="max-width: 100%; border-radius: 10px; border: 1px solid var(--accent); margin-top: 0.5rem; display: block;">
                    </div>
                `;
            } else {
                let cleanText = result.replace(/[*_`]/g, '');
                cleanText = cleanText.replace(/CREDILINK|XBUSCAS|SKYNET|BLACK|SERASA|TCP|CADSUS/ig, 'SISTEMA INTEGRADO');
                card.innerHTML = `<pre class="result-raw" style="color: var(--text-primary); font-family: 'JetBrains Mono', monospace; white-space: pre-wrap;">${cleanText}</pre>`;
            }
        }
        else {
            let html = '<div class="result-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem;">';
            
            function flattenObject(obj, prefix = '') {
                let items = '';
                for (const [key, value] of Object.entries(obj)) {
                    if (value === null || value === undefined || value === '') continue;
                    
                    const label = prefix ? `${prefix} > ${key}` : key;
                    
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        items += flattenObject(value, label);
                    } else if (Array.isArray(value)) {
                        if (value.length > 0) {
                            let strValue = '';
                            if (typeof value[0] === 'object') {
                                strValue = value.map(item => JSON.stringify(item)).join(' | ');
                            } else {
                                strValue = value.join(', ');
                            }
                            items += `
                                <div class="data-item">
                                    <span class="data-label" style="font-size: 0.7rem; opacity: 0.7">${label.toUpperCase()}</span>
                                    <b class="data-value" style="display: block; font-family: 'JetBrains Mono'">${strValue}</b>
                                </div>
                            `;
                        }
                    } else {
                        if (typeof value === 'string' && (value.startsWith('/9j/') || value.startsWith('iVBORw0KGgo')) && value.length > 200) {
                            items += `
                                <div class="data-item" style="grid-column: 1 / -1;">
                                    <span class="data-label" style="font-size: 0.7rem; opacity: 0.7">${label.toUpperCase()}</span>
                                    <img src="data:image/jpeg;base64,${value}" class="result-image" alt="Evidence" style="width: auto; max-width: 100%; border-radius: 10px; border: 1px solid var(--accent); margin-top: 0.5rem; display: block; max-height: 400px;">
                                </div>
                            `;
                        } else {
                            items += `
                                <div class="data-item">
                                    <span class="data-label" style="font-size: 0.7rem; opacity: 0.7">${label.toUpperCase()}</span>
                                    <b class="data-value" style="display: block; font-family: 'JetBrains Mono'">${value}</b>
                                </div>
                            `;
                        }
                    }
                }
                return items;
            }
            
            html += flattenObject(result);
            html += '</div>';
            card.innerHTML = html;
        }
        
        if (!isFotoModule && !isBase64Image) {
            const btnWrapper = document.createElement('div');
            btnWrapper.style.display = 'flex';
            btnWrapper.style.justifyContent = 'flex-end';
            btnWrapper.style.marginBottom = '1rem';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-outline';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            copyBtn.style.padding = '0.4rem 1rem';
            copyBtn.style.fontSize = '0.8rem';
            copyBtn.style.background = 'var(--card-bg)';
            
            btnWrapper.appendChild(copyBtn);
            
            copyBtn.onclick = () => {
                let copyText = '';
                if (typeof result === 'string') {
                    copyText = result.replace(/[*_`]/g, '');
                } else {
                    function formatForCopy(obj, prefix = '') {
                        let str = '';
                        for (const [key, value] of Object.entries(obj)) {
                            if (value === null || value === undefined || value === '') continue;
                            const label = prefix ? `${prefix} > ${key}` : key;
                            if (typeof value === 'object' && !Array.isArray(value)) {
                                str += formatForCopy(value, label);
                            } else if (Array.isArray(value)) {
                                if (value.length > 0) {
                                    let strValue = typeof value[0] === 'object' 
                                        ? value.map(item => JSON.stringify(item)).join(' | ') 
                                        : value.join(', ');
                                    str += `*${label.toUpperCase()}:* ${strValue}\n`;
                                }
                            } else {
                                str += `*${label.toUpperCase()}:* ${value}\n`;
                            }
                        }
                        return str;
                    }
                    copyText = formatForCopy(result);
                }
                
                navigator.clipboard.writeText(copyText).then(() => {
                    if (typeof showToast === 'function') {
                        showToast('Copiado para a área de transferência!', 'success');
                    } else {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar', 2000);
                    }
                }).catch(err => {
                    console.error('Falha ao copiar', err);
                });
            };
            card.insertBefore(btnWrapper, card.firstChild);
        }

        resultsContainer.appendChild(card);
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        location.reload();
    });

    updateSearchUI();
}