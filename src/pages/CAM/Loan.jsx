import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import { Button, ModalClose, Modal, ModalDialog, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import { Add } from "@mui/icons-material";
import AllLoan from "../../component/AllLoan";
import AddLoan from "../../component/Forms/AddLoan";

function Loan() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: "" });
  const navigate = useNavigate();

  const safeMsg = String(snack?.msg ?? "");
  const isError = /^(failed|invalid|error|server)/i.test(safeMsg);
  const [loanModalOpen, setLoanModalOpen] = useState(false);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="CAM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/cam_dash`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Handover
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/project_scope`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Project Scope
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/loan`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Loan
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/purchase_request`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Purchase Request
            </Button>
          </Box>
        </MainHeader>
        <SubHeader
          title="Loan"
          isBackEnabled={false}
          sticky
          rightSlot={
            <>
              <Button
                variant="solid"
                size="sm"
                startDecorator={<Add />}
                onClick={() => setLoanModalOpen(true)}
                sx={{
                  backgroundColor: "#3366a3",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#285680" },
                  height: "8px",
                }}
              >
                Add Loan
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
          <AllLoan selected={selected} setSelected={setSelected} />
        </Box>
      </Box>
      <Modal
        open={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        sx={{ backdropFilter: "blur(2px)" }}
      >
        <ModalDialog
          layout="center"
          size="lg"
          sx={{
            p: 0,
            borderRadius: "md",
            overflow: "hidden",
            bgcolor: "#fff",
            border: "1px solid var(--joy-palette-neutral-200)",
            width: { xs: "95vw", sm: "95vw", md: "60vw" },
            maxHeight: "90vh",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--joy-palette-neutral-200)",
              bgcolor: "background.body",
            }}
          >
            <Typography level="title-lg" fontWeight={700}>
              Create Loan
            </Typography>
            <ModalClose variant="plain" />
          </Box>

          {/* Content: render your AddLoan form */}
          <Box sx={{ p: 2, overflow: "auto" }}>
            {/* Pass prefill info & onClose so the child can close modal after submit */}
            <AddLoan />
          </Box>
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}
export default Loan;
