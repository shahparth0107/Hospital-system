const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { permit } = require('../middleware/permit');
const { LabReport } = require('../models/LabReport');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'lab');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // keep extension
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/', auth(), permit('LAB','ADMIN'), upload.single('file'), async (req, res, next) => {
  try {
    const { patientId, visitId, title } = req.body;
    if (!patientId || !visitId || !title || !req.file) {
      return res.status(400).json({ message: 'patientId, visitId, title and file are required' });
    }
    const url = `/uploads/lab/${req.file.filename}`;
    const report = await LabReport.create({
      patientId, visitId, title,
      fileUrl: url,
      uploadedBy: req.user._id
    });
    res.status(201).json(report);
  } catch (e) { next(e); }
});

module.exports = router;
