import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    role: { type: String, default: 'user' },
    plan: { type: String, required: false, default: null },
    expiresAt: { type: Number, required: false, default: null },
    name: { type: String, required: false, default: null },
    document: { type: String, required: false, default: null },
    queries: { type: Number, required: false, default: 0 },
    createdAt: { type: Number, required: false, default: Date.now() },
    disabled: { type: Boolean, required: false, default: false },
});

const users = model('Users', userSchema);

export { users };