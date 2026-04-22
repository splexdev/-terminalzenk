import { Schema, model } from 'mongoose';

const planSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() }
});

const plans = model('Plans', planSchema);

export { plans };
