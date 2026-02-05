require('dotenv').config({quiet: true});

const express = require('express')

const app = express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.json({message: 'API is running'})
});

const PORT = process.env.PORT || 3001;

app.listen (PORT, ()=>{
    console.log(`✅ Server is running on port ${PORT}`);
})