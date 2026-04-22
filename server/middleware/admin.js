import jwt from 'jsonwebtoken';
import { users } from '../database/mongodb/users.js';

export const adminAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token nao fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await users.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Usuario nao encontrado.' });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso restrito a administradores.' });
        }
        
        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (ex) {
        res.status(400).json({ error: 'Token invalido.' });
    }
};
