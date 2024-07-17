const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const Contact = require('../models/contact');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    const file = xlsx.readFile(req.file.path);
    const sheet = file.Sheets[file.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    try {
        const contacts = data.map(contact => ({
            name: contact.name,
            phoneNumber: contact.phoneNumber // Certifique-se de que a coluna está correta
        }));
        await Contact.insertMany(contacts);
        res.send('Planilha processada');
    } catch (error) {
        console.error('Erro ao processar a planilha:', error);
        res.status(500).send('Erro ao processar a planilha');
    }
});

module.exports = router;
