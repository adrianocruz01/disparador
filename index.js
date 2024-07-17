const express = require('express');
const connectDB = require('./config/db');
const uploadRoute = require('./routes/upload');
const scheduleRoute = require('./routes/schedule');
const errorHandler = require('./utils/errorHandler');
const nodeCron = require('node-cron');
const Message = require('./models/message');
const axios = require('axios');
const moment = require('moment-timezone');
const app = express();

const contactsRoute = require('./routes/contacts');

// const ZAPI_INSTANCE = '3D25B2E87B6F80B099B5A61DF9B5C7E'; // Substitua com seu ID de instância
// const ZAPI_TOKEN = '83A665BC285422761FA741BE'; // Substitua com seu token de instância
const ZAPI_URL = `https://api.z-api.io/instances/3D25B2E87B6F80B0B99B5A61DF9B5C7E/token/83A665BC285422761FA741BE/send-text`;
const CLIENT_TOKEN = 'F99e9cccc19014bcabad91a340061ea8aS';

app.use(express.json());


// Conectar ao MongoDB
connectDB();

// Rotas
app.use('/contacts', contactsRoute);
app.use('/upload', uploadRoute);
app.use('/schedule', scheduleRoute);
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Função para enviar a mensagem
const sendMessage = async (msg) => {
    try {
        for (const contact of msg.contacts) {
            const response = await axios.post(ZAPI_URL, {
                phone: contact.phoneNumber,
                message: msg.message,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': CLIENT_TOKEN
                }
            });
            console.log(`Mensagem enviada para ${contact.phoneNumber}`, response.data);
        }
        msg.sent = true;
        await msg.save();
        console.log(`Mensagem agendada para ${msg.sendDate} foi enviada e marcada como enviada.`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem:`, error);
    }
};

// Agendar mensagens
const scheduleMessage = (msg) => {
    const now = moment().tz('America/Sao_Paulo');
    const sendDate = moment(msg.sendDate).tz('America/Sao_Paulo');
    const delay = sendDate.diff(now);

    if (delay > 0) {
        console.log(`Agendando mensagem para ${msg.sendDate} com um delay de ${delay} ms.`);
        setTimeout(() => sendMessage(msg), delay);
    } else {
        console.log(`Enviando mensagem atrasada imediatamente: ${msg.sendDate}`);
        // Se a data de envio já passou, envia imediatamente
        sendMessage(msg);
    }
};

// Verificar e agendar mensagens periodicamente
const scheduleMessagesPeriodically = async () => {
    const messages = await Message.find({ sent: false }).populate('contacts');
    messages.forEach(msg => {
        const now = moment().tz('America/Sao_Paulo');
        const sendDate = moment(msg.sendDate).tz('America/Sao_Paulo');

        if (now.isSame(sendDate, 'minute')) {
            console.log(`Enviando mensagem no minuto exato: ${sendDate.format()}`);
            sendMessage(msg);
        } else {
            scheduleMessage(msg);
        }
    });
};

// Usar node-cron para verificar novas mensagens a cada minuto
nodeCron.schedule('* * * * *', () => {
    console.log('Verificando mensagens agendadas...');
    scheduleMessagesPeriodically();
});

// Agendar mensagens ao iniciar o servidor
scheduleMessagesPeriodically();
