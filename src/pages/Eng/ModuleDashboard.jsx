import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import React, { useState } from "react";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import { useGetAllMaterialCategoryQuery } from "../../redux/Eng/masterSheet";
import Material_Category_Tab from "../../component/Modules/Material_Category";
import { IconButton } from "@mui/joy";
import { ChevronLeftIcon } from "lucide-react";

function ModuleSheet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const [selectedModule, setSelectedModule] = useState(() => searchParams.get("module") || "Module");
  const { data, isLoading } = useGetAllMaterialCategoryQuery();
  const categoryData = data?.data || [];

 const filteredCategories = categoryData.filter(
  (category) => category.name === "Module" || category.name === "Inverter"
);

const moduleOptions = filteredCategories.map((category) => category.name);

const selectedModuleData =
  filteredCategories.find((category) => category.name === selectedModule) || {};


  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <LeadPage
        navigate={navigate}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        moduleOptions={moduleOptions}
        selectedModuleData={selectedModuleData}
        categoryData={categoryData}
      />
    </CssVarsProvider>
  );
}

function LeadPage({
  navigate,
  selectedModule,
  setSelectedModule,
  moduleOptions,
  selectedModuleData,
  categoryData,
}) {
  const { mode } = useColorScheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = (item) => {
    setSelectedModule(item);
    searchParams.set("module", item);
    setSearchParams(searchParams);
  };
  


  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
        }}
      >

        
        {/* Breadcrumb Navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          <Breadcrumbs
            size="sm"
            aria-label="breadcrumbs"
            separator={<ChevronRightRoundedIcon fontSize="sm" />}
            sx={{ pl: 0, marginTop: { md: "4%", lg: "0%" } }}
          >
            <Link
              underline="none"
              color="neutral"
              sx={{ fontSize: 12, fontWeight: 500 }}
              onClick={() => navigate("/eng_dash")}
            >
              Engineering Dashboard
            </Link>
            <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
              Module Sheet
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
           
          <Typography level="h2" component="h1">
            Engineering
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              justifyContent: "center",
            }}
          >
            <Button
              color="primary"
              size="sm"
              onClick={() => navigate("/add_material_category")}
            >
              Add Material Category
            </Button>

            <Button
              color="primary"
              size="sm"
              onClick={() => {
                const selectedObj = categoryData.find(
                  (cat) => cat.name === selectedModule
                );
                if (selectedObj?._id) {
                  navigate(
                    `/add_material?item=${selectedObj.name}&_id=${selectedObj._id}`
                  );
                }
              }}
            >
              {`Add ${selectedModule}`}
            </Button>
          </Box>
        </Box>

        {/* Lead Filter Tabs */}
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: { md: "row", xs: "column" },
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 0,
            margin: "10px 0",
            gap: 3,
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          {moduleOptions.map((item, index) => (
            <Box
              key={index}
              sx={{
                padding: "8px 15px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
                color:
                  mode === "dark"
                    ? selectedModule === item
                      ? "#007bff"
                      : "#86c3ff"
                    : selectedModule === item
                    ? "#007bff"
                    : "black",
                borderRadius: "8px",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "#007bff",
                  color: "white",
                },
                ...(selectedModule === item && {
                  backgroundColor: "#007bff",
                  color: "white",
                }),
              }}
              onClick={() => handleClick(item)}
            >
              {item}
            </Box>
          ))}
        </Box>

        <Material_Category_Tab
          selectedModuleData={selectedModuleData}
          id={selectedModuleData._id}
        />
      </Box>
    </Box>
  );
}

export default ModuleSheet;
