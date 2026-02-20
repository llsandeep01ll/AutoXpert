import { useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import DamageViewer from './DamageViewer.jsx'
import NearestServiceCenter from './NearestServiceCenter.jsx'
import { Box, Container, Typography, AppBar, Toolbar, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2979FF',
    },
    secondary: {
      main: '#00E5FF',
    },
    background: {
      default: '#F8FBFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1F36',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '16px',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
})

function App() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)' }}>
        {/* Background Effects */}
        <div className="animated-bg-light" />
        <div className="floating-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>

        {/* Sticky Header */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(41, 121, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(41, 121, 255, 0.08)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #2979FF 0%, #00E5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(41, 121, 255, 0.3)',
              }}
            >
              AUTOXPERT
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={() => scrollToSection('services')}
                sx={{ color: '#4A5568', '&:hover': { color: '#2979FF' } }}
              >
                Services
              </Button>
              <Button 
                onClick={() => scrollToSection('upload')}
                sx={{ color: '#4A5568', '&:hover': { color: '#2979FF' } }}
              >
                Upload
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            pt: { xs: 8, md: 12 },
            pb: { xs: 8, md: 12 },
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '3rem', md: '5rem' },
                  mb: 2,
                  background: 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 50%, #00E5FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '1px',
                  textShadow: '0 0 40px rgba(41, 121, 255, 0.2)',
                }}
              >
                AUTOXPERT
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: '#4A5568',
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  fontWeight: 500,
                  maxWidth: '700px',
                  mx: 'auto',
                }}
              >
                Smart Vehicle Assistance & Instant AI-Powered Analysis
              </Typography>
            </motion.div>
          </Container>
        </Box>

        {/* Location Discovery Section */}
        <Box
          id="services"
          sx={{
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#1A1F36',
                  }}
                >
                  Find Nearby Service Centers
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#4A5568',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  We detect your location and show verified vehicle service centers within a 10km radius.
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#718096',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                  }}
                >
                  Your location is securely accessed through browser geolocation and is never stored.
                </Typography>
              </Box>
              <NearestServiceCenter />
            </motion.div>
          </Container>
        </Box>

        {/* Primary Upload Section */}
        <Box
          id="upload"
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(135deg, rgba(41, 121, 255, 0.03) 0%, rgba(0, 229, 255, 0.03) 100%)',
            position: 'relative',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#1A1F36',
                  }}
                >
                  Upload Your Vehicle Image
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#4A5568',
                    fontSize: '1.1rem',
                    maxWidth: '700px',
                    mx: 'auto',
                  }}
                >
                  Upload your vehicle image and get an instant AI-powered vehicle health report.
                </Typography>
              </Box>
              <DamageViewer />
            </motion.div>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            borderTop: '1px solid rgba(41, 121, 255, 0.1)',
            background: 'rgba(248, 251, 255, 0.5)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#718096',
              fontWeight: 500,
            }}
          >
            AUTOXPERT © 2026 • SANDEEP N V
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
