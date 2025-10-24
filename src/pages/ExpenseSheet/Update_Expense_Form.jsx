import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";

import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";

import { useNavigate, useSearchParams } from "react-router-dom";
import UpdateExpense from "../../component/Expense Sheet/Expense Form/Update_Expense";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Button, Modal, ModalDialog, Textarea } from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUpdateExpenseStatusOverallMutation } from "../../redux/expenseSlice";

function Edit_Expense() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);
  const [sharedRejectionComment, setSharedRejectionComment] = useState("");
  const [updateStatus] = useUpdateExpenseStatusOverallMutation();
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  // const handleRejectAllSubmit = async () => {
  //   try {
  //     const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;

  //     if (!userID) {
  //       toast.error("User ID not found. Please login again.");
  //       return;
  //     }

  //     const requests = rows.map((row) =>
  //       updateStatus({
  //         _id: row._id,
  //         status: "rejected",
  //         remarks: sharedRejectionComment || "Rejected without comment",
  //       }).unwrap()
  //     );

  //     await Promise.all(requests);
  //     toast.success("All sheets rejected successfully");

  //     const updated = rows.map((row) => {
  //       const newStatus = {
  //         status: "rejected",
  //         remarks: sharedRejectionComment || "Rejected without comment",
  //         user_id: userID,
  //         updatedAt: new Date().toISOString(),
  //       };

  //       const updatedItems = row.items.map((item) => ({
  //         ...item,
  //         item_current_status: newStatus,
  //         remarks: sharedRejectionComment || "Rejected without comment",
  //         item_status_history: [
  //           ...(Array.isArray(item.item_status_history)
  //             ? item.item_status_history
  //             : []),
  //           newStatus,
  //         ],
  //       }));

  //       return {
  //         ...row,
  //         items: updatedItems,
  //         current_status: newStatus,
  //         status_history: [
  //           ...(Array.isArray(row.status_history) ? row.status_history : []),
  //           newStatus,
  //         ],
  //       };
  //     });

  //     setRows(updated);
  //     setShowRejectAllDialog(false);
  //     setSharedRejectionComment("");
  //   } catch (error) {
  //     console.error("Failed to reject all sheets:", error);
  //     toast.error("Failed to reject sheets");
  //   }
  // };

  const handleRejectAll = () => {
    setShowRejectAllDialog(true);
  };

  const handleApproveAll = () => {
    setApproveConfirmOpen(true);
  };

  // const applyApproveAll = async () => {
  //   try {
  //     const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;

  //     if (!userID) {
  //       toast.error("User ID not found. Please login again.");
  //       return;
  //     }

  //     // Send approval requests to backend
  //     const requests = rows.map((row) => {
  //       const approved_items = row.items.map((item) => ({
  //         _id: item._id,
  //         approved_amount: Number(item.invoice?.invoice_amount) || 0,
  //       }));

  //       return updateStatus({
  //         _id: row._id,
  //         approved_items,
  //         remarks: "approved",
  //         status: "manager approval",
  //       }).unwrap();
  //     });

  //     await Promise.all(requests);

  //     // Locally update rows without setting status manually
  //     const updatedRows = rows.map((row) => {
  //       const updatedItems = row.items.map((item) => {
  //         const approvedAmount = Number(item.invoice?.invoice_amount) || 0;

  //         return {
  //           ...item,
  //           approved_amount: String(approvedAmount),
  //         };
  //       });

  //       const total_approved_amount = updatedItems.reduce(
  //         (sum, item) => sum + Number(item.approved_amount),
  //         0
  //       );

  //       return {
  //         ...row,
  //         items: updatedItems,
  //         total_approved_amount: String(total_approved_amount),
  //       };
  //     });

  //     setRows(updatedRows);
  //     setApproveConfirmOpen(false);
  //     toast.success("All items approved successfully");
  //   } catch (error) {
  //     console.error("Failed to approve all items:", error);
  //     toast.error("Failed to approve all items");
  //   }
  // };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="Expense Sheet" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/expense_dashboard`)}
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
              DashBoard
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/expense_approval`)}
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
              Expense Approval
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/expense_hr`)}
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
              HR Expense Approval
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/expense_accounts`)}
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
              Account Expense Approval
            </Button>
          </Box>
        </MainHeader>
        <SubHeader title="Update Expense" isBackEnabled={true} sticky>
          <Box display="flex" gap={2}>
            {(([
              "Engineering",
              "BD",
              "Projects",
              "Infra",
              "Loan",
              "CAM",
              "Accounts",
              "HR",
              "Marketing",
            ].includes(user?.department) &&
              user?.role === "manager") ||
              user?.role === "visitor" ||
              user?.name === "IT Team" ||
              user?.department === "admin") && (
              <>
                <Button
                  color="danger"
                  size="sm"
                  onClick={handleRejectAll}
                  // disabled={rows.every((row) => {
                  //   const status =
                  //     typeof row.current_status === "string"
                  //       ? row.current_status
                  //       : row.current_status?.status;

                  //   return [
                  //     "rejected",
                  //     "hold",
                  //     "hr approval",
                  //     "manager approval",
                  //     "final approval",
                  //   ].includes(status);
                  // })}
                >
                  Reject All
                </Button>

                <Button
                  color="success"
                  size="sm"
                  onClick={handleApproveAll}
                  // disabled={rows.every((row) => {
                  //   const status =
                  //     typeof row.current_status === "string"
                  //       ? row.current_status
                  //       : row.current_status?.status;

                  //   return [
                  //     "rejected",
                  //     "hold",
                  //     "hr approval",
                  //     "manager approval",
                  //     "final approval",
                  //   ].includes(status);
                  // })}
                >
                  Approve All
                </Button>
              </>
            )}
          </Box>
        </SubHeader>
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
          <UpdateExpense 
            showRejectAllDialog = {showRejectAllDialog}
            approveConfirmOpen = {approveConfirmOpen}
          />
        </Box>

        {/* <Modal
          open={showRejectAllDialog}
          onClose={() => setShowRejectAllDialog(false)}
        >
          <ModalDialog sx={{ minWidth: 320 }}>
            <Typography level="h6">Reject All Items</Typography>
            <Typography level="body-sm">
              Provide remarks for rejection:
            </Typography>

            <Textarea
              minRows={2}
              placeholder="Enter rejection remarks..."
              value={sharedRejectionComment}
              onChange={(e) => setSharedRejectionComment(e.target.value)}
              sx={{ mt: 1 }}
            />

            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button
                variant="outlined"
                onClick={() => setShowRejectAllDialog(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button color="danger" onClick={handleRejectAllSubmit} size="sm">
                Reject All
              </Button>
            </Box>
          </ModalDialog>
        </Modal> */}
      </Box>
    </CssVarsProvider>
  );
}
export default Edit_Expense;
