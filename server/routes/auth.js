import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../database/mongodb/users.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password, captchaToken } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const isHuman = await verifyRecaptcha(captchaToken);
        if (!isHuman) return res.status(403).json({ error: 'Falha na verificação de robô (Captcha inválido).' });

        let user = await users.findOne({ username });
        if (user) return res.status(400).json({ error: 'Username already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userCount = await users.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';

        user = new users({
            _id: username + "_" + Math.floor(Math.random() * 10000),
            username,
            password: hashedPassword,
            role: role,
            createdAt: Date.now()
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password, captchaToken } = req.body;

        const isHuman = await verifyRecaptcha(captchaToken);
        if (!isHuman) return res.status(403).json({ error: 'Falha na verificação de robô (Captcha inválido).' });

        const user = await users.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid username or password.' });

        if (!user.password) return res.status(400).json({ error: 'User not registered for web access.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid username or password.' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Not logged in.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await users.findById(decoded.userId).select('-password');
        
        if (user) {
            user = user.toObject();
            if (process.env.ADMIN_USER && user.username === process.env.ADMIN_USER) {
                user.role = 'admin';
            }
        }
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
});

export default router;