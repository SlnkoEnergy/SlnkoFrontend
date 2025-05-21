import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import { React, useState } from "react";
// import Button from '@mui/joy/Button';
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
// import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import InverterTab from "../../component/Modules/Eng_Inverter";
import TransformerTab from "../../component/Modules/Eng_Transformer";
import LTPanelTab from "../../component/Modules/Eng_LT";
import HTPanelTab from "../../component/Modules/Eng_HT";
import ACCableTab from "../../component/Modules/Eng_AC_Cable";
import BOSTab from "../../component/Modules/Eng_BOS";
import PoolingTab from "../../component/Modules/Eng_Pooling";
import ModuleTab from "../../component/Modules/Eng_Modules";
import DCCableTab from "../../component/Modules/Eng_DC_Cable";

function ModuleSheet() {
  const allEngRef = useRef();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState("Module");

  const moduleOptions = [
    "Module",
    "Inverter",
    "Transformer",
    "LT Panel",
    "HT Panel",
    "AC Cable",
    "DC Cable",
    "BOS Items",
    "Pooling Station",
  ];

  const handleExportToCSV = () => {
    if (allEngRef.current?.exportToCSV) {
      allEngRef.current.exportToCSV();
    }
  };

  const renderModuleComponent = () => {
    switch (selectedModule) {
      case "Inverter":
        return <InverterTab ref={allEngRef} />;
      case "Transformer":
        return <TransformerTab ref={allEngRef} />;
      case "LT Panel":
        return <LTPanelTab ref={allEngRef} />;
      case "HT Panel":
        return <HTPanelTab ref={allEngRef} />;
      case "AC Cable":
        return <ACCableTab ref={allEngRef} />;
        case "DC Cable":
        return <DCCableTab ref={allEngRef} />;
        case "BOS Items":
        return <BOSTab ref={allEngRef} />;
        case "Pooling Station":
        return <PoolingTab ref={allEngRef} />;
      default:
        return <ModuleTab ref={allEngRef} />;
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <LeadPage
        navigate={navigate}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        moduleOptions={moduleOptions}
        renderModuleComponent={renderModuleComponent}
        handleExportToCSV={handleExportToCSV}
      />
    </CssVarsProvider>
  );
}

const getAddNewButtonLabel = (module) => {
  if (module === "Module") return "Add New Module";
  return `Add New ${module}+`;
};

const getAddNewRoute = (module) => {
  switch (module) {
    case "Inverter":
      return "/add_inverter";
    case "Transformer":
      return "/add_transformer";
    case "LT Panel":
      return "/add_lt_panel";
    case "HT Panel":
      return "/add_ht_panel";
    case "AC Cable":
      return "/add_ac_cable";
      case "DC Cable":
      return "/add_dc_cable";
    case "BOS Items":
      return "/add_bos";
    case "Pooling Station":
      return "/add_pooling";
    default:
      return "/add_module";
  }
};


function LeadPage({
  navigate,
  selectedModule,
  setSelectedModule,
  moduleOptions,
  renderModuleComponent,
  handleExportToCSV,
}) {
  const { mode } = useColorScheme();

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
            {/* {selectedLead} Leads */}
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
            {/* {(selectedLead === "Won" ||
              selectedLead === "Follow Up" ||
              selectedLead === "Warm") && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/comm_offer")}
              >
                Commercial Offer
              </Button>
            )} */}

            {/* <Button
              color="primary"
              size="sm"
              onClick={() => navigate("/add_module")}
            >
              Add New Module
            </Button> */}
            <Button
  color="primary"
  size="sm"
  onClick={() => navigate("/add_category")}
>
  {/* {getAddNewButtonLabel(selectedModule)} */}
  Add New Category +
</Button>


            {/* {selectedLead === "Initial" && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/add_lead")}
              >
                Add New Leads +
              </Button>
            )} */}

            <Button
              color="primary"
              startDecorator={<DownloadRoundedIcon />}
              size="sm"
              onClick={handleExportToCSV}
            >
              Export to CSV
            </Button>
          </Box>
        </Box>

        {/* Lead Filter Tabs */}
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: {md:"row", xs:"column"},
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
              // component="li"
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
              onClick={() => setSelectedModule(item)}
            >
              {item}
            </Box>
          ))}
        </Box>

        {renderModuleComponent()}
      </Box>
    </Box>
  );
}

export default ModuleSheet;
