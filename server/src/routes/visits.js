const router = require('express').Router();
const { Visit } = require('../models/Visit');
const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');

// Reception creates visit and assigns doctor
// router.post('/', auth(), permit('RECEPTION','ADMIN'), async (req, res, next) => {
//   try {
//     const { patientId, doctorId, reason } = req.body || {};
//     if (!patientId || !doctorId) return res.status(400).json({ message: 'patientId & doctorId required' });

//     const visit = await Visit.create({ patientId, doctorId, reason });
//     res.status(201).json(visit);
//   } catch (err) { next(err); }
// });

// Reception/Admin: create a visit and assign a doctor
router.post('/', auth(), permit('RECEPTION','ADMIN'), async (req, res, next) => {
  try {
    const { patientId, doctorId, reason } = req.body || {};
    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'patientId & doctorId required' });
    }
    const visit = await Visit.create({ patientId, doctorId, reason });
    return res.status(201).json(visit);
  } catch (err) { next(err); }
});

// Reception/Admin/Lab/Doctor: list visits (optionally by patient)
router.get('/', auth(), permit('LAB','RECEPTION','ADMIN','DOCTOR'), async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;
    if (req.user.role === 'DOCTOR') filter.doctorId = req.user._id;

    const visits = await Visit.find(filter)
      .populate('patientId doctorId')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(visits);
  } catch (e) { next(e); }
});


// GET visits by patient (Lab/Reception/Admin)
router.get('/', auth(), permit('LAB','RECEPTION','ADMIN','DOCTOR'), async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;

    // If DOCTOR, restrict to own visits (unless Admin/Reception/Lab)
    if (req.user.role === 'DOCTOR') filter.doctorId = req.user._id;

    const visits = await Visit.find(filter)
      .populate('patientId doctorId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(visits);
  } catch (e) { next(e); }
});


// Doctor: my visits
router.get('/my', auth(), permit('DOCTOR'), async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Visit.find({ doctorId: req.user._id }).populate('patientId').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Visit.countDocuments({ doctorId: req.user._id })
    ]);
    res.json({ items, page, limit, total });
  } catch (err) { next(err); }
});

// Doctor: add notes
router.patch('/:id/notes', auth(), permit('DOCTOR'), async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'note text required' });

    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text, by: req.user._id } } },
      { new: true }
    ).populate('patientId');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });

    res.json(visit);
  } catch (err) { next(err); }
});

module.exports = router;
