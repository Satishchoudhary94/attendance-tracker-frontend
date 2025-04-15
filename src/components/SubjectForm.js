import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SubjectForm = () => {
  const [subjectName, setSubjectName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!subjectName.trim()) {
      setError('Subject name is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add subjects');
        setLoading(false);
        navigate('/login');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/subjects',
        { name: subjectName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError('Error adding subject. Please try again.');
      }
      console.error('Error adding subject:', error);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Subject
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Register a new subject to track your attendance.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Subject Details
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Subject Name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
            placeholder="e.g., Mathematics, Physics, Computer Science"
            disabled={loading}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              disabled={loading}
              sx={{ 
                py: 1.5,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {loading ? 'Adding...' : 'Add Subject'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              startIcon={<ArrowBackIcon />}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SubjectForm; 