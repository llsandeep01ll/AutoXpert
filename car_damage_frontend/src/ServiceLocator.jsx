import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { getDistance } from 'geolib'
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
} from '@mui/material'
import { motion } from 'framer-motion'
import SearchIcon from '@mui/icons-material/Search'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import DirectionsIcon from '@mui/icons-material/Directions'

// Fix default marker icons for many bundlers by pointing to CDN assets
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function ServiceLocator({ brand = '', mapOnly = false }) {
  const [userPos, setUserPos] = useState(null) // [lat, lon]
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [brandInput, setBrandInput] = useState(brand || '')
  const [searchBrand, setSearchBrand] = useState(brand || '')
  const mapRef = React.useRef(null)
  const BRAND_SUGGESTIONS = [
    'Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Chevrolet'
  ]

  useEffect(() => {
    // try browser geolocation first
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      (e) => setError('Location permission denied or unavailable')
    )
  }, [])

  useEffect(() => {
    // fetch only when user position and a search brand is provided
    if (!userPos) return
    if (!searchBrand) {
      setPois([])
      return
    }
    const [lat, lon] = userPos
    const fetchPOIs = async () => {
      setLoading(true)
      setError(null)
      try {
        // try a few radii (largest first) and multiple Overpass endpoints with retries
        const radii = [15000, 10000, 5000]
        const endpoints = [
          'https://overpass-api.de/api/interpreter',
          'https://overpass.kumi.systems/api/interpreter',
          'https://overpass.openstreetmap.fr/api/interpreter',
        ]

        // sanitize brand input (remove newlines)
        const safeBrand = String(searchBrand).replace(/[\n\r]/g, ' ').trim()
        const brandFilter = safeBrand ? `["brand"~"${safeBrand}",i]` : ''

        // simple client-side cache to avoid repeated heavy queries
        const cacheKeyBase = `overpass:${lat.toFixed(4)}:${lon.toFixed(4)}:${safeBrand}`
        const cacheTTL = 1000 * 60 * 15 // 15 minutes

        for (const radius of radii) {
          const cacheKey = `${cacheKeyBase}:${radius}`
          try {
            const raw = localStorage.getItem(cacheKey)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Date.now() - parsed.ts < cacheTTL) {
                // cached result valid
                const elements = parsed.elements
                setPois(elements)
                // fit map bounds
                if (mapRef.current && elements.length > 0) {
                  const bounds = L.latLngBounds(elements.map(e => [e.lat, e.lon]))
                  mapRef.current.fitBounds(bounds.pad ? bounds.pad(0.2) : bounds)
                }
                setLoading(false)
                return
              }
            }
          } catch (e) {
            // ignore cache parse errors
            console.warn('cache parse error', e)
          }

          // build the Overpass QL for this radius
          const query = `[out:json][timeout:60];\n(\n  node["shop"="car_repair"]${brandFilter}(around:${radius},${lat},${lon});\n  node["amenity"="car_repair"]${brandFilter}(around:${radius},${lat},${lon});\n  node["office"="car_dealership"]${brandFilter}(around:${radius},${lat},${lon});\n  way["shop"="car_repair"]${brandFilter}(around:${radius},${lat},${lon});\n  relation["shop"="car_repair"]${brandFilter}(around:${radius},${lat},${lon});\n);\nout center;`

          // try each endpoint with a short retry/backoff strategy
          let lastErr = null
          for (const endpoint of endpoints) {
            const maxAttempts = 2
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              try {
                // JS-level timeout/abort to avoid hanging client
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 30000 + attempt * 15000) // increase wait on retry

                const res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain' },
                  body: query,
                  signal: controller.signal,
                })
                clearTimeout(timeoutId)

                if (!res.ok) {
                  lastErr = new Error('Overpass API error: ' + res.status)
                  // try next endpoint/attempt
                  continue
                }

                const json = await res.json()
                const elements = (json.elements || []).map((el) => {
                  const lat = el.lat ?? el.center?.lat
                  const lon = el.lon ?? el.center?.lon
                  return { ...el, lat, lon }
                }).filter(e => e.lat && e.lon)

                // compute distance to userPos
                elements.forEach(e => {
                  e.distance = getDistance({latitude: lat, longitude: lon}, {latitude: e.lat, longitude: e.lon})
                })

                elements.sort((a,b)=> (a.distance||0) - (b.distance||0))
                setPois(elements)

                // cache the result
                try {
                  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), elements }))
                } catch (e) {
                  // ignore storage errors
                }

                // fit map bounds to results
                if (mapRef.current && elements.length > 0) {
                  const bounds = L.latLngBounds(elements.map(e => [e.lat, e.lon]))
                  mapRef.current.fitBounds(bounds.pad ? bounds.pad(0.2) : bounds)
                }

                // success — exit loops
                lastErr = null
                break
              } catch (err) {
                lastErr = err
                // network or abort; wait a bit before retrying
                await new Promise(r => setTimeout(r, 1000 + attempt * 1000))
              }
            }
            if (!lastErr) break // successful endpoint
          }

          // if we got data in setPois, return early
          if ((Array.isArray(pois) && pois.length > 0)) {
            setLoading(false)
            return
          }
          // otherwise try next (smaller) radius
        }

        // If we reach here, no successful response
        throw new Error('Overpass query failed or timed out (504). Try again later or use a server proxy.')
      } catch (err) {
        console.error(err)
        setError(err.message || String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchPOIs()
  }, [userPos, searchBrand])

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity="error"
        sx={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#FCA5A5',
          '& .MuiAlert-icon': {
            color: '#FCA5A5',
          }
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              onClick={() => { setError(null); setSearchBrand(brandInput); }}
              sx={{ color: '#FCA5A5' }}
            >
              Retry
            </Button>
            <Button 
              size="small" 
              onClick={() => setError(null)}
              sx={{ color: '#FCA5A5' }}
            >
              Dismiss
            </Button>
          </Box>
        }
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {error}
        </Typography>
      </Alert>
    </Box>
  )
  
  if (!userPos) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2,
    }}>
      <CircularProgress sx={{ color: '#00F5D4' }} />
      <Typography sx={{ color: '#94A3B8' }}>
        Waiting for location — please allow location access
      </Typography>
    </Box>
  )

  const nearest = pois[0]

  if (mapOnly) {
    return (
      <Box sx={{ 
        height: '70vh', 
        borderRadius: 3, 
        overflow: 'hidden',
        border: '1px solid rgba(0, 245, 212, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 245, 212, 0.1)',
      }}>
        <MapContainer whenCreated={(map) => (mapRef.current = map)} center={userPos} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={userPos}>
            <Popup>Your location</Popup>
          </Marker>
          {pois.map((p, i) => (
            <Marker key={p.id || i} position={[p.lat, p.lon]}>
              <Popup>
                <b>{p.tags?.name || p.tags?.brand || 'Service'}</b><br />
                {p.tags?.addr_street || ''}<br />
                {p.distance ? `${Math.round(p.distance/1000*100)/100} km` : ''}
              </Popup>
            </Marker>
          ))}
          {nearest && (
            <Circle center={[nearest.lat, nearest.lon]} radius={Math.max(nearest.distance || 100, 100)} pathOptions={{ color: 'blue', weight: 1 }} />
          )}
        </MapContainer>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, minHeight: '60vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: { xs: '100%', lg: 420 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search Form */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => { e.preventDefault(); setSearchBrand(brandInput); }}
          sx={{
            p: 3,
            background: 'rgba(26, 31, 58, 0.6)',
            border: '1px solid rgba(0, 245, 212, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#E2E8F0' }}>
            Search Service Centers
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              freeSolo
              options={BRAND_SUGGESTIONS}
              value={brandInput}
              onInputChange={(_, newValue) => setBrandInput(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="e.g. Toyota, Ford, Honda"
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(18, 22, 51, 0.6)',
                      color: '#E2E8F0',
                      '& fieldset': {
                        borderColor: 'rgba(0, 245, 212, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 245, 212, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00F5D4',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#E2E8F0',
                    },
                  }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !brandInput.trim()}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#0B0F2A' }} /> : <SearchIcon />}
              sx={{
                background: 'linear-gradient(135deg, #00F5D4 0%, #38BDF8 100%)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #00D4B8 0%, #2BA3D4 100%)',
                },
                '&:disabled': {
                  background: 'rgba(26, 31, 58, 0.5)',
                  color: '#94A3B8',
                },
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Paper>

        {/* Results List */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            background: 'rgba(26, 31, 58, 0.6)',
            border: '1px solid rgba(0, 245, 212, 0.15)',
            borderRadius: 2,
            maxHeight: { xs: '400px', lg: '600px' },
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(18, 22, 51, 0.6)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 245, 212, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(0, 245, 212, 0.5)',
              },
            },
          }}
        >
          {!searchBrand && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MyLocationIcon sx={{ fontSize: 48, color: 'rgba(0, 245, 212, 0.3)', mb: 2 }} />
              <Typography sx={{ color: '#94A3B8' }}>
                Enter a car brand above to locate official service centers
              </Typography>
            </Box>
          )}
          
          {searchBrand && pois.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: '#94A3B8' }}>
                No results found within search radius
              </Typography>
            </Box>
          )}

          {pois.length > 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#94A3B8' }}>
                  Found {pois.length} result(s)
                </Typography>
                {searchBrand && (
                  <Chip 
                    label={searchBrand} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(0, 245, 212, 0.15)',
                      color: '#00F5D4',
                      fontWeight: 600,
                      border: '1px solid rgba(0, 245, 212, 0.3)',
                    }} 
                  />
                )}
              </Box>
              <List sx={{ p: 0 }}>
                {pois.map((p, i) => (
                  <motion.div
                    key={p.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <ListItem
                      onClick={() => {
                        if (mapRef.current) mapRef.current.setView([p.lat, p.lon], 15)
                      }}
                      sx={{
                        mb: 1,
                        p: 2,
                        background: 'rgba(26, 31, 58, 0.6)',
                        border: '1px solid rgba(0, 245, 212, 0.15)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(0, 245, 212, 0.1)',
                          borderColor: 'rgba(0, 245, 212, 0.4)',
                          transform: 'translateX(8px)',
                        },
                      }}
                    >
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #00F5D4 0%, #38BDF8 100%)',
                        color: '#0B0F2A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        mr: 2,
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(0, 245, 212, 0.4)',
                      }}>
                        {i + 1}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 700, color: '#E2E8F0', mb: 0.5 }}>
                            {p.tags?.name || p.tags?.brand || 'Service Center'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 0.5 }}>
                              {p.tags?.addr_street || ''} {p.tags?.addr_housenumber || ''}
                            </Typography>
                            {p.distance && (
                              <Chip 
                                icon={<DirectionsIcon sx={{ fontSize: 16 }} />}
                                label={`${Math.round(p.distance/1000*100)/100} km`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(0, 245, 212, 0.15)',
                                  color: '#00F5D4',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  border: '1px solid rgba(0, 245, 212, 0.3)',
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Box>

      {/* Map */}
      <Box sx={{ 
        flex: 1, 
        height: { xs: '400px', lg: '600px' },
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(0, 245, 212, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 245, 212, 0.1)',
      }}>
        <MapContainer whenCreated={(map) => (mapRef.current = map)} center={userPos} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={userPos}>
            <Popup>Your location</Popup>
          </Marker>
          {pois.map((p, i) => (
            <Marker key={p.id || i} position={[p.lat, p.lon]}>
              <Popup>
                <b>{p.tags?.name || p.tags?.brand || 'Service'}</b><br />
                {p.tags?.addr_street || ''}<br />
                {p.distance ? `${Math.round(p.distance/1000*100)/100} km` : ''}
              </Popup>
            </Marker>
          ))}
          {nearest && (
            <Circle center={[nearest.lat, nearest.lon]} radius={Math.max(nearest.distance || 100, 100)} pathOptions={{ color: '#00F5D4', weight: 2, fillColor: '#00F5D4', fillOpacity: 0.1 }} />
          )}
        </MapContainer>
      </Box>
    </Box>
  )
}
