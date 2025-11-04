import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useExportTasksToCsvMutation } from "../../redux/globalTaskSlice";
import Products_Table from "../../component/Products_Table";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Add } from "@mui/icons-material";

function Products() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const [exportTasksToCsv] = useExportTasksToCsvMutation();

  const handleExport = async (selectedIds) => {
    try {
      if (!selectedIds || selectedIds.length === 0) {
        alert("No tasks selected for export.");
        return;
      }
      const response = await exportTasksToCsv(selectedIds).unwrap();

      const blob = new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export tasks to CSV.");
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
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
          title="Products"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Button
              variant="solid"
              size="sm"
              startDecorator={<Add />}
              onClick={() => navigate("/product_form")}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              Add Product
            </Button>
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
          <Products_Table />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Products;
