import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

// import Sidebar from '../../../component/Partials/Sidebar';
import Header from '../../../component/Partials/Header';
import ReferenceList2 from '../../../component/Commercial Offer/comm_update/Comm_Entire';

function Add_Ref() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <Header sx={{ "@media print": { display: "none" } }} />

        {/* <Sidebar /> */}
        <Box
          component="main"
          className="MainContent"
          sx={{
            // px: { xs: 2, md: 6 },
            // pt: {
            //   xs: 'calc(12px + var(--Header-height))',
            //   sm: 'calc(12px + var(--Header-height))',
            //   md: 3,
            // },
            // pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft:{xl:"17%",lg:"20%"},   "@media print": { display: "none" } }}>
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0, marginTop: {md:"4%", lg:"0%"} }}
            >
              {/* <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeRoundedIcon />
              </Link> */}
              <Link
                underline="hover"
                color="neutral"
                href=""
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                BD
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
                Reference List
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box
            sx={{
              display: 'flex',
              mb: 1,
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'start', sm: 'center' },
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
           <ReferenceList2 />
           
          </Box>
          
          
          {/* <OrderTable /> */}
          {/* <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Add_Ref;