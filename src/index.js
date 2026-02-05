require('dotenv').config({ quiet: true });

const express = require('express')
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API is running' })
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
        

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    }catch(error){
        console.log('❌ Failed to start: ', error.message);
        process.exit(1);
    }
}

start();