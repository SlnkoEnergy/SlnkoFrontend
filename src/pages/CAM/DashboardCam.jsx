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

function Dashboard() {
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

  const onPickUser = (row) => {
    if (!row) return;
    setUserModel(false);
    const userId = row._id;

    setPendingAssignee(userId);
    setPendingAssigneLabel(`${row.name}  ${row.emp_id}`);
    setConfirmAssigneeOpen(true);
  };

  const handleConfirmAssign = async () => {
    try {
      setConfirmSubmitting(true);
      await handleAssingTo({ assignee: pendingAssignee, selected });
      setConfirmAssigneeOpen(false);
    } catch (e) {
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const handleCancelAssign = () => {
    if (confirmSubmitting) return;
    setConfirmAssigneeOpen(false);
  };

  const userColumns = [
    { key: "name", label: "Name", width: 240 },
    { key: "emp_id", label: "Employee Code", width: 420 },
  ];

  const [triggerUserSearch] = useLazyGetAllUserWithPaginationQuery();

  const fetchUserPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const res = await triggerUserSearch(
      {
        search,
        page,
        limit: pageSize,
        pr: "true",
      },
      true
    );

    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const [updateHandoverAssignee, { isLoading: assigning }] =
    useUpdateHandoverAssigneeMutation();

  const handleAssingTo = async ({ assignee, selected }) => {
    try {
      if (!assignee) throw new Error("No assignee selected.");
      if (!selected || selected.length === 0)
        throw new Error("No rows selected to assign.");
      const ids = selected.map((r) =>
        typeof r === "string" ? r : r.id || r._id
      );

      const res = await updateHandoverAssignee({
        selected: ids,
        assignee,
      }).unwrap();
      setSnack({ open: true, msg: "Project Assigned Successfully" });
    } catch (error) {
      setSnack({ open: true, msg: "Failed to Assign Project" });
    }
  };

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
          title="Handover"
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
          <Dash_cam selected={selected} setSelected={setSelected} />
        </Box>
      </Box>

      <SearchPickerModal
        open={userModel}
        onClose={() => setUserModel(false)}
        onPick={onPickUser}
        title="Select User"
        columns={userColumns}
        fetchPage={fetchUserPage}
        searchKey="name emp_id"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      <Modal
        open={confirmAssigneeOpen}
        onClose={handleCancelAssign}
        keepMounted
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(1px)",
              bgcolor: "rgba(0, 0, 0, 0.08)",
            },
          },
        }}
      >
        <ModalDialog variant="outlined" sx={{ minWidth: 600 }}>
          <DialogTitle>Confirm Assignment</DialogTitle>
          <DialogContent>
            Are you sure you want to assign to{" "}
            <b>{pendingAssigneLabel || "Selected User"}</b>
          </DialogContent>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
              mt: 1.5,
            }}
          >
            <Button
              variant="plain"
              onClick={handleCancelAssign}
              disabled={confirmSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleConfirmAssign}
              loading={confirmSubmitting}
            >
              Submit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      <AppSnackbar
        color={isError ? "danger" : "success"}
        open={!!snack.open}
        message={safeMsg}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </CssVarsProvider>
  );
}
export default Dashboard;
