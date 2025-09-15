import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";

import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";

import CamHandoverSheetForm from "../../component/Lead Stage/Handover/CAMHandover";

function EditCamHandSheet() {
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <Header />
        <Sidebar />
        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100dvh",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginLeft: { xl: "17%", lg: "20%" },
            }}
          >
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0, marginTop: { md: "4%", lg: "0%" } }}
            >
              <Link
                underline="hover"
                color="neutral"
                href=""
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Handover Approval
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Update HandOver Sheet
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box
            sx={{
              display: "flex",
              mb: 1,
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <CamHandoverSheetForm />
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default EditCamHandSheet;
