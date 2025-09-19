import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme,
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Tab,
  Tabs,
  CssBaseline,
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import CalculateIcon from '@mui/icons-material/Calculate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloseIcon from '@mui/icons-material/Close';

import SIPCalculator from './components/SIPCalculator';
import LumpsumCalculator from './components/LumpsumCalculator';
import SWPCalculator from './components/SWPCalculator';
import GoalCalculator from './components/GoalCalculator';
import Home from './pages/Home';
import Disclaimer from './components/Disclaimer';
import { THEME_CONSTANTS } from './constants/theme';
import './App.css';

// Navigation routes and labels
const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: <CalculateIcon /> },
  { path: '/sip', label: 'SIP', icon: <CalculateIcon /> },
  { path: '/lumpsum', label: 'Lumpsum', icon: <AttachMoneyIcon /> },
  { path: '/swp', label: 'SWP', icon: <TimelineIcon /> },
  { path: '/goals', label: 'Goal Calculator', icon: <FlagIcon /> },
];

function NavigationTabs() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Show all tabs; on mobile they are scrollable
  const visibleTabs = NAV_ITEMS;
  
  return (
    <Tabs 
      value={NAV_ITEMS.findIndex(item => item.path === location.pathname)}
      variant={isMobile ? "scrollable" : "standard"}
      scrollButtons={isMobile ? "auto" : false}
      sx={{
        '& .MuiTab-root': {
          minWidth: isMobile ? 'auto' : 120,
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'primary.main',
          },
          textTransform: 'none',
          fontSize: '0.9rem',
        },
      }}
    >
      {visibleTabs.map((item) => (
        <Tab 
          key={item.path}
          label={item.label}
          icon={isMobile ? item.icon : undefined}
          iconPosition="start"
          component={Link}
          to={item.path}
        />
      ))}
    </Tabs>
  );
}

function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'background.paper',
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">SIP Calculator Pro</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem 
            button 
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={onClose}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(90, 108, 234, 0.1)',
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

// Header auth UI removed per request

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      ...(isDarkMode 
        ? THEME_CONSTANTS.colors 
        : {
          primary: { main: '#3f51b5' },
          secondary: { main: '#9c27b0' },
          success: { main: '#4caf50' },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          }
        }
      ),
    },
    typography: THEME_CONSTANTS.typography,
    shape: THEME_CONSTANTS.shape,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 4px 20px 0 rgba(0,0,0,0.2)' 
              : '0 2px 10px 0 rgba(0,0,0,0.08)'
          }
        }
      }
    }
  }), [isDarkMode]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 5 }}>
          <AppBar 
            position="sticky" 
            color={isDarkMode ? "transparent" : "default"}
            elevation={isDarkMode ? 0 : 1}
            sx={{ 
              borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <CalculateIcon sx={{ color: 'primary.main' }} />
                <Typography 
                  variant="h6" 
                  component={Link} 
                  to="/" 
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'text.primary',
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  SIP Calculator Pro
                </Typography>
              </Box>
              
              {!isMobile && <NavigationTabs />}
              
              <IconButton 
                sx={{ ml: 2 }} 
                onClick={() => setIsDarkMode(!isDarkMode)}
                color="inherit"
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              {/* Optional login/email removed per request */}
            </Toolbar>
            
            {isMobile && <NavigationTabs />}
          </AppBar>

          <MobileDrawer open={drawerOpen} onClose={toggleDrawer} />

          <Container maxWidth="xl" sx={{ mt: 2 }}>
            {/* Ticker removed per request: no TradingView details on Home */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sip" element={<SIPCalculator />} />
              <Route path="/lumpsum" element={<LumpsumCalculator />} />
              <Route path="/swp" element={<SWPCalculator />} />
              <Route path="/goals" element={<GoalCalculator />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Container>
        </Box>
        <Disclaimer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
