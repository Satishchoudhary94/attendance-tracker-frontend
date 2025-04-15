import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timeline as TimelineIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AttendanceModal from './AttendanceModal';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/subjects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSubjects(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Error fetching subjects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/subjects/${subjectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchSubjects();
        setSnackbar({
          open: true,
          message: 'Subject deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting subject:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting subject',
          severity: 'error',
        });
      }
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  // Calculate overall statistics
  const overallStats = subjects.reduce(
    (acc, subject) => {
      acc.totalClasses += subject.totalClasses;
      acc.attendedClasses += subject.attendedClasses;
      return acc;
    },
    { totalClasses: 0, attendedClasses: 0 }
  );

  const overallPercentage = overallStats.totalClasses
    ? Math.round((overallStats.attendedClasses / overallStats.totalClasses) * 100)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchSubjects}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Welcome back, {user?.name}!
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 3 }}>
          Track and manage your attendance with ease
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="h6">{subjects.length}</Typography>
              <Typography variant="body2">Total Subjects</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="h6">{overallStats.totalClasses}</Typography>
              <Typography variant="body2">Total Classes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="h6">{overallPercentage}%</Typography>
              <Typography variant="body2">Overall Attendance</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-subject')}
          sx={{ py: 1.5 }}
        >
          Add New Subject
        </Button>
      </Box>

      {/* Subjects Grid */}
      <Grid container spacing={3}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} key={subject._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {subject.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Delete Subject">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteSubject(subject._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Attendance Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={subject.attendancePercentage}
                    color={getAttendanceColor(subject.attendancePercentage)}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {subject.attendancePercentage}% ({subject.attendedClasses}/{subject.totalClasses} classes)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${subject.attendedClasses} Present`}
                    size="small"
                    color="success"
                  />
                  <Chip
                    icon={<CancelIcon />}
                    label={`${subject.totalClasses - subject.attendedClasses} Absent`}
                    size="small"
                    color="error"
                  />
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSelectedSubject(subject);
                    setOpenModal(true);
                  }}
                  startIcon={<TimelineIcon />}
                >
                  Mark Attendance
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Subjects Message */}
      {!loading && subjects.length === 0 && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Subjects Added Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first subject to track attendance
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-subject')}
          >
            Add Your First Subject
          </Button>
        </Paper>
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchSubjects();
        }}
        subject={selectedSubject}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 