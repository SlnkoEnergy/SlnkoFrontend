import React from 'react';
import { Box, Typography } from '@mui/joy';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimationData from '../assets/dash3.json';

function Dashboard() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      // minHeight="100vh"
      height={"100%"}
      p={2}
    >
      <Box
        sx={{
          width: {
            xs: '100%',
            sm: '400px',
            md: '500px',
            lg: '650px',
          },
          aspectRatio: '1 / 1',
        }}
      >
        <Player
          autoplay
          loop
          src={AnimationData}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Typography
        level="h2"
        sx={{
          mt: 2,
          fontWeight: 'bold',
          fontStyle: 'italic',
          textDecoration: '4px underline #ADD8E6',
          textUnderlineOffset: '5px',
          color: '#9BC4D2',
          textShadow: '2px 2px 10px rgba(173, 216, 230, 0.8)',
          fontSize: {
            xs: '1.5rem',
            sm: '2rem',
            md: '2.5rem',
          },
          textAlign: 'center',
        }}
      >
        Explore More in the Sidebar ...
      </Typography>
    </Box>
  );
}

export default Dashboard;

