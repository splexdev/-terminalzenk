import { Schema, model } from 'mongoose';

const keysSchema = new Schema({
    _id: { type: String, required: true },
    plan: { type: String, required: true },
    createdAt: { type: Number, default: Date.now }
});

const keys = model('Keys', keysSchema);

export { keys };