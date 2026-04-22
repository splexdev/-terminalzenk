import express from 'express';
import { auth } from '../middleware/auth.js';
import { keys } from '../database/mongodb/keys.js';
import { users } from '../database/mongodb/users.js';
import { plans } from '../database/mongodb/plans.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/redeem', auth, async (req, res) => {
    try {
        const { key } = req.body;
        const userId = req.userId;

        const keyInfo = await keys.findOne({ _id: key });
        if (!keyInfo) {
            return res.status(404).json({ error: 'Key invalida ou ja resgatada.' });
        }

        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ error: 'Usuario nao encontrado.' });

        const planInfo = await plans.findById(keyInfo.plan);
        if (!planInfo) {
            return res.status(400).json({ error: 'Plano da key nao existe mais.' });
        }

        const duration = (planInfo.durationDays || 0) * 24 * 60 * 60 * 1000;
        const currentExpiresAt = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();
        
        await users.findByIdAndUpdate(userId, {
            $set: {
                expiresAt: currentExpiresAt + duration,
                plan: planInfo.name
            }
        });

        await keys.deleteOne({ _id: key });

        res.json({ message: 'Plano resgatado com sucesso!', plan: planInfo.name });
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
        
        const planInfo = await plans.findById(plan);
        if (!planInfo || !planInfo.active) {
            return res.status(400).json({ error: 'Plano invalido ou inativo.' });
        }

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
        
        const keysWithPlanInfo = await Promise.all(activeKeys.map(async (k) => {
            const planInfo = await plans.findById(k.plan);
            return {
                _id: k._id,
                plan: planInfo ? planInfo.name : k.plan,
                createdAt: k.createdAt
            };
        }));
        
        res.json(keysWithPlanInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
