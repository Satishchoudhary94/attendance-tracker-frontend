import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
            }}
          >
            Attendance Tracker
          </Typography>

          {user ? (
            <>
              {isMobile ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMobileMenuOpen}
                    edge="end"
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={mobileMenuAnchor}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                  >
                    <MenuItem onClick={() => handleNavigate('/')}>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/analytics')}>
                      Analytics
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/add-subject')}>
                      Add Subject
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/profile')}>
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/"
                    sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/analytics"
                    sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                  >
                    Analytics
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/add-subject"
                    sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                  >
                    Add Subject
                  </Button>
                  <Tooltip title="Toggle theme">
                    <IconButton onClick={toggleTheme} color="inherit">
                      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Profile">
                    <IconButton
                      onClick={() => navigate('/profile')}
                      sx={{ ml: 1 }}
                      color="inherit"
                    >
                      {user.avatar ? (
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{ width: 32, height: 32 }}
                        />
                      ) : (
                        <AccountCircleIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Logout">
                    <IconButton
                      onClick={handleLogout}
                      sx={{ ml: 1 }}
                      color="inherit"
                    >
                      <LogoutIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 