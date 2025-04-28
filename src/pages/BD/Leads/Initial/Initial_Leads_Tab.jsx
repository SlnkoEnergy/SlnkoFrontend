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
import Lead_Dead from "../../../../component/Lead Stage/Dead_Lead";
import Lead_FollowUp from "../../../../component/Lead Stage/Follow_Lead";
import Lead_Initial from "../../../../component/Lead Stage/Initial_Lead";
import Lead_Overall from "../../../../component/Lead Stage/Overall_Lead";
import Lead_Warm from "../../../../component/Lead Stage/Warm_Lead";
import Lead_Won from "../../../../component/Lead Stage/Won_Lead";
import Header from "../../../../component/Partials/Header";
import Sidebar from "../../../../component/Partials/Sidebar";

function InitialLeads() {
  const allLeadRef = useRef();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState("OverAll");

  const leadOptions = [
    "OverAll",
    "Initial",
    "Follow Up",
    "Warm",
    "Won",
    "Dead",
  ];

  const handleExportToCSV = () => {
    if (allLeadRef.current?.exportToCSV) {
      allLeadRef.current.exportToCSV();
    }
  };

  const renderLeadComponent = () => {
    switch (selectedLead) {
      case "Warm":
        return <Lead_Warm ref={allLeadRef} />;
      case "Follow Up":
        return <Lead_FollowUp ref={allLeadRef} />;
      case "Won":
        return <Lead_Won ref={allLeadRef} />;
      case "Dead":
        return <Lead_Dead ref={allLeadRef} />;
      case "Initial":
        return <Lead_Initial ref={allLeadRef} />;
      default:
        return <Lead_Overall ref={allLeadRef} />;
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <LeadPage
        navigate={navigate}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        leadOptions={leadOptions}
        renderLeadComponent={renderLeadComponent}
        handleExportToCSV={handleExportToCSV}
      />
    </CssVarsProvider>
  );
}

function LeadPage({
  navigate,
  selectedLead,
  setSelectedLead,
  leadOptions,
  renderLeadComponent,
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
            >
              Business Development
            </Link>
            <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
              Leads
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
            {selectedLead} Leads
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
            {(selectedLead === "Won" ||
              selectedLead === "Follow Up" ||
              selectedLead === "Warm") && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/comm_offer")}
              >
                Commercial Offer
              </Button>
            )}

            <Button
              color="primary"
              size="sm"
              onClick={() => navigate("/dash_task")}
            >
              Task Dashboard
            </Button>

            {selectedLead === "Initial" && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/add_lead")}
              >
                Add New Leads +
              </Button>
            )}

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
            listStyle: "none",
            padding: 0,
            margin: "10px 0",
            gap: 3,
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          {leadOptions.map((item, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                padding: "8px 15px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
                color:
                  mode === "dark"
                    ? selectedLead === item
                      ? "#007bff"
                      : "#86c3ff"
                    : selectedLead === item
                      ? "#007bff"
                      : "black",
                borderRadius: "8px",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "#007bff",
                  color: "white",
                },
                ...(selectedLead === item && {
                  backgroundColor: "#007bff",
                  color: "white",
                }),
              }}
              onClick={() => setSelectedLead(item)}
            >
              {item}
            </Box>
          ))}
        </Box>

        {renderLeadComponent()}
      </Box>
    </Box>
  );
}

export default InitialLeads;
