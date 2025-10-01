import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/http';
import { Container, Typography, Grid, Paper } from '@mui/material';

const Card = ({ title, value }) => (
  <Paper sx={{ p:2 }}>
    <Typography variant="overline">{title}</Typography>
    <Typography variant="h5">{value}</Typography>
  </Paper>
);

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [data, setData] = useState({ patientsToday:0, visitsToday:0, unpaidBills:0, totalPatients:0 });
  useEffect(() => {
    api('/dashboard/admin', { token }).then(setData).catch(err => {
      console.error(err); if (String(err).includes('401')) logout();
    });
  }, [token, logout]);
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Admin Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><Card title="Patients Today" value={data.patientsToday} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Card title="Visits Today" value={data.visitsToday} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Card title="Unpaid Bills" value={data.unpaidBills} /></Grid>
        <Grid item xs={12} sm={6} md={3}><Card title="Total Patients" value={data.totalPatients} /></Grid>
      </Grid>
    </Container>
  );
}
