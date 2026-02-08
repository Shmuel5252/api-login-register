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