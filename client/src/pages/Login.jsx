import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import { Button, Container, TextField, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
//   const [email, setEmail] = useState('admin@hms.test');
const [email, setEmail] = useState('');

//   const [password, setPassword] = useState('admin123');
const [password, setPassword] = useState('');

  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
      login(token, user);
      if (user.role === 'ADMIN') nav('/admin');
      else if (user.role === 'RECEPTION') nav('/reception/patients');
      else if (user.role === 'DOCTOR') nav('/doctor/visits');
      else if (user.role === 'LAB') nav('/lab/upload');
      else nav('/');
    } catch (e) { setErr(e.message); }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography variant="h5" gutterBottom>Hospital System Login</Typography>
      <Box component="form" onSubmit={submit}>
        <TextField fullWidth margin="normal" label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <TextField fullWidth margin="normal" type="password" label="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <Typography color="error" variant="body2">{err}</Typography>}
        <Button fullWidth sx={{ mt: 2 }} type="submit" variant="contained">Login</Button>
      </Box>
    </Container>
  );
}
