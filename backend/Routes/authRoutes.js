const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Model/user'); 


router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || 'employee' // Default role is 'employee'
        });

        
        await newUser.save();

        res.status(201).json({ message: 'Admin user added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(payload, config.secret, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, isAdmin: user.role === 'admin' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;