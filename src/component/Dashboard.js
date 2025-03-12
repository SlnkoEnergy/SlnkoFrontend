import React from 'react';
import { Box, Typography } from '@mui/joy';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimationData from '../assets/dashboardsz.json';

function Dashboard() {
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
      <Player autoplay loop src={AnimationData} style={{ width: 300, height: 300 }} />
      <Typography sx={{ fontWeight: 'bold', fontSize: '2rem', mt: 2 }}>
        Work IN Progress
      </Typography>
    </Box>
  );
}

export default Dashboard;
