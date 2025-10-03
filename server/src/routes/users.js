const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User, ROLES } = require('../models/User');
const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');




const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


// Create staff user (ADMIN only)
router.post('/', auth(), permit('ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, role required' });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });

        if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number",
      });
    }


    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), passwordHash, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { next(err); }
});

// List users with search + pagination (ADMIN only)
router.get('/', auth(), permit('ADMIN'), async (req, res, next) => {
  try {
    const q = (req.query.search || '').trim();
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = q
      ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
      : {};

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash'),
      User.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total });
  } catch (err) { next(err); }
});

router.get('/doctors', auth(), permit('ADMIN','RECEPTION'), async (req, res, next) => {
  try {
    const docs = await User.find({ role: 'DOCTOR' })
      .select('_id name email role')
      .sort({ name: 1 });
    res.json(docs);
  } catch (e) { next(e); }
});


module.exports = router;
