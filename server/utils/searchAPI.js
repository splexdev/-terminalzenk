import axios from "axios";

export async function searchAPI(database, module, subModule, query) {
    try {
        const API_BASE = process.env.API_URL;
        const TOKEN = process.env.API_TOKEN;
        
        let url = "";

        if (database === 'xbuscas') {
            url = `${API_BASE}/api/search/xbuscas/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'tconect') {
            url = `${API_BASE}/api/search/tconect/${module}/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'credilink') {
            url = `${API_BASE}/api/search/credilink/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'serasa') {
            url = `${API_BASE}/api/search/serasa/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'datasus') {
            url = `${API_BASE}/api/search/datasus/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'fotosp') {
            url = `${API_BASE}/api/search/fotosp/cpf?q=${query}&token=${TOKEN}`;
        } else if (database === 'skynet') {
            url = `${API_BASE}/api/search/skynet/${subModule}?q=${query}&token=${TOKEN}`;
        } else if (database === 'black') {
            url = `${API_BASE}/api/search/black/${module}/${subModule}?q=${query}&token=${TOKEN}`;
        } else {
            url = `${API_BASE}/api/search/${database}/${subModule}?q=${query}&token=${TOKEN}`;
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