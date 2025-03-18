import React from 'react';
import { Box, Typography } from '@mui/joy';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimationData from '../assets/dash3.json';

function Dashboard() {
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
       <Player 
        autoplay 
        loop 
        src={AnimationData}  
    
        style={{
          width:  "650px", 
          height:  "650px" 
        }}
      />
     
        <Typography
          sx={{ 
            fontWeight: 'bold', 
            fontSize: '2rem', 
            fontStyle: 'italic',
            textDecoration: "4px underline #ADD8E6",
            textUnderlineOffset: "5px",
            color: "#9BC4D2",  
            textShadow: "2px 2px 10px rgba(173, 216, 230, 0.8)", 
           
          }}
        
        >
          Explore More in the Sidebar ...
        </Typography>
 
    </Box>
  );
}

export default Dashboard;
