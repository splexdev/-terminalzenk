import express from 'express';
import { auth } from '../middleware/auth.js';
import { keys } from '../database/mongodb/keys.js';
import { users } from '../database/mongodb/users.js';
import crypto from 'crypto';

const router = express.Router();

const planDurations = {
    '1d': 1 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '31d': 31 * 24 * 60 * 60 * 1000
};

const planNames = {
    '1d': 'DIÁRIO',
    '7d': 'SEMANAL',
    '31d': 'MENSAL'
};

router.post('/redeem', auth, async (req, res) => {
    try {
        const { key } = req.body;
        const userId = req.userId;

        const keyInfo = await keys.findOne({ _id: key });
        if (!keyInfo) {
            return res.status(404).json({ error: 'Key inválida ou já resgatada.' });
        }

        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const duration = planDurations[keyInfo.plan] || 0;
        const currentExpiresAt = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();
        
        await users.findByIdAndUpdate(userId, {
            $set: {
                expiresAt: currentExpiresAt + duration,
                plan: planNames[keyInfo.plan]
            }
        });

        await keys.deleteOne({ _id: key });

        res.json({ message: 'Plano resgatado com sucesso!', plan: planNames[keyInfo.plan] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/generate', auth, async (req, res) => {
    try {
        const admin = await users.findById(req.userId);
        const isAdmin = admin.role === 'admin' || (process.env.ADMIN_USER && admin.username === process.env.ADMIN_USER);
        
        if (!isAdmin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        const { plan } = req.body;
        if (!planDurations[plan]) return res.status(400).json({ error: 'Plano inválido.' });

        const key = "ELITE-" + crypto.randomBytes(8).toString('hex').toUpperCase();
        
        const newKey = new keys({
            _id: key,
            plan: plan
        });

        await newKey.save();
        res.status(201).json({ key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/list', auth, async (req, res) => {
    try {
        const admin = await users.findById(req.userId);
        const isAdmin = admin.role === 'admin' || (process.env.ADMIN_USER && admin.username === process.env.ADMIN_USER);
        if (!isAdmin) return res.status(403).json({ error: 'Acesso negado.' });

        const activeKeys = await keys.find().sort({ createdAt: -1 });
        res.json(activeKeys);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;