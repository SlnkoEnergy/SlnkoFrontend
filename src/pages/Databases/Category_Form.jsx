import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../../component/Partials/Sidebar";
import { useNavigate } from "react-router-dom";
import CategoryForm from "../../component/Forms/Category_Form";
import SubHeader from "../../component/Partials/SubHeader";
import { Button } from "@mui/joy";
import MainHeader from "../../component/Partials/MainHeader";

const Category_Form = () => {
  const navigate = useNavigate();
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <Sidebar />
        <MainHeader title="My Databases" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/categories`)}
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
              Categories
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/products`)}
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
              Products
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Category Form"
          isBackEnabled={false}
          sticky
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
          <CategoryForm />
        </Box>
      </Box>
    </CssVarsProvider>
  );
};
export default Category_Form;
