const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/whatsapp_scheduler', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;
