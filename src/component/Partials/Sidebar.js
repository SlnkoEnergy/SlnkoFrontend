import React, { useState } from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BrightnessAutoRoundedIcon from '@mui/icons-material/BrightnessAutoRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Main_Logo from '../../assets/protrac_logo.png';
// import Main_Logo2 from '../assets/white_logo.png';
import Project from '../../assets/project-management.png';
import SupplyChain from '../../assets/recycle.png';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from '../../utils/utils';

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = useState(defaultExpanded);
  return (
    <>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </>
  );
}


 function Sidebar() {
 
 const navigate = useNavigate();
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* {ColorSchemeToggle && (<ColorSchemeToggle sx={{ ml: 'auto' }} />)}
  {ColorSchemeToggle ? (
    <IconButton variant="soft" color="primary" size="sm">
      <img src={Main_Logo} alt="Protrac" style={{ width: '70px', height: '60px' }} />
    </IconButton>
  ) : (
    <IconButton variant="soft" color="primary" size="sm">
      <img src={Main_Logo2} alt="Protrac" style={{ width: '70px', height: '60px' }} />
    </IconButton>
  )} */}
        
       <IconButton variant="soft" color="primary" size="sm">
      <img src={Main_Logo} alt="Protrac" style={{ width: '70px', height: '60px' }} />
    </IconButton>
        {/* <Typography level="title-lg">Protrac</Typography> */}

        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem>
            <ListItemButton>
              <HomeRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Dashboard</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          {/*-------- User ------------*/}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  {/* <AssignmentRoundedIcon /> */}
                  <AccountCircleIcon />
                  <ListItemContent>
                    <Typography level="title-sm">User</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate('/User/add-user')}>Add User</ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          {/*---------BD -------------*/}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <AssignmentRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">BD</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate('/BD/initial-leads')}>Leads</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('/BD/commercial-offer')}>Commercial Offer</ListItemButton>
                </ListItem>
                
              </List>
            </Toggler>
          </ListItem>

          {/*---------Accounting -------------*/}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  {/* <AssignmentRoundedIcon /> */}
                  <AccountBalanceIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Accounting</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton  onClick={() => navigate('/project-balance')}>
                    Project Balances
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('/Accounts/paymentRequest')}>Daily Payment Request</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('/Accounts/ProjectApproval')}>Payment Approval</ListItemButton>
                </ListItem>
                  <ListItem>
                  <ListItemButton onClick={() => navigate('/Accounts/ApprovedPayment')}>Approved Payment</ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          {/*--------- SCM -------------*/}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  {/* <AssignmentRoundedIcon /> */}
                  <img src={SupplyChain} alt='' style={{width:'20px', height:'20px'}}/>
                  <ListItemContent>
                    <Typography level="title-sm">SCM</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate('/purchase-order')}>Purchase Order</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('SCM/material-tracker')}>Material Status</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('SCM/vendor-bill')}>Vendor Bill</ListItemButton>
                </ListItem>

              </List>
            </Toggler>
          </ListItem>

       {/*--------- Projects-------------*/}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  {/* <AssignmentRoundedIcon /> */}
                  <img src={Project} alt='' style={{width:'20px', height:'20px'}}/>
                  <ListItemContent>
                    <Typography level="title-sm">Projects</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton onClick={() => navigate('/all-project')}>All Projects</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton onClick={() => navigate('/Projects/site-project')}>Site Projects</ListItemButton>
                </ListItem>
                
              </List>
            </Toggler>
          </ListItem>

          {/* <ListItem>
            <ListItemButton selected>
              <ShoppingCartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">BD</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem> */}

         
          {/* <ListItem>
            <ListItemButton
              role="menuitem"
              component="a"
              href="/joy-ui/getting-started/templates/messages/"
            >
              <QuestionAnswerRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Messages</Typography>
              </ListItemContent>
              <Chip size="sm" color="primary" variant="solid">
                4
              </Chip>
            </ListItemButton>
          </ListItem> */}

          {/* <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <GroupRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Users</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open
                        ? {
                            transform: 'rotate(180deg)',
                          }
                        : {
                            transform: 'none',
                          },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem sx={{ mt: 0.5 }}>
                  <ListItemButton
                    role="menuitem"
                    component="a"
                    href="/joy-ui/getting-started/templates/profile-dashboard/"
                  >
                    My profile
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton>Create a new user</ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton>Roles & permission</ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem> */}

        </List>



        
        <List
          size="sm"
          sx={{
            mt: 'auto',
            flexGrow: 0,
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
            '--List-gap': '8px',
            mb: 2,
          }}
        >
          <ListItem>
            <ListItemButton>
              <SupportRoundedIcon />
              Support
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <SettingsRoundedIcon />
              Settings
            </ListItemButton>
          </ListItem>
        </List>
        <Card
          invertedColors
          variant="soft"
          color="danger"
          orientation="horizontal"
          sx={{
            flexGrow: 0,
            py: 1,
            px: 0,
            gap: 2,
            bgcolor: 'transparent',
          }}
        >
          <Avatar />
          <Stack>
            <Typography fontWeight="lg">Slnko Energy </Typography>
            <Typography level="body-sm">admin@slnko.co</Typography>
          </Stack>
          <IconButton size="sm" variant="plain" color="danger" sx={{ ml: 'auto' }}>
            <LogoutRoundedIcon />
          </IconButton>
        </Card>
      </Box>
    </Sheet>
  );
}
export default Sidebar;