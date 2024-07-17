const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: String,
    sendDate: Date,
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
    sent: { type: Boolean, default: false } // Campo para rastrear se a mensagem já foi enviada
});

module.exports = mongoose.model('Message', MessageSchema);
