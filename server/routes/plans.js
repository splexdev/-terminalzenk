import express from 'express';
import { plans } from '../database/mongodb/plans.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

const DEFAULT_PLANS = [
    { _id: '1d', name: 'Plano Diario', duration: '1 dia', durationDays: 1, price: 15.00, active: true },
    { _id: '7d', name: 'Plano Semanal', duration: '7 dias', durationDays: 7, price: 25.00, active: true },
    { _id: '31d', name: 'Plano Mensal', duration: '31 dias', durationDays: 31, price: 45.00, active: true }
];

async function ensureDefaultPlans() {
    const count = await plans.countDocuments();
    if (count === 0) {
        await plans.insertMany(DEFAULT_PLANS);
    }
}

router.get('/', async (req, res) => {
    try {
        await ensureDefaultPlans();
        const allPlans = await plans.find({ active: true }).sort({ price: 1 });
        const formatted = allPlans.map(p => ({
            id: p._id,
            name: p.name,
            duration: p.duration,
            durationDays: p.durationDays,
            price: p.price,
            priceFormatted: `R$ ${p.price.toFixed(2).replace('.', ',')}`
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao carregar planos.' });
    }
});

router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        await ensureDefaultPlans();
        const allPlans = await plans.find().sort({ price: 1 });
        res.json(allPlans);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao carregar planos.' });
    }
});

router.post('/admin/create', adminAuth, async (req, res) => {
    try {
        const { id, name, duration, durationDays, price } = req.body;
        
        if (!id || !name || !duration || !durationDays || price === undefined) {
            return res.status(400).json({ error: 'Todos os campos sao obrigatorios.' });
        }
        
        const existing = await plans.findById(id);
        if (existing) {
            return res.status(400).json({ error: 'Ja existe um plano com esse ID.' });
        }
        
        const newPlan = new plans({
            _id: id,
            name,
            duration,
            durationDays: parseInt(durationDays),
            price: parseFloat(price),
            active: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        await newPlan.save();
        res.json({ message: 'Plano criado com sucesso.', plan: newPlan });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar plano.' });
    }
});

router.put('/admin/update/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, durationDays, price, active } = req.body;
        
        const plan = await plans.findById(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plano nao encontrado.' });
        }
        
        if (name) plan.name = name;
        if (duration) plan.duration = duration;
        if (durationDays) plan.durationDays = parseInt(durationDays);
        if (price !== undefined) plan.price = parseFloat(price);
        if (active !== undefined) plan.active = active;
        plan.updatedAt = Date.now();
        
        await plan.save();
        res.json({ message: 'Plano atualizado com sucesso.', plan });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar plano.' });
    }
});

router.delete('/admin/delete/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const plan = await plans.findById(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plano nao encontrado.' });
        }
        
        await plans.findByIdAndDelete(id);
        res.json({ message: 'Plano deletado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar plano.' });
    }
});

export default router;

export { plans as plansCollection };
