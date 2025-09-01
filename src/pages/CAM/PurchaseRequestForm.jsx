import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../component/Forms/Product_Form";
import Purchase_Request_Form from "../../component/Forms/Purchase_Request_Form";

const PurchaseRequestForm = () => {
  const navigate = useNavigate();
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
              marginLeft: {
                xs: "3vw",
                sm: "3vw",
                md: "3vw",
                lg: "22vw",
                xl: "16vw",
              },
              marginTop: {
                xs: "10vh",
                sm: "8vh",
                md: "4vh",
                lg: "2vh",
                xl: "0vh",
              },
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
                onClick={() => navigate("/cam_dash")}
              >
                CAM
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
                onClick={() => navigate("/pr_form")}
              >
                Purchase Request Form
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
            <Purchase_Request_Form />
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  );
};
export default PurchaseRequestForm;
