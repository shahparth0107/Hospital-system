import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import ReceptionPatients from './pages/ReceptionPatients';
import DoctorVisits from './pages/DoctorVisits';
import LabUpload from './pages/LabUpload';
import { AppBar, Toolbar, Button, Typography, Stack } from '@mui/material';
import ReceptionBilling from './pages/ReceptionBilling';


function Nav() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }} onClick={() => (window.location.href = '/')} style={{ cursor: 'pointer' }}>
          Hospital System
        </Typography>
        {user && <Typography sx={{ mr: 2 }}>{user.role}</Typography>}
        <Stack direction="row" spacing={1}>
          {!user && <Button color="inherit" href="/login">Login</Button>}
          {user?.role === 'ADMIN' && (
            <>
              <Button color="inherit" href="/admin">Dashboard</Button>
              <Button color="inherit" href="/admin/users">Users</Button>
            </>
          )}
          {user?.role === 'RECEPTION' && (
            <>
              <Button color="inherit" href="/reception/patients">Patients</Button>
              <Button color="inherit" href="/reception/billing">Billing</Button>
            </>
          )}
          {user?.role === 'DOCTOR' && (
            <Button color="inherit" href="/doctor/visits">My Visits</Button>
          )}
          {user?.role === 'LAB' && (
            <Button color="inherit" href="/lab/upload">Lab Upload</Button>
          )}
          {user && <Button color="inherit" onClick={logout}>Logout</Button>}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><Users /></PrivateRoute>} />
          <Route path="/reception/patients" element={<PrivateRoute roles={['RECEPTION','ADMIN']}><ReceptionPatients /></PrivateRoute>} />
          <Route path="/doctor/visits" element={<PrivateRoute roles={['DOCTOR']}><DoctorVisits /></PrivateRoute>} />
          <Route path="/lab/upload" element={<PrivateRoute roles={['LAB','ADMIN']}><LabUpload /></PrivateRoute>} />
          <Route path="*" element={<Login />} />
          <Route path="/reception/billing" element={
  <PrivateRoute roles={['RECEPTION','ADMIN']}><ReceptionBilling /></PrivateRoute>
} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
