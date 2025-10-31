import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import {
  Button,
  Dropdown,
  ListDivider,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import Project_Scope from "../../component/ProjectScope";
import Filter from "../../component/Partials/Filter";
import { useGetAllUserQuery } from "../../redux/globalTaskSlice";
import { useGetProjectDropdownQuery } from "../../redux/projectsSlice";
import { useGetAllMaterialsPOQuery } from "../../redux/productsSlice";
import { useExportScopesMutation } from "../../redux/camsSlice";
import DownloadIcon from "@mui/icons-material/Download";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SelectAllIcon from "@mui/icons-material/SelectAll";

function ProjectScope() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState();
  const [snack, setSnack] = useState({ open: false, msg: "" });
  const navigate = useNavigate();

  const safeMsg = String(snack?.msg ?? "");
  const isError = /^(failed|invalid|error|server)/i.test(safeMsg);
  const [exportScopes] = useExportScopesMutation();

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) return JSON.parse(userData);
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const {
    data: camUsersResp,
    isFetching: camLoading,
    isError: camError,
  } = useGetAllUserQuery({ department: "CAM" });

  const camOptions = useMemo(() => {
    const arr = camUsersResp?.data ?? camUsersResp ?? [];
    return (Array.isArray(arr) ? arr : []).map((u) => ({
      label: u?.name || u?.fullName || u?.email || u?.emp_name || "Unknown",
      value: u?._id || u?.id || u?.emp_id || u?.email || "",
    }));
  }, [camUsersResp]);

  const {
    data: projectResp,
    isFetching: projectLoading,
    isError: projectError,
  } = useGetProjectDropdownQuery();

  const projectOptions = useMemo(() => {
    const arr = projectResp?.data ?? projectResp ?? [];
    return (Array.isArray(arr) ? arr : []).map((p) => ({
      label: p?.code || p?.project_code || p?.name || "Unnamed Project",
      value: p?._id || "",
    }));
  }, [projectResp]);

  const {
    data: materialsPOResp,
    isFetching: materialsPOLoading,
    isError: materialsPOError,
  } = useGetAllMaterialsPOQuery({ page: 1, limit: 100, search: "" });

  const categoryOptions = useMemo(() => {
    const arr = materialsPOResp?.data ?? materialsPOResp ?? [];
    return (Array.isArray(arr) ? arr : []).map((category) => ({
      label: category?.name || "Unnamed Category",
      value: category?._id || "",
    }));
  }, [materialsPOResp]);

  const indianStates = [
    { label: "Andhra Pradesh", value: "andhra pradesh" },
    { label: "Arunachal Pradesh", value: "arunachal pradesh" },
    { label: "Assam", value: "assam" },
    { label: "Bihar", value: "bihar" },
    { label: "Chhattisgarh", value: "chhattisgarh" },
    { label: "Goa", value: "goa" },
    { label: "Gujarat", value: "gujarat" },
    { label: "Haryana", value: "haryana" },
    { label: "Himachal Pradesh", value: "himachal pradesh" },
    { label: "Jharkhand", value: "jharkhand" },
    { label: "Karnataka", value: "karnataka" },
    { label: "Kerala", value: "kerala" },
    { label: "Madhya Pradesh", value: "madhya pradesh" },
    { label: "Maharashtra", value: "maharashtra" },
    { label: "Manipur", value: "manipur" },
    { label: "Meghalaya", value: "meghalaya" },
    { label: "Mizoram", value: "mizoram" },
    { label: "Nagaland", value: "nagaland" },
    { label: "Odisha", value: "odisha" },
    { label: "Punjab", value: "punjab" },
    { label: "Rajasthan", value: "rajasthan" },
    { label: "Sikkim", value: "sikkim" },
    { label: "Tamil Nadu", value: "tamil nadu" },
    { label: "Telangana", value: "telangana" },
    { label: "Tripura", value: "tripura" },
    { label: "Uttar Pradesh", value: "uttar pradesh" },
    { label: "Uttarakhand", value: "uttarakhand" },
    { label: "West Bengal", value: "west bengal" },
    { label: "Andaman and Nicobar Islands", value: "andaman nicobar" },
    { label: "Chandigarh", value: "chandigarh" },
    {
      label: "Dadra and Nagar Haveli and Daman and Diu",
      value: "dadra and nagar haveli and daman and diu",
    },
    { label: "Lakshadweep", value: "lakshadweep" },
    { label: "Delhi", value: "delhi" },
    { label: "Puducherry", value: "puducherry" },
    { label: "Ladakh", value: "ladakh" },
    { label: "Jammu and Kashmir", value: "jammu kashmir" },
    { label: "Nagaland", value: "nagaland" },
  ];

  const fields = [
    {
      key: "project_id",
      label: "Filter By Project",
      type: "select",
      options: projectLoading
        ? [{ label: "Loading…", value: "" }]
        : projectError
        ? [{ label: "Failed to load projects", value: "" }]
        : projectOptions.length
        ? projectOptions
        : [{ label: "No projects found", value: "" }],
    },
    {
      key: "project_status",
      label: "Filter by Project Status",
      type: "select",
      options: [
        { label: "To Be Started", value: "to be started" },
        { label: "Ongoing", value: "ongoing" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on_hold" },
        { label: "Delayed", value: "delayed" },
        { label: "Dead", value: "dead" },
      ],
    },
    {
      key: "state",
      label: "Filter by State",
      type: "select",
      options: indianStates.length
        ? indianStates
        : [{ label: "No states found", value: "" }],
    },
    {
      key: "cam",
      label: "Filter by CAM",
      type: "select",
      options: camLoading
        ? [{ label: "Loading…", value: "" }]
        : camError
        ? [{ label: "Failed to load CAM users", value: "" }]
        : camOptions.length
        ? camOptions
        : [{ label: "No CAM users found", value: "" }],
    },
    {
      key: "category",
      label: "Filter by Category",
      type: "select",
      options: materialsPOLoading
        ? [{ label: "Loading…", value: "" }]
        : materialsPOError
        ? [{ label: "Failed to load categories", value: "" }]
        : categoryOptions.length
        ? categoryOptions
        : [{ label: "No categories found", value: "" }],
    },
    {
      key: "scope",
      label: "Filter by Scope",
      type: "select",
      options: [
        { label: "SLnko", value: "slnko" },
        { label: "Client", value: "client" },
      ],
    },
    {
      key: "po_status",
      label: "Filter by PO Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approval Pending", value: "approval_pending" },
        { label: "Approval Done", value: "approval_done" },
        { label: "PO Created", value: "po_created" },
        { label: "Out for delivery Pending", value: "out_for_delivery" },
        {
          label: "Partially Out for delivery",
          value: "partially_out_for_delivery",
        },
        { label: "Ready to Dispatch", value: "ready_to_dispatch" },
        { label: "Material Ready", value: "material_ready" },
        { label: "Delivered", value: "delivered" },
        { label: "Short Quantity", value: "short_quantity" },
        { label: "Partially Delivered", value: "partially_delivered" },
      ],
    },
    {
      key: "commitment_date",
      label: "Filter by Commitment Date",
      type: "daterange",
    },
    { key: "po_date", label: "Filter by PO Date", type: "daterange" },
    { key: "etd", label: "Filter by ETD Date", type: "daterange" },
    {
      key: "delivered_date",
      label: "Filter by Delivery Date",
      type: "daterange",
    },
  ];

  // Map UI searchParams -> API query keys
  const buildAllExportParams = () => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      type: "all",
      selected: [],
      project_id: params.project_id || "",
      state: params.state || "",
      cam_person: params.cam || "",
      po_status: params.po_status || "",
      item_name: params.category || "",
      scope: params.scope || "",
      delivered_from: params.from || "",
      delivered_to: params.to || "",
      etd_from: params.etdFrom || "",
      etd_to: params.etdTo || "",
      po_date_from: params.poDateFrom || "",
      po_date_to: params.poDateTo || "",
      project_status: params.project_status || "",
      current_commitment_date_from: params.commitment_date_from || "",
      current_commitment_date_to: params.commitment_date_to || "",
    };
  };

  const downloadBlob = (blob, filename = "scopes_export.csv") => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSelected = async () => {
    try {
      if (!selected?.length) {
        alert("No rows selected to export.");
        return;
      }

      const payload = {
        type: "selected",
        selected,
        project_id: "",
        state: "",
        cam_person: "",
        po_status: "",
        item_name: "",
        scope: "",
        etd_from: "",
        etd_to: "",
        delivered_from: "",
        delivered_to: "",
        po_date_from: "",
        po_date_to: "",
        project_status: "",
        current_commitment_date_from: "",
        current_commitment_date_to: "",
      };

      const blob = await exportScopes(payload).unwrap();
      downloadBlob(blob, "scopes_selected_export.csv");
    } catch (err) {
      console.error("Export (selected) failed:", err);
      alert("Failed to export selected scopes.");
    }
  };

  const handleExportAll = async () => {
    try {
      const payload = buildAllExportParams();
      const blob = await exportScopes(payload).unwrap();
      downloadBlob(blob, "scopes_all_export.csv");
    } catch (err) {
      console.error("Export (all) failed:", err);
      alert("Failed to export all scopes.");
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="CAM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/cam_dash`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Handover
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/project_scope`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Project Scope
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/loan`)}
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
              Loan
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/purchase_request`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Purchase Request
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Project Scope"
          isBackEnabled={false}
          sticky
          rightSlot={
            <>
              {selected?.length > 0 && (
                <Dropdown>
                  <MenuButton
                    variant="outlined"
                    size="sm"
                    startDecorator={<DownloadIcon />}
                    sx={{
                      color: "#3366a3",
                      borderColor: "#3366a3",
                      backgroundColor: "transparent",
                      "--Button-hoverBg": "#e0e0e0",
                      "--Button-hoverBorderColor": "#3366a3",
                      "&:hover": { color: "#3366a3" },
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Export
                  </MenuButton>
                  <Menu placement="bottom-end" sx={{ minWidth: 220 }}>
                    <MenuItem
                      onClick={handleExportSelected}
                      disabled={!selected?.length}
                      sx={{ display: "flex", gap: 1, alignItems: "center" }}
                    >
                      <DoneAllIcon fontSize="small" />
                      Selected ({selected?.length || 0})
                    </MenuItem>
                    <ListDivider />
                    <MenuItem
                      onClick={handleExportAll}
                      sx={{ display: "flex", gap: 1, alignItems: "center" }}
                    >
                      <SelectAllIcon fontSize="small" />
                      All (use current filters)
                    </MenuItem>
                  </Menu>
                </Dropdown>
              )}
              <Filter
                open={open}
                onOpenChange={setOpen}
                fields={fields}
                title="Filters"
                onApply={(values) => {
                  setSearchParams((prev) => {
                    const merged = Object.fromEntries(prev.entries());

                    delete merged.from;
                    delete merged.to;
                    delete merged.etdFrom;
                    delete merged.etdTo;
                    delete merged.matchMode;
                    delete merged.state;
                    delete merged.cam;
                    delete merged.project_id;
                    delete merged.category;
                    delete merged.scope;
                    delete merged.po_status;
                    delete merged.poDateFrom;
                    delete merged.poDateTo;
                    delete merged.project_status;
                    delete merged.commitment_date_from;
                    delete merged.commitment_date_to;

                    const next = {
                      ...merged,
                      page: "1",
                      ...(values.cam && { cam: String(values.cam) }),
                      ...(values.project_id && {
                        project_id: String(values.project_id),
                      }),
                      ...(values.state && { state: String(values.state) }),
                      ...(values.category && {
                        category: String(values.category),
                      }),
                      ...(values.scope && { scope: String(values.scope) }),
                      ...(values.po_status && {
                        po_status: String(values.po_status),
                      }),
                      ...(values.project_status && {
                        project_status: String(values.project_status),
                      }),
                    };

                    if (values.matcher) {
                      next.matchMode = values.matcher === "OR" ? "any" : "all";
                    }

                    if (values.delivered_date?.from)
                      next.from = String(values.delivered_date.from);
                    if (values.delivered_date?.to)
                      next.to = String(values.delivered_date.to);

                    if (values.etd?.from)
                      next.etdFrom = String(values.etd.from);
                    if (values.etd?.to) next.etdTo = String(values.etd.to);

                    if (values.po_date?.from)
                      next.poDateFrom = String(values.po_date.from);
                    if (values.po_date?.to)
                      next.poDateTo = String(values.po_date.to);

                    if (values.commitment_date?.from)
                      next.commitment_date_from = String(
                        values.commitment_date.from
                      );
                    if (values.commitment_date?.to)
                      next.commitment_date_to = String(
                        values.commitment_date.to
                      );
                    return next;
                  });
                  setOpen(false);
                }}
                onReset={() => {
                  setSearchParams((prev) => {
                    const merged = Object.fromEntries(prev.entries());
                    delete merged.priorityFilter;
                    delete merged.status;
                    delete merged.department;
                    delete merged.assigned_to;
                    delete merged.createdBy;
                    delete merged.from;
                    delete merged.to;
                    delete merged.etdFrom;
                    delete merged.etdTo;
                    delete merged.matchMode;
                    delete merged.state;
                    delete merged.cam;
                    delete merged.project_id;
                    delete merged.category;
                    delete merged.scope;
                    delete merged.po_status;
                    delete merged.poDateFrom;
                    delete merged.poDateTo;
                    delete merged.commitment_date_from;
                    delete merged.commitment_date_to;

                    return { ...merged, page: "1" };
                  });
                }}
              />
            </>
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
          <Project_Scope selected={selected} setSelected={setSelected} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default ProjectScope;
