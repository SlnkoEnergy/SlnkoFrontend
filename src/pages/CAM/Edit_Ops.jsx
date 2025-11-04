import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Sidebar from "../../component/Partials/Sidebar";
import OpsHandoverSheetForm from "../../component/Lead Stage/Handover/OpsHandover";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";

function EditOpsHandSheet() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <Sidebar />
        <MainHeader title="Internal Operation" sticky />
        <SubHeader title="Handover" isBackEnabled={true} sticky></SubHeader>
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
            px: "16px",
          }}
        >
          <OpsHandoverSheetForm />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default EditOpsHandSheet;
