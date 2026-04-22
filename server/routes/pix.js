import express from 'express';
import { auth } from '../middleware/auth.js';
import { users } from '../database/mongodb/users.js';
import axios from 'axios';
import QRCode from 'qrcode';
import { PLAN_CONFIG } from '../config/plans.js';
import { io } from "socket.io-client";

const router = express.Router();

const PIXGO_API = "https://pixgo.org/api/v1";
const EXTERNAL_API_URL = "https://juliabuscas.shardweb.app";
function getDiscordWebhook() {
    const url = (process.env.WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || "").trim();
    if (!url) return null;
    if (!url.startsWith("https://discord.com/api/webhooks/") && !url.startsWith("https://discordapp.com/api/webhooks/")) {
        console.warn("⚠️ DISCORD_WEBHOOK inválido - deve começar com https://discord.com/api/webhooks/");
        return null;
    }
    return url;
}

const DISCORD_WEBHOOK = getDiscordWebhook();

const planDurations = {
    '1d': 1 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '31d': 31 * 24 * 60 * 60 * 1000
};

router.post('/create', auth, async (req, res) => {
    try {
        const { plan } = req.body;
        const planInfo = PLAN_CONFIG[plan];
        const userId = req.userId;
        const PIXGO_TOKEN = process.env.PIXGO_API_KEY;
        const APP_URL = process.env.APP_URL || "https://terminalzenk.net";
        
        if (!planInfo) return res.status(400).json({ error: 'Plano inválido.' });

        console.log(`Gerando PIX: R$ ${planInfo.price} para o plano ${plan}`);

        const response = await axios.post(`${PIXGO_API}/payment/create`, {
            amount: planInfo.price,
            description: `Terminal Zenk - Plano ${planInfo.name}`,
            webhook_url: `${APP_URL}/api/pix/webhook?secret=${process.env.WEBHOOK_SECRET || 'ZenkAdmin777'}`,
            external_id: `${userId}|${Date.now()}`
        }, {
            headers: { 
                "Content-Type": "application/json",
                "X-API-Key": PIXGO_TOKEN 
            }
        });

        const { success, data } = response.data;

        if (success) {
            const qrBase64 = await QRCode.toDataURL(data.qr_code, { errorCorrectionLevel: 'H' });

            const socket = io(EXTERNAL_API_URL);

            socket.on("connect", () => {
                socket.emit("watch_payment", data.payment_id);
                console.log(`📡 Ouvindo pagamento via Socket: ${data.payment_id}`);
            });

            socket.on("payment_update", async (updateData) => {
                const status = updateData.status || updateData.event;
                if (status?.toLowerCase() === "completed" || status?.toLowerCase() === "pago" || status?.toLowerCase() === "payment.completed") {
                    socket.disconnect();
                    
                    const user = await users.findById(userId);
                    if (user) {
                        const duration = planDurations[plan] || 0;
                        const currentExpiresAt = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();
                        const planName = planInfo.name;

                        await users.findByIdAndUpdate(userId, {
                            $set: {
                                expiresAt: currentExpiresAt + duration,
                                plan: planName
                            }
                        });

                        const embed = {
                            color: 0x57F287,
                            title: "VENDA APROVADA!",
                            description: `- **🛒 PLANO:** \`${planName}\`\n- **💸 VALOR:** \`R$ ${planInfo.price.toFixed(2).replace('.', ',')}\`\n- **👤 USUÁRIO:** \`${user.username}\`\n- **🔑 ID:** \`${user._id}\``,
                            timestamp: new Date().toISOString()
                        };

                        if (DISCORD_WEBHOOK) {
                            await axios.post(DISCORD_WEBHOOK, { embeds: [embed] }).catch((err) => {
                                console.error("❌ Erro ao enviar log Discord (Socket):", err.message);
                            });
                        }
                        console.log(`✅ Pagamento Confirmado via Socket para: ${user.username}`);
                    }
                }
            });

            setTimeout(() => { if(socket.connected) socket.disconnect(); }, 600000);

            res.json({
                qrcode: qrBase64,
                copy_paste: data.qr_code,
                payment_id: data.payment_id
            });
        } else {
            console.error('PixGo Success False:', response.data);
            res.status(500).json({ error: 'Gateway recusou a criação do PIX.' });
        }
    } catch (err) {
        console.error('Pix Create Error:', err.response?.data || err.message);
        const errMsg = err.response?.data?.message || 'Erro de conexão com gateway.';
        res.status(err.response?.status || 500).json({ error: errMsg });
    }
});
router.post('/webhook', async (req, res) => {
    try {
        const { secret } = req.query;
        if (secret !== (process.env.WEBHOOK_SECRET || 'ZenkAdmin777')) {
            console.warn('Tentativa de spoofing no Webhook! Token Inválido detectado.');
            return res.status(401).send('Unauthorized Token');
        }

        const payload = req.body;
        console.log('🔔 Webhook PixGo Recebido:', typeof payload === 'object' ? JSON.stringify(payload) : 'Carga Vazia');

            const status = payload.status || payload.event || (payload.data && payload.data.status);
            const external_id = payload.external_id || (payload.data && payload.data.external_id);
            const amountStr = payload.amount || (payload.data && payload.data.amount) || payload.value;
            const amount = typeof amountStr === 'string' ? parseFloat(amountStr) : amountStr;

            const statusFinal = status ? status.toLowerCase() : '';
            console.log(`[Webhook Info] Status Detetado: ${statusFinal} | ID Externo: ${external_id} | Valor: ${amount}`);

            if (statusFinal === 'concluído' || statusFinal === 'completed' || statusFinal === 'pago' || statusFinal === 'payment.completed') {
                if (!external_id) {
                    console.warn('⚠️ Webhook ignorado: Sem external_id');
                    return res.status(200).send('OK');
                }

                // Tenta extrair usando o novo separador '|' ou o antigo '_' para compatibilidade
                const userId = external_id.includes('|') ? external_id.split('|')[0] : external_id.split('_')[0];
                const user = await users.findById(userId);

                if (!user) {
                    console.error('❌ Webhook Erro Crítico: Usuário não encontrado para ID:', userId, ' (ID Original:', external_id, ')');
                    return res.status(200).send('OK');
                }

                let matchedPlanId = null;
                let matchedPlanInfo = null;
                for (const [key, plan] of Object.entries(PLAN_CONFIG)) {
                    if (Math.abs(parseFloat(plan.price) - parseFloat(amount)) < 0.01) {
                        matchedPlanId = key;
                        matchedPlanInfo = plan;
                        break;
                    }
                }

                if (matchedPlanId) {
                    const duration = planDurations[matchedPlanId] || 0;
                    const currentExpiresAt = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();
                    const planName = matchedPlanInfo.name;

                    await users.findByIdAndUpdate(userId, {
                        $set: {
                            expiresAt: currentExpiresAt + duration,
                            plan: planName
                        }
                    });

                    const embed = {
                        color: 0x00FF00,
                        title: "✅ VENDA APROVADA! (WEBHOOK)",
                        description: `- **🛒 PLANO:** \`${planName}\`\n- **💸 VALOR:** \`R$ ${matchedPlanInfo.price.toFixed(2).replace('.', ',')}\`\n- **👤 USUÁRIO:** \`${user.username}\``,
                        timestamp: new Date().toISOString()
                    };
                    
                    if (DISCORD_WEBHOOK) {
                        await axios.post(DISCORD_WEBHOOK, { embeds: [embed] }).catch((err) => {
                            console.error("❌ Erro ao enviar log Discord (Webhook):", err.message);
                        });
                    }

                    console.log(`✅ Webhook Confirmado: Saldo de ${duration / (24 * 60 * 60 * 1000)} dias ativado para ${user.username}`);
                } else {
                    console.warn(`⚠️ Webhook Aviso: Pagamento de R$ ${amount} recebido, mas não bate com nenhum preço em PLAN_CONFIG.`);
                }
            }
        res.status(200).send('OK');
    } catch (err) {
        console.error('Erro no processamento do Webhook PixGo:', err.message);
        res.status(500).send('Erro Interno');
    }
});

export default router;
