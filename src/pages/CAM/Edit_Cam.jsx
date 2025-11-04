import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Sidebar from "../../component/Partials/Sidebar";
import CamHandoverSheetForm from "../../component/Lead Stage/Handover/CAMHandover";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";

function EditCamHandSheet() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <Sidebar />
        <MainHeader title="Handover" sticky />
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
          <CamHandoverSheetForm />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default EditCamHandSheet;
