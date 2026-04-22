import express from 'express';
import { auth } from '../middleware/auth.js';
import { searchAPI } from '../utils/searchAPI.js';
import { checkUserHasPlan } from '../utils/checkUserHasPlan.js';
import { users } from '../database/mongodb/users.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';

const router = express.Router();

const cooldowns = new Map();

router.post('/', auth, async (req, res) => {
    try {
        const { database, module, subModule, query, captchaToken } = req.body;
        const userId = req.userId;

        const isHuman = await verifyRecaptcha(captchaToken);
        if (!isHuman) return res.status(403).json({ error: 'Falha no desafio reCAPTCHA. Atualize a página e tente novamente.' });


        const hasPlan = await checkUserHasPlan(userId);
        if (!hasPlan) {
            return res.status(403).json({ error: 'Você precisa de um plano ativo para realizar consultas.' });
        }

        const lastQuery = cooldowns.get(userId) || 0;
        const now = Date.now();
        if (now - lastQuery < 10000) {
            return res.status(429).json({ error: 'Aguarde 10 segundos entre cada consulta.' });
        }
        cooldowns.set(userId, now);

        const result = await searchAPI(database, module, subModule, query);
        
        await users.findByIdAndUpdate(userId, { $inc: { queries: 1 } });

        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;