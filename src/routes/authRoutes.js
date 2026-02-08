const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const router = express.Router();


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'fullName, email, password are required' })
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: 'Password must be 8+ chars and include uppercase, number, and symbol', })
        }
        const existing = await User.findOne({ email: email.toLowerCase().trim() })
        if (existing) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            fullName,
            email: email.toLowerCase().trim(),
            passwordHash,
            role: 'user',
        });

        return res.status(201).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

module.exports = router;


const jwt = require('jsonwebtoken');

router.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: 'email and password are required'})
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({email: normalizedEmail});

        if(!user){
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn:process.env.JWT_EXPIRES_IN || '1h',
        });

        return res.status(200).json({
            token,
            user:{
                id: user._id,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }catch(error){
        return res.status(500).json({message: error.message})
    }
})