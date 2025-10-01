const router = require('express').Router();
const path = require('path');
const { Bill } = require('../models/Bill');
const { Patient } = require('../models/Patient');

const { Visit } = require('../models/Visit');
const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');
const { generateBillPdf } = require('../services/pdf');
const { generateBillPdfToFile } = require('../services/pdf');

const fs = require('fs');

// Create bill (Reception/Admin)
router.post('/', auth(), permit('RECEPTION','ADMIN'), async (req, res, next) => {
  try {
    const { patientId, visitId, items } = req.body || {};
    if (!patientId || !visitId || !items || !items.length) {
      return res.status(400).json({ message: 'patientId, visitId, items required' });
    }

    const total = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const bill = await Bill.create({ patientId, visitId, items, total });

    res.status(201).json(bill);
  } catch (err) { next(err); }
});

// Generate PDF for a bill
// router.post('/:id/pdf', auth(), permit('RECEPTION','ADMIN'), async (req, res, next) => {
//   try {
//     const bill = await Bill.findById(req.params.id).populate('patientId');
//     if (!bill) return res.status(404).json({ message: 'Bill not found' });

//     const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'pdfs');
//     fs.mkdirSync(pdfPath, { recursive: true });
//     const filePath = path.join(pdfPath, `${bill._id}.pdf`);

//     await generateBillPdf(bill, bill.patientId, filePath);
//     bill.pdfUrl = '/uploads/pdfs/' + `${bill._id}.pdf`;
//     await bill.save();

//     res.json({ pdfUrl: bill.pdfUrl });
//   } catch (err) { next(err); }
// });

router.post('/:id/pdf', auth(), permit('RECEPTION','ADMIN'), async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patientId')     // need patient details
      .populate('visitId');      // optional: to show reason on PDF
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Ensure uploads/pdfs exists at project/server root
    const pdfDir = path.join(__dirname, '..', '..', 'uploads', 'pdfs');
    fs.mkdirSync(pdfDir, { recursive: true });

    const pdfFile = path.join(pdfDir, `${bill._id}.pdf`);
    await generateBillPdfToFile(bill, bill.patientId, pdfFile);

    bill.pdfUrl = `/uploads/pdfs/${bill._id}.pdf`; // public URL
    await bill.save();

    return res.json({ pdfUrl: bill.pdfUrl });
  } catch (err) {
    next(err);
  }
});


// List bills (Reception/Admin/Doctor)
router.get('/', auth(), permit('RECEPTION','ADMIN','DOCTOR'), async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const filter = patientId ? { patientId } : {};
    const bills = await Bill.find(filter).populate('patientId visitId');
    res.json(bills);
  } catch (err) { next(err); }
});

module.exports = router;
