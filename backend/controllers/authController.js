const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

const register = async(req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const allowedRoles = ['admin', 'staff', 'student'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Role must be Admin, Staff, or Student.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });

    res.status(201).json({
        message: 'Registration successful. Please sign in.',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

const login = async(req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (role && user.role !== role) {
        return res.status(403).json({ message: 'Please select the correct role for this account.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({ token: generateToken(user), role: user.role });
};

module.exports = { register, login };