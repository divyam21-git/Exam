// controllers/adminController.js
const User = require('../models/User');
const Exam = require('../models/Exam');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a sub-admin (admin only)
exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    const subAdmin = await User.create({ name, email, password: hashed, role: 'subadmin' });
    res.status(201).json({ id: subAdmin._id, name: subAdmin.name, email: subAdmin.email, role: subAdmin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a sub-admin (admin only)
exports.deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'subadmin') {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    await user.remove();
    res.json({ message: 'Sub-admin deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
