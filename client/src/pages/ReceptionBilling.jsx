import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import {
  Container, Typography, Stack, TextField, Button, Autocomplete,
  MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Paper, Link, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ReceptionBilling() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [patientQuery, setPatientQuery] = useState('');
  const [visits, setVisits] = useState([]);
  const [visitId, setVisitId] = useState('');
  const [items, setItems] = useState([{ desc:'Consultation Fee', amount: 500 }]);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');

  // Create-Visit dialog state
  const [openVisit, setOpenVisit] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');

  const total = useMemo(() => items.reduce((s, i) => s + Number(i.amount || 0), 0), [items]);

  // Initial load of patients (first page)
  useEffect(() => {
    (async () => {
      try {
        const r = await api('/patients?search=&limit=20', { token });
        setPatients(r.items || []);
      } catch (e) { console.error(e); }
    })();
  }, [token]);

  // Live patient search (when typing in Autocomplete)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await api(`/patients?search=${encodeURIComponent(patientQuery)}&limit=20`, { token });
        setPatients(r.items || []);
      } catch (e) { console.error(e); }
    }, 250);
    return () => clearTimeout(t);
  }, [patientQuery, token]);

  async function onPatientChange(_, value) {
    setPatient(value);
    setVisitId('');
    setBill(null);
    setVisits([]);
    if (value?._id) {
      try {
        const v = await api(`/visits?patientId=${value._id}`, { token });
        setVisits(v || []);
      } catch (e) { console.error(e); }
    }
  }

  // Line items helpers
  const updateItem = (idx, key, val) => {
    setItems(arr => {
      const copy = [...arr];
      copy[idx] = { ...copy[idx], [key]: key === 'amount' ? Number(val) : val };
      return copy;
    });
  };
  const addItem = () => setItems(arr => [...arr, { desc:'', amount: 0 }]);
  const delItem = (idx) => setItems(arr => arr.filter((_,i) => i !== idx));

  async function createBill() {
    try {
      setError('');
      if (!patient?._id) return setError('Please select a patient.');
      if (!visitId) return setError('Please select a visit (or create one).');
      if (!items.length) return setError('Please add at least one line item.');
      const r = await api('/bills', { method:'POST', token, body: { patientId: patient._id, visitId, items } });
      setBill(r);
    } catch (e) {
      setError(e.message);
    }
  }

  // --- Create Visit inline (when no visits exist) ---
  async function openCreateVisit() {
    setDoctorId('');
    setReason('');
    // load doctors for dropdown
    try {
      const docs = await api('/users/doctors', { token });
      setDoctors(docs || []);
      setOpenVisit(true);
    } catch (e) { console.error(e); }
  }

  async function createVisit() {
    if (!patient?._id || !doctorId) return;
    try {
      const v = await api('/visits', { method:'POST', token, body: { patientId: patient._id, doctorId, reason } });
      // reload visits and preselect the newly created one
      const list = await api(`/visits?patientId=${patient._id}`, { token });
      setVisits(list || []);
      setVisitId(v._id);
      setOpenVisit(false);
    } catch (e) { console.error(e); }
  }

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Billing</Typography>
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }} alignItems="center">
        <Autocomplete
          options={patients}
          getOptionLabel={(o) => (o?.name ? (o.phone ? `${o.name} (${o.phone})` : o.name) : '')}
          sx={{ width: 320 }}
          value={patient}
          onChange={onPatientChange}
          onInputChange={(_, val) => setPatientQuery(val)}
          renderInput={(params) => <TextField {...params} label="Select Patient" />}
        />

        <FormControl sx={{ minWidth: 280 }}>
          <InputLabel id="visit-label">Select Visit</InputLabel>
          <Select
            labelId="visit-label"
            value={visitId}
            label="Select Visit"
            onChange={e=>setVisitId(e.target.value)}
            disabled={!patient}
          >
            {visits.map(v => (
              <MenuItem key={v._id} value={v._id}>
                {v.reason || 'Visit'} — {v.patientId?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={createBill}>Create Bill</Button>

        {/* Only show if patient selected and no visits for them */}
        {patient && !visits.length && (
          <Button variant="outlined" onClick={openCreateVisit}>
            Create Visit
          </Button>
        )}
      </Stack>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Line Items</Typography>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Description</TableCell><TableCell>Amount</TableCell><TableCell></TableCell>
          </TableRow></TableHead>
          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField fullWidth size="small" value={it.desc} onChange={e=>updateItem(idx,'desc', e.target.value)} />
                </TableCell>
                <TableCell width={160}>
                  <TextField size="small" type="number" value={it.amount} onChange={e=>updateItem(idx,'amount', e.target.value)} />
                </TableCell>
                <TableCell width={60}>
                  <IconButton onClick={() => delItem(idx)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <Button onClick={addItem}>+ Add item</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>Total: <b>₹{total}</b></Typography>
      </Paper>

     {bill && (
  <Paper sx={{ p:2 }}>
    <Typography variant="subtitle1">Bill Created</Typography>
    <Typography>Bill ID: <b>{bill._id}</b></Typography>
    <Stack direction="row" spacing={1} sx={{ mt:1 }}>
      <Button
        variant="outlined"
        onClick={async () => {
          const r = await api(`/bills/${bill._id}/pdf`, { method: 'POST', token });
          if (r?.pdfUrl) window.open(`${import.meta.env.VITE_API_URL}${r.pdfUrl}`, '_blank');
        }}
      >
        Generate PDF
      </Button>
    </Stack>
  </Paper>
)}



      {/* Create Visit Dialog */}
      <Dialog open={openVisit} onClose={() => setOpenVisit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Visit</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Patient: <b>{patient?.name}</b></Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="doc-label">Doctor</InputLabel>
            <Select labelId="doc-label" value={doctorId} label="Doctor" onChange={e=>setDoctorId(e.target.value)}>
              {doctors.map(d => (
                <MenuItem key={d._id} value={d._id}>{d.name} — {d.email}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Reason" value={reason} onChange={e=>setReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisit(false)}>Cancel</Button>
          <Button variant="contained" onClick={createVisit}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
