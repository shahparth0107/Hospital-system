import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import {
  Container, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

export default function ReceptionPatients() {
  const { token } = useAuth();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name:'', phone:'', age:'', gender:'M', address:'' });

  // Add Visit dialog state
  const [openVisit, setOpenVisit] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');

  async function reload() {
    const r = await api(`/patients?search=${encodeURIComponent(q)}&limit=20`, { token });
    setRows(r.items);
  }

  useEffect(() => {
    (async () => {
      const r = await api(`/patients?search=&limit=20`, { token });
      setRows(r.items);
    })();
  }, [token]);

  async function addPatient() {
    await api('/patients', { method:'POST', token, body: { ...form, age: Number(form.age) } });
    setForm({ name:'', phone:'', age:'', gender:'M', address:'' });
    await reload();
  }

  async function openAddVisit(p) {
    setSelectedPatient(p);
    // load doctors list
    const docs = await api('/users/doctors', { token });
    setDoctors(docs);
    setDoctorId('');
    setReason('');
    setOpenVisit(true);
  }

  async function createVisit() {
    if (!selectedPatient || !doctorId) return;
    await api('/visits', {
      method: 'POST',
      token,
      body: { patientId: selectedPatient._id, doctorId, reason }
    });
    setOpenVisit(false);
    alert('Visit created!');
  }

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Patients</Typography>

      <Stack direction="row" spacing={1} sx={{ mb:2 }}>
        <TextField size="small" label="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <Button onClick={reload} variant="outlined">Search</Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb:2 }}>
        <TextField size="small" label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <TextField size="small" label="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <TextField size="small" label="Age" value={form.age} onChange={e=>setForm({...form, age:e.target.value})}/>
        <TextField size="small" label="Gender" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}/>
        <TextField size="small" label="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
        <Button variant="contained" onClick={addPatient}>Add Patient</Button>
      </Stack>

      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Name</TableCell><TableCell>Phone</TableCell><TableCell>Age</TableCell><TableCell>Gender</TableCell><TableCell>Actions</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {rows.map(p=>(
            <TableRow key={p._id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>{p.age}</TableCell>
              <TableCell>{p.gender}</TableCell>
              <TableCell>
                <Button size="small" variant="outlined" onClick={() => openAddVisit(p)}>Add Visit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Visit Dialog */}
      <Dialog open={openVisit} onClose={() => setOpenVisit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Visit</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Patient: <b>{selectedPatient?.name}</b></Typography>
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
