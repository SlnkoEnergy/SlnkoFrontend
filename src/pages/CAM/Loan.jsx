import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import Dash_cam from "../../component/CamDashboard";
import MainHeader from "../../component/Partials/MainHeader";
import {
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import { useUpdateHandoverAssigneeMutation } from "../../redux/camsSlice";
import { useLazyGetAllUserWithPaginationQuery } from "../../redux/globalTaskSlice";
import SearchPickerModal from "../../component/SearchPickerModal";
import { AssignmentIndTwoTone } from "@mui/icons-material";
import AppSnackbar from "../../component/AppSnackbar";
import AllLoan from "../../component/AllLoan";

function Loan() {
  const [user, setUser] = useState(null);
  const [userModel, setUserModel] = useState(false);
  const [confirmAssigneeOpen, setConfirmAssigneeOpen] = useState(false);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [pendingAssignee, setPendingAssignee] = useState(null);
  const [pendingAssigneLabel, setPendingAssigneLabel] = useState("");
  const [selected, setSelected] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: "" });
  const navigate = useNavigate();

  const safeMsg = String(snack?.msg ?? "");
  const isError = /^(failed|invalid|error|server)/i.test(safeMsg);

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
              {selected.length > 0 && (
                <Button
                  size="sm"
                  variant="outlined"
                  sx={{
                    color: "#3366a3",
                    borderColor: "#3366a3",
                    backgroundColor: "transparent",
                    "--Button-hoverBg": "#e0e0e0",
                    "--Button-hoverBorderColor": "#3366a3",
                    "&:hover": { color: "#3366a3" },
                    height: "8px",
                  }}
                  startDecorator={<AssignmentIndTwoTone />}
                  onClick={() => setUserModel(true)}
                >
                  Assign Project
                </Button>
              )}
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
    </CssVarsProvider>
  );
}
export default Loan;
