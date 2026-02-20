import React, { useState } from 'react';
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion } from 'framer-motion';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import ServiceLocator from './ServiceLocator';
import NearestServiceCenter from './NearestServiceCenter';

export default function ServiceCenter() {
  const [mode, setMode] = useState('search');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Find Service Centers
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3 }}>
            Locate authorized service centers near you
          </Typography>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode) => newMode && setMode(newMode)}
            sx={{
              '& .MuiToggleButton-root': {
                color: '#94A3B8',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #00F5D4 0%, #38BDF8 100%)',
                  color: '#0B0F2A',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00D4B8 0%, #2BA3D4 100%)',
                  },
                },
                '&:hover': {
                  background: 'rgba(0, 245, 212, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="search">
              <SearchIcon sx={{ mr: 1 }} />
              Search by Brand
            </ToggleButton>
            <ToggleButton value="nearest">
              <MapIcon sx={{ mr: 1 }} />
              Find Nearest
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            background: 'rgba(26, 31, 58, 0.5)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(0, 245, 212, 0.15)',
            p: 3,
            minHeight: '60vh',
          }}
        >
          {mode === 'search' ? <ServiceLocator /> : <NearestServiceCenter />}
        </Box>
      </motion.div>
    </Container>
  );
}
