const express = require('express');
const Contact = require('../models/contact');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (error) {
        res.status(500).send('Erro ao obter contatos');
    }
});

module.exports = router;
