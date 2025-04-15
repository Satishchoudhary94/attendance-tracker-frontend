import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';

const AttendanceModal = ({ open, onClose, subject }) => {
  const [date, setDate] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (open && subject) {
      fetchAttendanceHistory();
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [open, subject]);

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/attendance/subject/${subject._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAttendanceHistory(response.data);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setError('Error fetching attendance history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleMarkAttendance = async (status) => {
    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance', 
        {
          subjectId: subject._id,
          date,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchAttendanceHistory();
      setDate('');
      setSuccessMessage(`Attendance marked as ${status} successfully`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'Attendance already marked for this date');
      } else if (error.response?.status === 404) {
        setError('Subject not found');
      } else {
        setError('Error marking attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/attendance/${attendanceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchAttendanceHistory();
      setSuccessMessage('Attendance record deleted successfully');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      setError('Error deleting attendance record. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Mark Attendance</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {subject?.name}
          </Typography>
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => handleMarkAttendance('present')}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Marking...' : 'Present'}
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => handleMarkAttendance('absent')}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Marking...' : 'Absent'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Chip 
            icon={<HistoryIcon />} 
            label="Attendance History" 
            size="small" 
            sx={{ backgroundColor: 'background.paper' }}
          />
        </Divider>

        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : attendanceHistory.length > 0 ? (
          <List>
            {attendanceHistory.map((record) => (
              <ListItem
                key={record._id}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDeleteAttendance(record._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={formatDate(record.date)}
                  secondary={
                    <Chip
                      icon={record.status === 'present' ? <CheckCircleIcon /> : <CancelIcon />}
                      label={record.status}
                      color={record.status === 'present' ? 'success' : 'error'}
                      size="small"
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'background.default'
            }}
          >
            <Typography color="text.secondary">
              No attendance records yet
            </Typography>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal; 