import  { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Checkbox,
  Sheet,
  Table,
  IconButton,
  Divider,
  Chip,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Add from "@mui/icons-material/Add";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Send from "@mui/icons-material/Send";
import { useSearchParams } from "react-router-dom";
import {
  useGetProjectByIdQuery,
  useGetProjectSearchDropdownQuery,
  useLazyGetProjectSearchDropdownQuery,
} from "../../redux/projectsSlice";
import {
  useGetPurchaseRequestByIdQuery,
  useCreatePurchaseRequestMutation,
  useEditPurchaseRequestMutation,
} from "../../redux/camsSlice";
import SearchPickerModal from "../SearchPickerModal";

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  product: "",
  make: "",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  note: "",
});

// Helper to stringify site_address variants safely
const siteAddressToString = (site_address) => {
  if (!site_address) return "";
  if (typeof site_address === "string") return site_address;
  if (typeof site_address === "object") {
    const parts = [
      site_address.village_name,
      site_address.district_name
    ]
      .filter(Boolean)
      .join(", ");
    return parts || "";
  }
  return "";
};

export default function Purchase_Request_Form() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "create").toLowerCase(); 
  const projectId = searchParams.get("projectId") || "";
  const prId = searchParams.get("id") || "";

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  // Top-level form state
  const [projectCode, setProjectCode] = useState(""); 
  const [orderDeadline, setOrderDeadline] = useState("");
  const [projectLocation, setProjectLocation] = useState(""); 
  const [projectName, setProjectName] = useState("");
  const [askConfirmation, setAskConfirmation] = useState(false); 
  const [deliverTo, setDeliverTo] = useState("");
  const [terms, setTerms] = useState("");

  // PR meta
  const [prCode, setPrCode] = useState(""); 
  const [submitting, setSubmitting] = useState(false);

  // Lines
  const [lines, setLines] = useState([EMPTY_LINE()]);

  const [vendors, setVendors] = useState([]);
  const [deliverToOptions, setDeliverToOptions] = useState([]);
  const [catalog, setCatalog] = useState([]); 


  useEffect(() => {
    const vendorsData = [
      { id: "v1", name: "Siddharth Singh" },
      { id: "v2", name: "Acme Supplies" },
      { id: "v3", name: "Universal Traders" },
    ];
    const deliverData = [
      { id: "r1", name: "SInkoEnergy: Receipts" },
      { id: "r2", name: "Main Warehouse" },
      { id: "r3", name: "Site Store" },
    ];
    const catalogData = [
      { id: "p1", label: "[EXP_GEN] Expenses" },
      { id: "p2", label: "Cables 2.5mm" },
      { id: "p3", label: "Solar Module 540Wp" },
      { id: "p4", label: "Inverter 100kW" },
    ];
    setVendors(vendorsData);
    setDeliverToOptions(deliverData);
    setCatalog(catalogData);
  }, []);

  useEffect(() => {
    if (isCreate && projectId && !projectCode) {
      setProjectCode(projectId); // optional seed
    }
  }, [isCreate, projectId, projectCode]);

  const [projectSearch, setProjectSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 7;

  const { data: getProjectSearchDropdown, isFetching: projLoading } =
    useGetProjectSearchDropdownQuery(
      { search: projectSearch, page, limit },
      { skip: !isCreate } 
    );
  
  const shouldFetchProject =
  isCreate && Boolean(projectId); 
  const id = projectId;
  
  console.log({id})

const { data: getProjectById, isFetching: projectLoading } =
  useGetProjectByIdQuery(id, { skip: !shouldFetchProject });

  const hydratedFromProjectIdRef = useRef(false);

useEffect(() => {
  if (!shouldFetchProject) return;
  if (projectLoading) return;

  // Accept either {data: {...}} or raw {...}, or even an array
  const payload = getProjectById?.data ?? getProjectById;
  if (!payload) return;

  const p = Array.isArray(payload) ? payload[0] : payload;
  if (!p) return;

  // Don't overwrite if we already hydrated once (or user typed)
  if (hydratedFromProjectIdRef.current) return;

  // Expecting fields: p.code, p.name, p.site_address
  setProjectCode(p.code || "");
  setProjectName(p.name || "");
  setProjectLocation(siteAddressToString(p.site_address));

  hydratedFromProjectIdRef.current = true;
}, [shouldFetchProject, projectLoading, getProjectById]);

  const projectRows = getProjectSearchDropdown?.data || [];
  const pagination = getProjectSearchDropdown?.pagination;

  const [catModalOpen, setCatModalOpen] = useState(false);

  const categoryColumns = [
    { key: "name", label: "Project Name", width: 240 },
    { key: "code", label: "Project Code", width: 200 },
    {
      key: "site_address",
      label: "Location",
      width: 320,
      render: (row) => siteAddressToString(row.site_address),
    },
  ];

  const [triggerProjectSearch] = useLazyGetProjectSearchDropdownQuery();

  const fetchCategoriesPage = async ({
    search = "",
    page = 1,
    pageSize = 7,
  }) => {
    const res = await triggerProjectSearch(
      { search, page, limit: pageSize },
      true 
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const onPickCategory = (row) => {
    if (!row) return;
    setProjectCode(row.code || "");
    setProjectLocation(siteAddressToString(row.site_address));
    setProjectName(row.name);
    setCatModalOpen(false);
  };


  const {
    data: prDataResp,
    isFetching: prLoading,
    isError: prError,
  } = useGetPurchaseRequestByIdQuery(prId, {
    skip: !(isEdit || isView) || !prId,
  });

  useEffect(() => {
    if (!prDataResp) return;
    const d = prDataResp?.data || prDataResp;

    setPrCode(d?.pr_code || "");
    setProjectCode(d?.project_code || ""); 
    setProjectLocation(d?.project_location || "");
    setProjectName(d?.project_name || "");
    setAskConfirmation(Boolean(d?.fetch_from_bom || d?.ask_confirmation));
    setDeliverTo(d?.deliver_to || "");
    setTerms(d?.terms_and_conditions || d?.terms || "");

    const incomingLines = Array.isArray(d?.lines) ? d.lines : [];
    setLines(
      incomingLines.length
        ? incomingLines.map((l) => ({
            id: crypto.randomUUID(),
            product: l.product || "",
            make: l.make || "",
            quantity: Number(l.quantity || 0),
            unitPrice: Number(l.unit_price ?? l.unitPrice ?? 0),
            taxPercent: Number(l.tax_percent ?? l.taxPercent ?? 0),
            note: l.note || "",
          }))
        : [EMPTY_LINE()]
    );
  }, [prDataResp]);

  const amounts = useMemo(() => {
    const untaxed = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      return sum + q * up;
    }, 0);

    const tax = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      const t = Number(l.taxPercent || 0);
      return sum + (q * up * t) / 100;
    }, 0);

    const total = untaxed + tax;

    return {
      untaxed: Number.isFinite(untaxed) ? untaxed : 0,
      tax: Number.isFinite(tax) ? tax : 0,
      total: Number.isFinite(total) ? total : 0,
    };
  }, [lines]);

  const addLine = () => setLines((prev) => [...prev, EMPTY_LINE()]);
  const removeLine = (id) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev
    );

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const resetForm = () => {
    if (isView) return;
    setProjectCode(isCreate ? projectId || "" : "");
    setOrderDeadline("");
    setProjectLocation("");
    setProjectName("");
    setAskConfirmation(false);
    setDeliverTo("");
    setTerms("");
    setLines([EMPTY_LINE()]);
  };

  const [createPurchaseRequest] = useCreatePurchaseRequestMutation();
  const [updatePurchaseRequest] = useEditPurchaseRequestMutation();

  const validate = () => {
    if (!projectCode) return "Project Code is required.";
    if (!deliverTo) return "Deliver To is required.";
    const hasAny = lines.some((l) => l.product && Number(l.quantity) > 0);
    if (!hasAny) return "Add at least one product line with a quantity.";
    return null;
  };

  const handleSubmit = async (action = "submit") => {
    try {
      if (isView) return;

      const error = validate();
      if (error) {
        alert(error);
        return;
      }

      setSubmitting(true);

      const payload = {
        project_id: projectId || null,
        pr_id: prId || null,
        projectCode, // Project Code
        order_deadline: orderDeadline || null,
        project_location: projectLocation || null, 
        ask_confirmation: askConfirmation,
        deliver_to: deliverTo,
        lines: lines
          .filter((l) => l.product && Number(l.quantity) > 0)
          .map((l) => ({
            product: l.product,
            make: l.make || "",
            quantity: Number(l.quantity),
            unit_price: Number(l.unitPrice),
            tax_percent: Number(l.taxPercent),
            note: l.note || "",
            line_total: Number(l.quantity) * Number(l.unitPrice),
            tax_amount:
              (Number(l.quantity) *
                Number(l.unitPrice) *
                Number(l.taxPercent)) /
              100,
            gross_amount:
              Number(l.quantity) * Number(l.unitPrice) +
              (Number(l.quantity) *
                Number(l.unitPrice) *
                Number(l.taxPercent)) /
                100,
          })),
        terms_and_conditions: terms || "",
        summary: {
          untaxed_amount: amounts.untaxed,
          tax_amount: amounts.tax,
          total: amounts.total,
        },
        action, 
      };

      console.log("➡️ Submitting Purchase Request payload:", payload);

      if (isEdit && prId) {
        await updatePurchaseRequest({ id: prId, body: payload }).unwrap();
        alert("Purchase Request updated successfully.");
      } else {
        await createPurchaseRequest(payload).unwrap();
        alert("Purchase Request created successfully.");
      }
    } catch (err) {
      console.error("❌ Submit failed:", err);
      alert("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const borderlessFieldSx = {
    border: "none",
    boxShadow: "none",
    bgcolor: "transparent",
    "--Input-radius": "0px",
    "--Select-radius": "0px",
    "--Input-paddingInline": "0px",
    "--Select-minHeight": "32px",
    "--Input-minHeight": "32px",
    "&:hover": { boxShadow: "none", bgcolor: "transparent" },
    "&:focus-within": { boxShadow: "none", outline: "none" },
  };

  const commonDisable = isView ? { disabled: true } : {};

  const selectedCode = (projectCode || "").trim();
  const rows = projectRows || [];
  const hasSelectedInList = rows.some((r) => r.code === selectedCode);

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: { xs: "full", lg: 1200 },
        ml: { xs: "0%", lg: "22%" },
      }}
    >
      <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Purchase Request
      </Typography>

      {(isEdit || isView) && (
        <Sheet variant="soft" sx={{ p: 1.5, borderRadius: "lg", mb: 1.5 }}>
          <Typography level="body-sm">
            <b>PR Code:</b> {prCode || "—"}
          </Typography>
        </Sheet>
      )}

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl", mb: 2 }}>
        <Grid container spacing={2}>
          {/* Project Name */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Code
            </Typography>

            {isCreate ? (
              <Select
                value={projectCode || ""}
                onChange={(_, v) => {
                  if (v === "__SEARCH_MORE__") {
                    setCatModalOpen(true);
                    return;
                  }
                  const row = projectRows.find((r) => r.code === v);
                  if (row) onPickCategory(row);
                }}
                placeholder={
                  projLoading ? "Loading..." : "Search or pick a project"
                }
                renderValue={() => selectedCode || "Select project code"}
                {...commonDisable}
              >
                {!hasSelectedInList && selectedCode && (
                  <Option key={`selected-${selectedCode}`} value={selectedCode}>
                    {selectedCode}
                  </Option>
                )}
                {(projectRows || []).map((r) => (
                  <Option key={r._id} value={r.code}>
                    {r.code} - {r.name}
                  </Option>
                ))}
                <Option value="__SEARCH_MORE__" sx={{ fontStyle: "italic" }}>
                  🔎 Search more…
                </Option>
              </Select>
            ) : (
              <Input
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="Project Code"
                {...commonDisable}
              />
            )}
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Name
            </Typography>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              {...commonDisable}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Location
            </Typography>
            <Input
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              {...commonDisable}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Category
            </Typography>
            <Select
              value={projectCode}
              onChange={(_, v) => setProjectCode(v || "")}
              placeholder="Select vendor"
              {...commonDisable}
            >
              {vendors.map((v) => (
                <Option key={v.id} value={v.name}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Grid>

          <Grid xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={askConfirmation}
              onChange={(e) => setAskConfirmation(e.target.checked)}
              label="Fetch From BOM"
              disabled={isView}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Deliver To
            </Typography>
            <Select
              value={deliverTo}
              onChange={(_, v) => setDeliverTo(v || "")}
              placeholder="Select location"
              {...commonDisable}
            >
              {deliverToOptions.map((d) => (
                <Option key={d.id} value={d.name}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Sheet>

      {/* Products Table */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Table variant="outlined" sx={{ mb: 1 }}>
          <thead>
            <tr>
              <th style={{ width: "34%", fontWeight: 700 }}>Product</th>
              <th style={{ width: "34%", fontWeight: 700 }}>Make</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Qty</th>
              <th style={{ width: "14%", fontWeight: 700 }}>Unit Price</th>
              <th style={{ width: "12%", fontWeight: 700 }}>Tax %</th>
              <th style={{ width: "14%", fontWeight: 700 }}>Amount</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const base = Number(l.quantity || 0) * Number(l.unitPrice || 0);
              const taxAmt = (base * Number(l.taxPercent || 0)) / 100;
              const gross = base + taxAmt;

              return (
                <tr key={l.id}>
                  <td>
                    <Select
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      value={l.product}
                      onChange={(_, v) => updateLine(l.id, "product", v || "")}
                      placeholder="Select product"
                      disabled={isView}
                    >
                      {catalog.map((p) => (
                        <Option key={p.id} value={p.label}>
                          {p.label}
                        </Option>
                      ))}
                    </Select>
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      value={l.make}
                      onChange={(e) => updateLine(l.id, "make", e.target.value)}
                      slotProps={{ input: { min: 0, step: "1" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(l.id, "quantity", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "1" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.unitPrice}
                      onChange={(e) =>
                        updateLine(l.id, "unitPrice", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.taxPercent}
                      onChange={(e) =>
                        updateLine(l.id, "taxPercent", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Chip variant="soft">₹ {gross.toFixed(2)}</Chip>
                  </td>

                  <td>
                    <IconButton
                      variant="plain"
                      color="danger"
                      onClick={() => removeLine(l.id)}
                      disabled={isView}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {!isView && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 1,
            }}
          >
            <Button
              size="sm"
              variant="outlined"
              startDecorator={<Add />}
              onClick={addLine}
            >
              Add a section
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Terms */}
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Description…
        </Typography>
        <Textarea
          minRows={3}
          placeholder="Write Description of PR"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          disabled={isView}
        />

        {/* Summary */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Sheet
            variant="soft"
            sx={{ borderRadius: "lg", p: 2, minWidth: 280 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                rowGap: 0.5,
                columnGap: 1.5,
              }}
            >
              <Typography level="body-sm">Untaxed Amount:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.untaxed.toFixed(2)}
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.tax.toFixed(2)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Total:
              </Typography>
              <Typography level="title-md" fontWeight={800} sx={{ mt: 0.5 }}>
                ₹ {amounts.total.toFixed(2)}
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

      {/* Actions */}
      {!isView && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button
            variant="soft"
            startDecorator={<RestartAlt />}
            onClick={resetForm}
            disabled={submitting}
          >
            Reset
          </Button>
          <Button
            color="primary"
            startDecorator={<Send />}
            loading={submitting || prLoading}
            onClick={() => handleSubmit("submit")}
          >
            {isEdit ? "Update PR" : "Submit PR"}
          </Button>
        </Box>
      )}

      {/* Search More Modal */}
      <SearchPickerModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onPick={onPickCategory}
        title="Search: Project"
        columns={categoryColumns}
        fetchPage={fetchCategoriesPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>
  );
}
