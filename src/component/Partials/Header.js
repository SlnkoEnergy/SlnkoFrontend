import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from "@mui/joy/Box";
import ColorSchemeToggle from "./ColorSchemeToggle";
import { toggleSidebar } from '../../utils/utils';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation()
  const isSalesPage = location.pathname === "/sales";

  return (
    <Sheet
      sx={{
        display: { xs: 'flex', lg: isSalesPage?"flex":"none" },
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        width: '100vw',
        height: isSalesPage ? '3vh' : 'var(--Header-height)',
        zIndex: 9995,
        p: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'background.level1',
        boxShadow: 'sm',
         "@media print": { display: "none!important" }
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Header-height': '52px',
            [theme.breakpoints.up('md')]: {
              '--Header-height': '52px',
            },
          },
        })}
      />
      <IconButton
        onClick={() => toggleSidebar()}
        variant="outlined"
        color="neutral"
        size="sm"
        sx={{
           "@media print": { display: "none!important" },
           display: { sm: "flex", lg:isSalesPage ? "flex":"none" },
        }}
      >
        <MenuIcon />
      </IconButton>
     {!isSalesPage && (
       <Box sx={{ display: {md:"flex", lg:"none"},  gap: 1, alignItems: "center" }}>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>
     )}
    </Sheet>
  );
}
export default Header;