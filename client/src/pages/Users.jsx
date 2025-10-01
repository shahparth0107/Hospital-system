import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import {
  Container, Typography, TextField, Button, Stack, List, ListItem, ListItemText,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';

const ROLES = ['ADMIN','DOCTOR','RECEPTION','LAB'];

export default function Users() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'DOCTOR' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function load() {
    try {
      const r = await api('/users?limit=100', { token });
      setList(r.items || r); // support either `{items:[]}` or `[]`
    } catch (e) { console.error(e); }
  }

  useEffect(() => { load(); }, [token]);

  async function createUser() {
    setErr(''); setOk('');
    if (!form.name || !form.email || !form.password) {
      setErr('Name, Email, and Password are required');
      return;
    }
    try {
      await api('/users', { method:'POST', body: form, token });
      setOk(`${form.role} created`);
      setForm({ name:'', email:'', password:'', role: form.role });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h6" gutterBottom>Staff</Typography>
      {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}
      {ok && <Alert severity="success" sx={{ mb:2 }}>{ok}</Alert>}

      <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ mb:2 }}>
        <TextField size="small" label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <TextField size="small" label="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <TextField size="small" type="password" label="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="role">Role</InputLabel>
          <Select labelId="role" label="Role" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={createUser}>Create</Button>
      </Stack>

      <List dense>
        {list.map(u => (
          <ListItem key={u._id}>
            <ListItemText
              primary={`${u.name} — ${u.role}`}
              secondary={u.email}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
