const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String // Certifique-se de que este campo está presente
});

module.exports = mongoose.model('Contact', ContactSchema);
