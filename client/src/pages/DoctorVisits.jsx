import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Stack } from '@mui/material';

export default function DoctorVisits() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({}); // visitId -> note

  async function reload() {
    const r = await api('/visits/my?limit=20', { token });
    setRows(r.items);
  }

  useEffect(() => { reload(); }, [token]);

  const handleChange = (id, v) => setNotes(s => ({ ...s, [id]: v }));

  async function addNote(id) {
    const text = (notes[id] || '').trim();
    if (!text) return;
    await api(`/visits/${id}/notes`, { method:'PATCH', token, body:{ text } });
    setNotes(s => ({ ...s, [id]: '' }));
    await reload();
  }

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>My Visits</Typography>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Patient</TableCell><TableCell>Reason</TableCell><TableCell>Notes Count</TableCell><TableCell>Add Note</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {rows.map(v=>(
            <TableRow key={v._id}>
              <TableCell>{v.patientId?.name}</TableCell>
              <TableCell>{v.reason}</TableCell>
              <TableCell>{v.notes?.length||0}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" placeholder="Write note..." value={notes[v._id]||''} onChange={e=>handleChange(v._id, e.target.value)} />
                  <Button variant="contained" onClick={() => addNote(v._id)}>Save</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
