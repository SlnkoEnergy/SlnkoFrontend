import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../../component/Partials/Sidebar";
import AllVendors from "../../component/AllVendors";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, Modal, ModalDialog } from "@mui/joy";
import { Add } from "@mui/icons-material";
import AddVendor from "../../component/Forms/Add_Vendor";
import { useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

function Vendors() {
  const navigate = useNavigate();
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false);
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/purchase-order`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Purchase Order
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/logistics`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Logistics
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/vendors`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Vendors
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/vendor_bill`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Vendor Bills
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Vendors"
          isBackEnabled={false}
          sticky
          rightSlot={
            <>
              <Button
                variant="solid"
                size="sm"
                startDecorator={<Add />}
                onClick={() => setOpenAddTaskModal(true)}
                sx={{
                  backgroundColor: "#3366a3",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#285680" },
                  height: "8px",
                }}
              >
                Add Vendor
              </Button>
            </>
          }
        ></SubHeader>
        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            p: "16px",
            px: "24px",
          }}
        >
          <AllVendors />
        </Box>
      </Box>

      <Modal
        open={openAddTaskModal}
        onClose={() => setOpenAddTaskModal(false)}
        slotProps={{
          backdrop: {
            sx: {},
          },
        }}
      >
        <ModalDialog
          variant="outlined"
          sx={{
            p: 0,
            borderRadius: "md",
            boxShadow: "lg",
            overflow: "hidden",
            width: "auto",
            height: "auto",
            maxWidth: "unset",
            maxHeight: "unset",
            backgroundColor: "background.surface",
            backdropFilter: "none",
          }}
        >
          <Box
            sx={{
              width: { xs: "95vw", sm: '100%' },
              maxHeight: "85vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <IconButton
              variant="plain"
              color="neutral"
              onClick={() => setOpenAddTaskModal(false)}
              sx={{
                position: "sticky",
                top: 8,
                left: "calc(100% - 40px)",
                zIndex: 2,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
            <AddVendor />
          </Box>
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}
export default Vendors;
