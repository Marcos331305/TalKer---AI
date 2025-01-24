import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const OfflinePage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        backgroundColor: '#202124',
        padding: 2,
      }}
    >
      {/* Content Container */}
      <Box sx={{ maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* Icon */}
        <Box>
          <WifiOffIcon sx={{ fontSize: 80, color: '#9AA0A6' }} />
        </Box>
        {/* Heading */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h5" gutterBottom color="#9AA0A6" sx={{
            fontWeight: 500
          }}>
            No Internet
          </Typography>
        </Box>

        {/* Instructions */}
        <Typography variant="body1" color="#9AA0A6" sx={{ textAlign: 'left', marginBottom: 1 }} fontSize={'14.25px'}>
          Try:
        </Typography>
        <Box sx={{ paddingLeft: '0px' }}> {/* Align to "Try:" */}
          <Typography
            component="ul"
            sx={{
              color: '#9AA0A6',
              margin: 0,
              listStyleType: 'disc',
              textAlign: 'left',
            }}
          >
            <Typography component="li" sx={{ marginBottom: 1 }} fontSize={'15px'}>
              Checking the network cables, modem, and router
            </Typography>
            <Typography component="li" sx={{ marginBottom: 1 }} fontSize={'15px'}>
              Reconnecting to Wi-Fi
            </Typography>
          </Typography>
        </Box>

        {/* Error Message */}
        <Typography
          variant="body2"
          color="#9AA0A6"
          sx={{ textAlign: 'left', marginTop: 2, marginBottom: 4 }}
          fontSize={'12px'}
        >
          ERR_INTERNET_DISCONNECTED
        </Typography>
      </Box>
    </Box>
  );
};

export default OfflinePage;
