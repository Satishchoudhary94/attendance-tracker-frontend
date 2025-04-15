import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <SchoolIcon
        sx={{
          fontSize: 60,
          color: 'primary.main',
          mb: 4,
          animation: 'bounce 2s infinite'
        }}
      />
      <CircularProgress size={40} thickness={4} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        Loading your attendance tracker...
      </Typography>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            60% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingScreen; 