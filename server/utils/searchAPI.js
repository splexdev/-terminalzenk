import axios from "axios";

const ALLOWED_DATABASES = ['xbuscas', 'tconect', 'credilink', 'serasa', 'datasus', 'fotosp', 'skynet', 'black'];
const ALLOWED_MODULES = /^[a-zA-Z0-9_-]+$/;

function sanitizeParam(param) {
    if (typeof param !== 'string') return '';
    return param.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
}

export async function searchAPI(database, module, subModule, query) {
    try {
        const API_BASE = process.env.API_URL;
        const TOKEN = process.env.API_TOKEN;
        
        const safeDatabase = sanitizeParam(database);
        const safeModule = sanitizeParam(module);
        const safeSubModule = sanitizeParam(subModule);
        const safeQuery = encodeURIComponent(String(query || '').slice(0, 200));
        
        if (!ALLOWED_DATABASES.includes(safeDatabase) && safeDatabase !== '') {
            throw new Error("Database nao permitido.");
        }
        
        if (safeModule && !ALLOWED_MODULES.test(safeModule)) {
            throw new Error("Modulo invalido.");
        }
        
        if (safeSubModule && !ALLOWED_MODULES.test(safeSubModule)) {
            throw new Error("SubModulo invalido.");
        }
        
        let url = "";

        if (safeDatabase === 'xbuscas') {
            url = `${API_BASE}/api/search/xbuscas/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'tconect') {
            url = `${API_BASE}/api/search/tconect/${safeModule}/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'credilink') {
            url = `${API_BASE}/api/search/credilink/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'serasa') {
            url = `${API_BASE}/api/search/serasa/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'datasus') {
            url = `${API_BASE}/api/search/datasus/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'fotosp') {
            url = `${API_BASE}/api/search/fotosp/cpf?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'skynet') {
            url = `${API_BASE}/api/search/skynet/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else if (safeDatabase === 'black') {
            url = `${API_BASE}/api/search/black/${safeModule}/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        } else {
            url = `${API_BASE}/api/search/${safeDatabase}/${safeSubModule}?q=${safeQuery}&token=${TOKEN}`;
        }

        console.log(`[PROXY] Requesting: ${url.split('token=')[0]}token=HIDDEN`);

        const response = await axios.get(url, { timeout: 50000 });
        
        if (response.data && response.data.result) {
            return response.data.result;
        }

        throw new Error("Nenhum registro encontrado.");
    } catch (e) {
        console.error(`[API ERROR] ${e.response?.status} - ${e.message}`);
        throw new Error(e.response?.data?.message || "❌ Erro na consulta externa.");
    }
}
