import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ATTENDANCE_THRESHOLDS = {
  GOOD: 75,
  AVERAGE: 65,
};

const CHART_COLORS = {
  good: '#4CAF50',    // Green
  average: '#FFC107', // Amber
  poor: '#F44336',    // Red
  primary: '#2196F3', // Blue
};

// Utility Functions
const calculateAttendancePercentage = (attended, total) => {
  if (!total) return 0;
  return Math.round((attended / total) * 100);
};

const getAttendanceStatus = (percentage) => {
  if (percentage >= ATTENDANCE_THRESHOLDS.GOOD) return { label: 'Good', color: 'success', chartColor: CHART_COLORS.good };
  if (percentage >= ATTENDANCE_THRESHOLDS.AVERAGE) return { label: 'Average', color: 'warning', chartColor: CHART_COLORS.average };
  return { label: 'Poor', color: 'error', chartColor: CHART_COLORS.poor };
};

// Chart Components
const AttendanceBarChart = ({ data }) => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: theme.palette.text.primary }}
          interval={0}
          height={60}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          tick={{ fill: theme.palette.text.primary }}
          domain={[0, 100]}
          label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Legend />
        <Bar 
          dataKey="attendance" 
          fill={CHART_COLORS.primary}
          name="Attendance %"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getAttendanceStatus(entry.attendance).chartColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const AttendancePieChart = ({ data }) => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={100}
          fill={CHART_COLORS.primary}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                entry.name === 'Good Attendance' ? CHART_COLORS.good :
                entry.name === 'Average Attendance' ? CHART_COLORS.average :
                CHART_COLORS.poor
              }
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Main Component
const Analytics = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects data');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    const totalPercentage = subjects.reduce((sum, subject) => {
      return sum + calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
    }, 0);
    return Math.round(totalPercentage / subjects.length);
  };

  const prepareChartData = () => {
    const barChartData = subjects.map(subject => ({
      name: subject.name,
      attendance: calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses),
    }));

    const pieChartData = [
      { 
        name: 'Good Attendance', 
        value: subjects.filter(s => 
          calculateAttendancePercentage(s.attendedClasses, s.totalClasses) >= ATTENDANCE_THRESHOLDS.GOOD
        ).length 
      },
      { 
        name: 'Average Attendance', 
        value: subjects.filter(s => {
          const percentage = calculateAttendancePercentage(s.attendedClasses, s.totalClasses);
          return percentage >= ATTENDANCE_THRESHOLDS.AVERAGE && percentage < ATTENDANCE_THRESHOLDS.GOOD;
        }).length 
      },
      { 
        name: 'Poor Attendance', 
        value: subjects.filter(s => 
          calculateAttendancePercentage(s.attendedClasses, s.totalClasses) < ATTENDANCE_THRESHOLDS.AVERAGE
        ).length 
      },
    ].filter(item => item.value > 0); // Only show categories with values

    return { barChartData, pieChartData };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const overallAttendance = calculateOverallAttendance();
  const overallStatus = getAttendanceStatus(overallAttendance);
  const { barChartData, pieChartData } = prepareChartData();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              mb: 3,
              background: `linear-gradient(45deg, ${CHART_COLORS.primary} 30%, ${theme.palette.primary.light} 90%)`,
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Attendance Analytics
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">Overall Attendance:</Typography>
              <Chip
                label={`${overallAttendance}%`}
                color={overallStatus.color}
                sx={{ 
                  fontSize: '1.1rem', 
                  px: 2,
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiChip-label': { color: 'white' },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Subject-wise Attendance
              </Typography>
              <AttendanceBarChart data={barChartData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Attendance Distribution
              </Typography>
              <AttendancePieChart data={pieChartData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Details Section */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Subject Details
              </Typography>
              <Grid container spacing={2}>
                {subjects.map((subject) => {
                  const percentage = calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
                  const status = getAttendanceStatus(percentage);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={subject._id}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: theme.palette.background.default,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                          },
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          {subject.name}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {subject.attendedClasses} / {subject.totalClasses} classes
                          </Typography>
                          <Chip
                            label={`${percentage}%`}
                            color={status.color}
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics; 