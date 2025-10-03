const router = require('express').Router();
// const { Patient } = require('../models/Patient');
const { Patient } = require('../models/Patient');

const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');

// Reception or Admin can create patients
router.post('/', auth(), permit('RECEPTION', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, phone, age, gender, address } = req.body || {};
    if (!name || !phone || !age || !gender) return res.status(400).json({ message: 'Missing fields' });

    const patient = await Patient.create({
      name, phone, age, gender, address,
      createdBy: req.user._id
    });
    
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

// Search + paginate
router.get('/', auth(), permit('RECEPTION','ADMIN','DOCTOR','LAB'), async (req, res, next) => {
  try {
    const q = (req.query.search || '').trim();
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { phone: { $regex: q } }] } : {};
    const [items, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total });
  } catch (err) { next(err); }
});

// List/search patients — allow ADMIN, RECEPTION, LAB (and DOCTOR if you want)
router.get('/', auth(), permit('ADMIN','RECEPTION','LAB'), async (req, res, next) => {
  try {
    const q = (req.query.search || '').trim();
    const filter = q
      ? { $or: [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }] }
      : {};
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const items = await Patient.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ items });
  } catch (e) { next(e); }
});


module.exports = router;
