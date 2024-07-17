const express = require('express');
const Message = require('../models/message');

const router = express.Router();

router.post('/', async (req, res) => {
    const { message, sendDate, contactIds } = req.body;
    const newMessage = new Message({ message, sendDate, contacts: contactIds });

    try {
        await newMessage.save();
        res.send('Mensagem agendada');
    } catch (error) {
        res.status(500).send('Erro ao agendar a mensagem');
    }
});

module.exports = router;
