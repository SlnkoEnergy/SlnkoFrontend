// pages/Projects/ViewProjectManagement.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useSearchParams } from "react-router-dom";
import View_Project_Management from "../../component/ViewProjectManagement";
import Filter from "../../component/Partials/Filter";
import { useEffect, useRef, useState } from "react";
import { Save } from "@mui/icons-material";

function ViewProjectManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const ganttRef = useRef(null); // NEW

  useEffect(() => {
    // keep whatever you had for user, etc.
  }, []);

  const selectedView = searchParams.get("view") || "week";

  const fields = [
    {
      key: "view",
      label: "View",
      type: "select",
      options: [
        { label: "Day", value: "day" },
        { label: "Week", value: "week" },
        { label: "Month", value: "month" },
        { label: "Year", value: "year" },
      ],
    },
  ];

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
        <Sidebar />
        <MainHeader title="Projects" sticky />
        <SubHeader title="View Project Schedule" isBackEnabled sticky>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="outlined"
              size="sm"
              startDecorator={<Save />}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
              onClick={() => ganttRef.current?.saveAsTemplate?.()} // NEW
            >
              Save as Template
            </Button>

            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}
              title="Filters"
              onApply={(values) => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  const next = {
                    ...merged,
                    page: "1",
                    ...(values.view && { view: String(values.view) }),
                  };
                  return next;
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.view;
                  return { ...merged, page: "1" };
                });
              }}
            />
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
            px: "16px",
          }}
        >
          {/* pass view + ref */}
          <View_Project_Management ref={ganttRef} viewModeParam={selectedView} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ViewProjectManagement;
