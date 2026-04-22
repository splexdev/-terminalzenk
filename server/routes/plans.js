import express from 'express';
import { PLAN_CONFIG } from '../config/plans.js';

const router = express.Router();

router.get('/', (req, res) => {
    const plans = Object.entries(PLAN_CONFIG).map(([id, info]) => ({
        id,
        ...info,
        priceFormatted: `R$ ${info.price.toFixed(2).replace('.', ',')}`
    }));
    res.json(plans);
});

export default router;