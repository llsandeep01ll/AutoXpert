import { useState } from "react";
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  Typography,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ImageIcon from '@mui/icons-material/Image';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

function DamageViewer() {
  const [imgURL, setImgURL] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copyMessage, setCopyMessage] = useState(false);

  // *** COLOR PALETTE FOR INDEX-COLORED BOXES ***
  const COLORS = ["#2979FF","#00E5FF","#7C4DFF","#FF6B9D","#FFA726","#66BB6A"];

  const uploadForPrediction = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setImgURL(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to process image');
      }

      const data = await res.json();
      console.log("predict response:", data);
      setBoxes(data.predictions);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onImageLoad = (e) => {
    setImageSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  const handleClearImage = () => {
    setImgURL(null);
    setBoxes([]);
    setError(null);
  };

  const navigateToChatbot = () => {
    window.open('https://partyrock.aws/u/suhas5324/LwT17c71g/DamageDollar', '_blank');
  };

  const generateDamageSummary = () => {
    if (boxes.length === 0) return '';
    
    const damageDescriptions = boxes.map((b, idx) => {
      const part = b.part || b.cls || 'Unknown Part';
      const damageType = b.damage_type || 'Unknown Type';
      const severity = b.severity || 'Unknown Severity';
      return `${idx + 1}. ${part} - ${damageType} (${severity})`;
    }).join('; ');
    
    return `Vehicle Damage Assessment Report: The vehicle has sustained ${boxes.length} damage(s). ${damageDescriptions}. Please review the detailed damage information for repair cost estimation and recommendations.`;
  };

  const handleCopySummary = () => {
    const summary = generateDamageSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopyMessage(true);
    }).catch(() => {
      console.error('Failed to copy');
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {/* Upload Section */}
          <AnimatePresence mode="wait">
            {!imgURL ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: 900 }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 6, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '2px dashed rgba(41, 121, 255, 0.3)',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(41, 121, 255, 0.12)',
                    '&:hover': {
                      borderColor: 'rgba(41, 121, 255, 0.6)',
                      background: 'rgba(41, 121, 255, 0.03)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(41, 121, 255, 0.18)',
                    }
                  }}
                  component="label"
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(41, 121, 255, 0.15) 0%, rgba(0, 229, 255, 0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      boxShadow: '0 8px 24px rgba(41, 121, 255, 0.2)',
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, color: '#2979FF' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#1A1F36',
                      mb: 1,
                    }}
                  >
                    Upload your image here and get smart vehicle assistance
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4A5568', mb: 3, textAlign: 'center' }}>
                    Supports JPG, PNG, JPEG
                  </Typography>
                  <Button
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      background: 'linear-gradient(135deg, #2979FF 0%, #00E5FF 100%)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 24px rgba(41, 121, 255, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1E5FCC 0%, #00B8CC 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(41, 121, 255, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Analyze
                  </Button>
                  <VisuallyHiddenInput type="file" onChange={uploadForPrediction} accept="image/*" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip label="JPG" size="small" sx={{ bgcolor: 'rgba(41, 121, 255, 0.1)', color: '#4A5568', border: '1px solid rgba(41, 121, 255, 0.2)' }} />
                    <Chip label="PNG" size="small" sx={{ bgcolor: 'rgba(41, 121, 255, 0.1)', color: '#4A5568', border: '1px solid rgba(41, 121, 255, 0.2)' }} />
                    <Chip label="JPEG" size="small" sx={{ bgcolor: 'rgba(41, 121, 255, 0.1)', color: '#4A5568', border: '1px solid rgba(41, 121, 255, 0.2)' }} />
                  </Box>
                </Paper>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: 900 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(41, 121, 255, 0.15)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(41, 121, 255, 0.12)',
                  }}
                >
                  <Box sx={{ position: 'relative', width: '100%', mb: 3 }}>
                    <IconButton
                      onClick={handleClearImage}
                      sx={{ 
                        position: 'absolute', 
                        top: -16, 
                        right: -16, 
                        zIndex: 10,
                        background: 'linear-gradient(135deg, #2979FF 0%, #00E5FF 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(41, 121, 255, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1E5FCC 0%, #00B8CC 100%)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>

                    <Box sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}>
                      <img
                        id="damageImage"
                        src={imgURL}
                        alt="uploaded car"
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          display: 'block',
                        }}
                        onLoad={onImageLoad}
                      />

                      {boxes.map((b, idx) => {
                        const scale = 900 / imageSize.width;
                        const scaledX1 = b.x1 * scale;
                        const scaledY1 = b.y1 * scale;
                        const scaledWidth = (b.x2 - b.x1) * scale;
                        const scaledHeight = (b.y2 - b.y1) * scale;

                        return (
                          <Box
                            key={idx}
                            sx={{
                              position: 'absolute',
                              left: scaledX1,
                              top: scaledY1,
                              width: scaledWidth,
                              height: scaledHeight,
                              border: `3px solid ${COLORS[idx % COLORS.length]}`,
                              borderRadius: '6px',
                              pointerEvents: 'none',
                              boxShadow: `0 0 20px ${COLORS[idx % COLORS.length]}80`,
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -32,
                                left: 0,
                                background: COLORS[idx % COLORS.length],
                                color: '#fff',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              }}
                            >
                              #{idx + 1}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {boxes.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid rgba(41, 121, 255, 0.15)',
                      }}>
                        <WarningAmberIcon sx={{ color: '#2979FF', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1F36' }}>
                          Vehicle Analysis Report
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 2 
                      }}>
                        {boxes.map((b, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                background: 'rgba(248, 251, 255, 0.8)',
                                border: `1px solid ${COLORS[idx % COLORS.length]}40`,
                                borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(8px)',
                                  background: 'rgba(248, 251, 255, 1)',
                                  boxShadow: `0 4px 20px ${COLORS[idx % COLORS.length]}40`,
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                <Box sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  borderRadius: '50%', 
                                  background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]} 0%, ${COLORS[idx % COLORS.length]}CC 100%)`,
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  boxShadow: `0 4px 12px ${COLORS[idx % COLORS.length]}60`,
                                }}>
                                  {idx + 1}
                                </Box>
                                <Typography sx={{ 
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: '#1A1F36',
                                }}>
                                  {b.part || b.cls}
                                </Typography>
                              </Box>
                              <Box sx={{ pl: 5 }}>
                                <Box sx={{ 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  mb: 1,
                                  py: 0.5,
                                }}>
                                  <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                    Type:
                                  </Typography>
                                  <Chip 
                                    label={b.damage_type} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: 'rgba(41, 121, 255, 0.15)',
                                      color: '#2979FF',
                                      fontWeight: 600,
                                      border: '1px solid rgba(41, 121, 255, 0.3)',
                                    }}
                                  />
                                </Box>
                                <Box sx={{ 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.5,
                                }}>
                                  <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                    Severity:
                                  </Typography>
                                  <Chip 
                                    label={b.severity} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: b.severity === 'severe' ? 'rgba(211, 47, 47, 0.2)' : 
                                               b.severity === 'moderate' ? 'rgba(237, 108, 2, 0.2)' : 
                                               'rgba(46, 125, 50, 0.2)',
                                      color: b.severity === 'severe' ? '#ff5252' : 
                                             b.severity === 'moderate' ? '#ffa726' : '#66bb6a',
                                      fontWeight: 700,
                                      border: `1px solid ${
                                        b.severity === 'severe' ? '#ff5252' : 
                                        b.severity === 'moderate' ? '#ffa726' : '#66bb6a'
                                      }`,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Paper>
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {boxes.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Paper 
                        elevation={0}
                        sx={{
                          p: 3,
                          background: 'rgba(41, 121, 255, 0.05)',
                          borderRadius: 3,
                          border: '1px solid rgba(41, 121, 255, 0.2)',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1F36' }}>
                            Damage Summary
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopySummary}
                            sx={{
                              textTransform: 'none',
                              color: '#2979FF',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: 'rgba(41, 121, 255, 0.1)',
                              }
                            }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{
                            lineHeight: 1.8,
                            color: '#4A5568',
                            textAlign: 'justify',
                            p: 2,
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            border: '1px solid rgba(41, 121, 255, 0.1)',
                          }}
                        >
                          {generateDamageSummary()}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ width: '100%', maxWidth: 900 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(41, 121, 255, 0.15)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(41, 121, 255, 0.12)',
                }}
              >
                <CircularProgress 
                  size={60} 
                  sx={{ 
                    color: '#2979FF',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }} 
                />
                <Typography variant="h6" sx={{ color: '#1A1F36', fontWeight: 600 }}>
                  Analyzing Vehicle Damage...
                </Typography>
                <Typography variant="body2" sx={{ color: '#4A5568' }}>
                  Our AI is processing your image
                </Typography>
              </Paper>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', maxWidth: 900 }}
            >
              <Alert 
                severity="error"
                sx={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#DC2626',
                  '& .MuiAlert-icon': {
                    color: '#DC2626',
                  }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Error: {error}
                </Typography>
              </Alert>
            </motion.div>
          )}

          {imgURL && boxes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                onClick={navigateToChatbot}
                sx={{ 
                  mt: 2,
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
                Chat with Repair Assistant
              </Button>
            </motion.div>
          )}

        </Box>

        <Snackbar
          open={copyMessage}
          autoHideDuration={3000}
          onClose={() => setCopyMessage(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setCopyMessage(false)} severity="success" sx={{ width: '100%' }}>
            Summary copied to clipboard!
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
}

export default DamageViewer;
