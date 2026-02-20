import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsIcon from '@mui/icons-material/Directions';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import StarIcon from '@mui/icons-material/Star';

function NearestServiceCenter() {
  const [location, setLocation] = useState(null);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [route, setRoute] = useState([]);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findNearest = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          console.log(`Location obtained - Lat: ${lat}, Lon: ${lon}, Accuracy: ${accuracy}m`);
          setLocation([lat, lon]);

          // Use API proxy to avoid CORS issues
          const url = `http://localhost:5000/nearest-centres?lat=${lat}&lon=${lon}`;
          const res = await fetch(url);

          const data = await res.json();
          console.log('Centres received:', data);

          if (!data.centres || data.centres.length === 0) {
            setError("No service centres found nearby");
          }

          setCentres(data.centres || []);
          setLoading(false);
        } catch (err) {
          console.error('Error:', err);
          setError(`Failed to fetch centres: ${err.message}`);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMsg = "Failed to get your location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "Permission denied. Enable location in browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            errorMsg = "Location request timed out.";
            break;
          default:
            errorMsg = err.message;
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const loadCentreInfo = async (centre) => {
    setSelectedCentre(centre);

    // 1. Fetch route via proxy to avoid CORS
    const routeRes = await fetch(
      `http://localhost:5000/route?start_lat=${location[0]}&start_lon=${location[1]}&end_lat=${centre.lat}&end_lon=${centre.lon}`
    );
    const routeData = await routeRes.json();
    setRoute(routeData.polyline || []);

    // 2. Fetch details via proxy to avoid CORS
    const det = await fetch(
      `http://localhost:5000/centre-details?lat=${centre.lat}&lon=${centre.lon}`
    );
    const detData = await det.json();
    setDetails(detData);
  };

  const openDirections = (lat, lon) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${location[0]},${location[1]}&destination=${lat},${lon}&travelmode=driving`,
      "_blank"
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            onClick={findNearest}
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <MyLocationIcon />}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2979FF 0%, #00E5FF 100%)',
              boxShadow: '0 8px 24px rgba(41, 121, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E5FCC 0%, #00B8CC 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(41, 121, 255, 0.5)',
              },
              '&:disabled': {
                background: 'rgba(148, 163, 184, 0.3)',
                color: '#718096',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Finding Centers...' : 'Detect My Location'}
          </Button>
        </Box>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert 
              severity="error"
              sx={{
                mb: 3,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#DC2626',
                '& .MuiAlert-icon': {
                  color: '#DC2626',
                },
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </motion.div>
        )}

        {location && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert 
              severity="success"
              icon={<MyLocationIcon />}
              sx={{
                mb: 3,
                background: 'rgba(41, 121, 255, 0.1)',
                border: '1px solid rgba(41, 121, 255, 0.3)',
                color: '#2979FF',
                '& .MuiAlert-icon': {
                  color: '#2979FF',
                },
              }}
            >
              <Typography variant="body2">
                <strong>Location found:</strong> Latitude: {location[0].toFixed(6)}, Longitude: {location[1].toFixed(6)}
              </Typography>
            </Alert>
          </motion.div>
        )}

        {/* Map */}
        {location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(41, 121, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(41, 121, 255, 0.12)',
              }}
            >
              <MapContainer 
                center={location} 
                zoom={14} 
                scrollWheelZoom={true}
                style={{ width: "100%", height: "500px" }}
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                {/* User marker */}
                <Marker position={location}>
                  <Popup>
                    <div>
                      <strong>Your Location</strong><br />
                      Lat: {location[0].toFixed(6)}<br />
                      Lon: {location[1].toFixed(6)}
                    </div>
                  </Popup>
                </Marker>

                {/* Service centre markers */}
                {centres.map((c, i) => (
                  <Marker key={i} position={[c.lat, c.lon]}>
                    <Popup>
                      <b>{c.name}</b><br />
                      {c.distance_km} km<br />
                      <button
                        onClick={() => loadCentreInfo(c)}
                        style={{ marginTop: "5px", padding: "5px", cursor: "pointer" }}
                      >
                        View Details + Route
                      </button>
                    </Popup>
                  </Marker>
                ))}

                {/* Route polyline */}
                {route.length > 0 && <Polyline positions={route} color="#2979FF" weight={4} />}
              </MapContainer>
            </Paper>
          </motion.div>
        )}

        {/* Details panel */}
        {details && selectedCentre && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(41, 121, 255, 0.2)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(41, 121, 255, 0.12)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1F36', mb: 2 }}>
                {selectedCentre.name}
              </Typography>
              
              <Divider sx={{ mb: 2, borderColor: 'rgba(41, 121, 255, 0.15)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {details.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <MyLocationIcon sx={{ color: '#2979FF', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#4A5568', mb: 0.5 }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1A1F36' }}>
                        {details.address}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {details.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#2979FF', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#4A5568', mb: 0.5 }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1A1F36' }}>
                        {details.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {details.opening_hours && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <AccessTimeIcon sx={{ color: '#2979FF', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#4A5568', mb: 0.5 }}>
                        Opening Hours
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#1A1F36' }}>
                        {details.opening_hours}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {details.website && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LanguageIcon sx={{ color: '#2979FF', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#4A5568', mb: 0.5 }}>
                        Website
                      </Typography>
                      <Typography 
                        variant="body1" 
                        component="a"
                        href={details.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: '#2979FF',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        {details.website}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {details.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 16 }} />}
                      label={`Rating: ${details.rating}`}
                      sx={{
                        bgcolor: 'rgba(255, 193, 7, 0.2)',
                        color: '#ffc107',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Button
                onClick={() => openDirections(selectedCentre.lat, selectedCentre.lon)}
                variant="contained"
                size="large"
                startIcon={<DirectionsIcon />}
                sx={{
                  mt: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #00E5FF 0%, #2979FF 100%)',
                  boxShadow: '0 8px 24px rgba(0, 229, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00B8CC 0%, #1E5FCC 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0, 229, 255, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Open in Google Maps
              </Button>
            </Paper>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
}

export default NearestServiceCenter;