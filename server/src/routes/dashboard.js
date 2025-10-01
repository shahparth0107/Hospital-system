const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');
const { Patient } = require('../models/Patient');
const { Visit } = require('../models/Visit');
const { Bill } = require('../models/Bill');

router.get('/admin', auth(), permit('ADMIN'), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const [patientsToday, visitsToday, unpaidBills, totalPatients] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: today } }),
      Visit.countDocuments({ createdAt: { $gte: today } }),
      Bill.countDocuments({ status: 'UNPAID' }),
      Patient.countDocuments()
    ]);

    res.json({
      patientsToday,
      visitsToday,
      unpaidBills,
      totalPatients
    });
  } catch (err) { next(err); }
});


router.get('/doctor', auth(), permit('DOCTOR'), async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const [totalVisits, openVisits, closedVisits] = await Promise.all([
      Visit.countDocuments({ doctorId }),
      Visit.countDocuments({ doctorId, status: 'OPEN' }),
      Visit.countDocuments({ doctorId, status: 'CLOSED' })
    ]);

    res.json({
      doctor: req.user.name,
      totalVisits,
      openVisits,
      closedVisits
    });
  } catch (err) { next(err); }
});

module.exports = router;
