const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const patientsRouter = require('./routes/patients');
const visitsRouter = require('./routes/visits');

const labReportsRouter = require('./routes/labReports');
const billsRouter = require('./routes/bills');
const dashboardRouter = require('./routes/dashboard');




const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// mount routers
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/patients', patientsRouter);
app.use('/visits', visitsRouter);
app.use('/lab-reports', labReportsRouter);
app.use('/bills', billsRouter);
app.use('/dashboard', dashboardRouter);





// error handler
app.use((err, req, res, next) => {
  console.error('💥', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
