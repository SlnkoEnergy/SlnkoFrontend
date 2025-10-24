import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Modal, ModalDialog } from "@mui/joy";
import { useState } from "react";
import Vendor_Detail from "../../component/ViewVendor";
import AddVendor from "../../component/Forms/Add_Vendor";

function ViewVendors() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  const [openAddVendorModal, setOpenAddVendorModal] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null);

  const openEditModal = () => {
    setEditVendorId(id);
    setOpenAddVendorModal(true);
  };

  const closeModal = () => {
    setOpenAddVendorModal(false);
    setEditVendorId(null);
  };

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
          title="Vendor Detail"
          isBackEnabled={true}
          sticky
          rightSlot={
            <>
              <Button
                variant="outlined"
                size="sm"
                onClick={openEditModal}
                sx={{
                  color: "#3366a3",
                  borderColor: "#3366a3",
                  backgroundColor: "transparent",
                  "--Button-hoverBg": "#e0e0e0",
                  "--Button-hoverBorderColor": "#3366a3",
                  "&:hover": { color: "#3366a3" },
                  height: "8px",
                }}
              >
                Edit Detail
              </Button>
            </>
          }
        />

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
          <Vendor_Detail />
        </Box>

        {/* Modal: opens AddVendor; if editVendorId is set, AddVendor runs in edit mode */}
        <Modal open={openAddVendorModal} onClose={closeModal}>
          <ModalDialog
            aria-labelledby="edit-vendor-modal"
            layout="center"
            sx={{ p: 0, maxWidth: 1200, width: "96vw" }}
          >
            <AddVendor
              setOpenAddVendorModal={setOpenAddVendorModal}
              vendorId={editVendorId}
            />
          </ModalDialog>
        </Modal>
      </Box>
    </CssVarsProvider>
  );
}
export default ViewVendors;
