import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, apiForm } from '../api/http';
import {
  Container, Typography, TextField, Button, Stack, Autocomplete,
  MenuItem, Select, InputLabel, FormControl, Alert
} from '@mui/material';

export default function LabUpload() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [patient, setPatient] = useState(null);

  const [visits, setVisits] = useState([]);
  const [visitId, setVisitId] = useState('');

  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // initial list
  useEffect(() => {
    (async () => {
      try {
        const r = await api('/patients?search=&limit=20', { token });
        setPatients(r.items || []);
      } catch (e) { console.error(e); }
    })();
  }, [token]);

  // live search
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
    setVisits([]);
    if (value?._id) {
      try {
        const v = await api(`/visits?patientId=${value._id}`, { token });
        setVisits(v || []);
      } catch (e) { console.error(e); }
    }
  }

  async function upload() {
    setError(''); setOk('');
    if (!patient?._id) return setError('Select a patient');
    if (!visitId) return setError('Select a visit');
    if (!title) return setError('Enter a title');
    if (!file) return setError('Choose a file');

    try {
      const fd = new FormData();
      // THESE field names must match the backend multer handler
      fd.append('patientId', patient._id);
      fd.append('visitId', visitId);
      fd.append('title', title);
      fd.append('file', file);

      const r = await apiForm('/lab-reports', { formData: fd, token });
      setOk(`Uploaded: ${r._id}`);
      setTitle(''); setFile(null);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Upload Lab Report</Typography>
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb:2 }}>{ok}</Alert>}

      <Stack direction={{ xs:'column', md:'row' }} spacing={2} sx={{ mb:2 }}>
        <Autocomplete
          options={patients}
          getOptionLabel={(o) => (o?.name ? (o.phone ? `${o.name} (${o.phone})` : o.name) : '')}
          sx={{ minWidth: 280 }}
          value={patient}
          onChange={onPatientChange}
          onInputChange={(_, val) => setPatientQuery(val)}
          renderInput={(params) => <TextField {...params} label="Select Patient" />}
        />

        <FormControl sx={{ minWidth: 260 }} disabled={!patient}>
          <InputLabel id="visit-label">Select Visit</InputLabel>
          <Select
            labelId="visit-label"
            value={visitId}
            label="Select Visit"
            onChange={e=>setVisitId(e.target.value)}
          >
            {visits.map(v => (
              <MenuItem key={v._id} value={v._id}>
                {v.reason || 'Visit'} — {v.patientId?.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Button variant="outlined" component="label">
          Choose File
          <input hidden type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        </Button>
        <Button variant="contained" onClick={upload}>Upload</Button>
      </Stack>
    </Container>
  );
}
