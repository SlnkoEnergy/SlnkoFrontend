import {
  Box,
  Typography,
  Table,
  Sheet,
  Checkbox,
  Input,
  Select,
  Option,
  Button,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/joy";
import {
  useGetScopeByProjectIdQuery,
  useUpdateScopeByProjectIdMutation,
  useUpdateScopeStatusMutation,
  useGenerateScopePdfMutation,
} from "../redux/camsSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ScopeDetail = ({ project_id, project_code }) => {
  const uomOptions = ["Nos", "Kg", "Meter", "Litre", "MW", "Lot"];

  const {
    data: getScope,
    isLoading,
    error,
    refetch,
  } = useGetScopeByProjectIdQuery({ project_id });

  const [updateScope] = useUpdateScopeByProjectIdMutation();
  const [updateScopeStatus] = useUpdateScopeStatusMutation();
  const [generateScopePdf] = useGenerateScopePdfMutation();
  const [itemsState, setItemsState] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const status = getScope?.data?.current_status?.status?.toLowerCase();
  const isOpen = status === "open";

  useEffect(() => {
    if (getScope?.data?.items) {
      setItemsState(getScope.data.items);
    }
  }, [getScope]);

const handleCheckboxChange = (index, checked) => {
  const item = itemsState[index];
  if (!item) return;

  if (item.pr_status && !checked) {
    toast.error("Purchase request has been made for this Item");
    return;
  }

  const updatedScope = checked ? "slnko" : "client";
  const idKey = item.item_id; // ✅ use item_id as the unique identifier

  setItemsState((prev) =>
    prev.map((it) =>
      it.item_id === idKey ? { ...it, scope: updatedScope } : it
    )
  );
};

const handleQuantityChange = (index, value) => {
  const nameKey = itemsState[index]?.name; // ✅ use name
  setItemsState((prev) =>
    prev.map((item) =>
      item.name === nameKey ? { ...item, quantity: value } : item
    )
  );
};

const handleUomChange = (index, value) => {
  const nameKey = itemsState[index]?.name; // ✅ use name
  setItemsState((prev) =>
    prev.map((item) => (item.name === nameKey ? { ...item, uom: value } : item))
  );
};


  const handleSubmit = async () => {
  try {
    const payload = {
      items: itemsState.map((item) => ({
        item_id: item.item_id,
        name: item.name,
        type: item.type,
       category: item.category,
        scope: item.scope || "client",
        quantity: item.quantity || "",
        uom: item.uom || "",
      })),
    };
    await updateScope({ project_id, payload }).unwrap();
    toast.success("Scope updated successfully");
    refetch();
  } catch (err) {
    toast.error("Failed to update scope");
  }
};


  const handleChipClick = (event) => {
    if (!isOpen) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await updateScopeStatus({
        project_id,
        status: newStatus,
        remarks: " ",
      }).unwrap();
      toast.success(`Status changed to ${newStatus}`);
      handleMenuClose();
      refetch();
    } catch (err) {
      toast.error("Failed to change status");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await generateScopePdf({ project_id }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Scope_${project_code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="danger">Error loading scope</Typography>;

  const supplyItems = itemsState.filter((item) => item.type === "supply");
  const executionItems = itemsState.filter((item) => item.type === "execution");

 const groupedItems = itemsState.reduce(
   (acc, item) => {
     if (item.type === "supply") acc.supply.push(item);
     else if (item.type === "execution") acc.execution.push(item);
     return acc;
   },
   { supply: [], execution: [] }
 );


  const renderTable = (title, items) => (
    <Box sx={{ mb: 4 }}>
      <Typography
        level="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          borderBottom: "2px solid",
          borderColor: "neutral.outlinedBorder",
          pb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          overflow: "auto",
          "& table": { minWidth: 500 },
        }}
      >
        <Table
          borderAxis="both"
          stickyHeader
          hoverRow
          sx={{
            "& th": {
              backgroundColor: "neutral.plainHoverBg",
              fontWeight: "bold",
            },
          }}
        >
          <thead>
            <tr>
              <th>Categories</th>
              <th style={{ textAlign: "left" }}>Scope</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => {
                const indexInAll = itemsState.findIndex(
                  (it) => it.item_id === item.item_id
                );
                return (
                  <tr key={item.item_id}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: "left" }}>
                      <Checkbox
                        variant="soft"
                        checked={item.scope === "slnko"}
                        disabled={!isOpen}
                        onChange={(e) =>
                          handleCheckboxChange(indexInAll, e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: "full",
        maxHeight: "60vh",
        overflowY: "auto",
        overflowX: "auto",
        mx: "auto",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        width={"full"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={4}
        mb={2}
      >
        <Box width={"full"} display={"flex"} gap={1}>
          <Typography sx={{ fontSize: "1.2rem" }}>Status</Typography>{" "}
          <Chip
            color={isOpen ? "success" : "danger"}
            onClick={handleChipClick}
            sx={{
              cursor: isOpen ? "default" : "pointer",
              userSelect: "none",
            }}
          >
            {status
              ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
              : "Closed"}
          </Chip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleChangeStatus("open")}>Open</MenuItem>
          </Menu>
        </Box>
        <Box width={"full"} display="flex" justifyContent="flex-end">
          {status === "closed" && (
            <Button
              size="sm"
              variant="outlined"
              onClick={handleDownloadPdf}
              disabled={downloading}
              startDecorator={
                downloading ? <CircularProgress size="sm" /> : null
              }
            >
              {downloading ? "Downloading..." : "Download Pdf"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Tables */}
      <Box>
        {renderTable("Supply Scope", groupedItems.supply)}
        {renderTable("Execution Scope", groupedItems.execution)}
        <Box>{isOpen && <Button onClick={handleSubmit}>Submit</Button>}</Box>
      </Box>
    </Box>
  );
};

export default ScopeDetail;
