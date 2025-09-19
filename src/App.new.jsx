import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// Import the new calculator components
import LumpsumCalculator from './components/LumpsumCalculator.new';
import SIPCalculator from './components/SIPCalculator.new';
import SWPCalculator from './components/SWPCalculator.new';

// Create theme
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' 
      ? {
          // Dark mode
          primary: {
            main: '#3B82F6',
          },
          secondary: {
            main: '#10B981',
          },
          background: {
            default: '#111827',
            paper: '#1F2937',
          },
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
          },
        } 
      : {
          // Light mode
          primary: {
            main: '#3B82F6',
          },
          secondary: {
            main: '#10B981',
          },
          background: {
            default: '#F3F4F6',
            paper: '#FFFFFF',
          },
        })
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// HomePage Component
const HomePage = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        py: 5
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 3 }}>
        Investment Calculator Suite
      </Typography>
      
      <Typography variant="h5" sx={{ mb: 6, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
        Plan your financial future with our comprehensive calculator tools
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%', maxWidth: 1000 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            p: 4, 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 8
            }
          }}
        >
          <CalculateIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>SIP Calculator</Typography>
          <Typography sx={{ mb: 3, color: 'text.secondary', flex: 1 }}>
            Calculate the future value of your Systematic Investment Plan (SIP) and visualize your wealth growth.
          </Typography>
          <Button 
            component={Link} 
            to="/sip-calculator" 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ width: '100%' }}
          >
            Open SIP Calculator
          </Button>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            p: 4, 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 8
            }
          }}
        >
          <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Lumpsum Calculator</Typography>
          <Typography sx={{ mb: 3, color: 'text.secondary', flex: 1 }}>
            See how your one-time investment can grow over time with our lumpsum investment calculator.
          </Typography>
          <Button 
            component={Link} 
            to="/lumpsum-calculator" 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ width: '100%' }}
          >
            Open Lumpsum Calculator
          </Button>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            p: 4, 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 8
            }
          }}
        >
          <CompareArrowsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>SWP Calculator</Typography>
          <Typography sx={{ mb: 3, color: 'text.secondary', flex: 1 }}>
            Plan your systematic withdrawals with our SWP calculator to ensure sustainable retirement income.
          </Typography>
          <Button 
            component={Link} 
            to="/swp-calculator" 
            variant="contained" 
            color="primary" 
            size="large" 
            sx={{ width: '100%' }}
          >
            Open SWP Calculator
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

function App() {
  const [mode, setMode] = useState('dark');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  
  const theme = getTheme(mode);
  
  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'dark' ? 'light' : 'dark');
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const drawerWidth = 240;
  
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'SIP Calculator', icon: <CalculateIcon />, path: '/sip-calculator' },
    { text: 'Lumpsum Calculator', icon: <AttachMoneyIcon />, path: '/lumpsum-calculator' },
    { text: 'SWP Calculator', icon: <CompareArrowsIcon />, path: '/swp-calculator' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="sticky" color="default" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <CalculateIcon sx={{ mr: 1 }} />
                  Investment Calculators
                </Link>
              </Typography>
              
              {!isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {menuItems.map((item) => (
                    <Button 
                      key={item.text}
                      component={Link}
                      to={item.path}
                      color="inherit"
                      sx={{ mx: 1 }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}
              
              <IconButton color="inherit" onClick={toggleTheme}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          
          {/* Drawer for mobile */}
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              width: isMobile ? drawerWidth : 0,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto', mt: 2 }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem 
                    button 
                    key={item.text} 
                    component={Link} 
                    to={item.path}
                    onClick={toggleDrawer}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem button onClick={toggleTheme}>
                  <ListItemIcon>
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </ListItemIcon>
                  <ListItemText primary={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
                </ListItem>
              </List>
            </Box>
          </Drawer>
          
          <Container maxWidth="xl" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sip-calculator" element={<SIPCalculator />} />
              <Route path="/lumpsum-calculator" element={<LumpsumCalculator />} />
              <Route path="/swp-calculator" element={<SWPCalculator />} />
            </Routes>
          </Container>
          
          <Box component="footer" sx={{ 
            py: 3, 
            mt: 'auto', 
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Investment Calculator Suite | All calculations are for illustration purposes only
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;