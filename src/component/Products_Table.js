import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Checkbox from "@mui/joy/Checkbox";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import  { iconButtonClasses } from "@mui/joy/IconButton";
import NoData from "../assets/alert-bell.svg";
import { useGetProductsQuery } from "../redux/productsSlice";
import { Chip, Option, Select, Tooltip, Typography } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";

function Products_Table() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const options = [1, 5, 10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );
  const navigate = useNavigate();
  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);

      if (currentPage > 1) p.set("page", String(currentPage));
      else p.delete("page");

      if (searchTerm) p.set("search", searchTerm);
      else p.delete("search");
      if (rowsPerPage !== 10) p.set("pageSize", String(rowsPerPage));
      else p.delete("pageSize");

      return p;
    });
  }, [currentPage, searchTerm, rowsPerPage, setSearchParams]);

  const { data: getProducts } = useGetProductsQuery(
    {
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
      category: "",
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const handlePrev = () => {
    if (getProducts?.meta?.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (getProducts?.meta?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getValue = (product, fieldName) => {
    const field = product.data.find((f) => f.name === fieldName);
    return field?.values?.[0]?.input_values || "-";
  };

  const ProductNameCell = ({ text }) => {
    const name = typeof text === "string" ? text : "";
    const truncated = name.length > 15 ? name.slice(0, 15) + "..." : name;

    const tooltipContent = (
      <Box
        sx={{
          maxWidth: 320,
          whiteSpace: "pre-line",
          wordBreak: "break-word",
        }}
      >
        <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: "#fff" }}>
          {name}
        </Typography>
      </Box>
    );

    return (
      <>
        {name.length > 15 ? (
          <Tooltip
            title={tooltipContent}
            arrow
            placement="top-start"
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: "#374151", 
                  color: "#fff",
                  maxWidth: 320,
                  p: 1.2,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              },
              arrow: { sx: { color: "#374151" } },
            }}
          >
            <span style={{ cursor: "default" }}>{truncated}</span>
          </Tooltip>
        ) : (
          <span>{name}</span>
        )}
      </>
    );
  };

  return (
    <>
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          py: 2,
          display: "flex",
          gap: 1.5,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by SKU, Product Category, Name, Make or GST"
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </FormControl>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            padding: "8px 16px",
            mt: 2,
          }}
        >
          <Typography level="body-sm">Rows Per Page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  return params;
                });
              }
            }}
            size="sm"
            variant="outlined"
            sx={{
              minWidth: 80,
              borderRadius: "md",
              boxShadow: "sm",
            }}
          >
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          overflow: "auto",
          minHeight: 0,
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <tr>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                <Checkbox size="sm" />
              </th>
              {[
                "SKU Code",
                "Product Category",
                "Product Name",
                "Make",
                "Cost",
                "UoM",
                "GST(%)",
              ].map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {getProducts?.data?.length > 0 ? (
              getProducts.data.map((product) => (
                <tr key={product._id}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox size="sm" />
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Chip
                      color="primary"
                      variant="solid"
                      onClick={() =>
                        navigate(`/product_form?mode=view&id=${product._id}`)
                      }
                    >
                      {product.sku_code}
                    </Chip>
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {product.category?.name}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <ProductNameCell text={getValue(product, "Product Name")} />
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {getValue(product, "Make")}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    ₹ {getValue(product, "Cost")}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {String(getValue(product, "UoM") || "")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {getValue(product, "GST")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ padding: "8px", textAlign: "left" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginBottom: "8px",
                      }}
                    />
                    <Typography fontStyle="italic">No Product Found</Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { lg: "18%", xl: "15%" },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={handlePrev}
          disabled={!getProducts?.meta?.hasPrevPage}
        >
          Previous
        </Button>

        <Box>
          Showing{" "}
          {Math.min(
            getProducts?.meta?.total || 0,
            getProducts?.meta?.limit || 0
          )}{" "}
          {Math.min(
            getProducts?.meta?.total || 0,
            getProducts?.meta?.limit || 0
          ) === 1
            ? "result"
            : "results"}
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          <Typography level="body-sm">
            Page {getProducts?.meta?.page || 1} of{" "}
            {getProducts?.meta?.totalPages || 1}
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={handleNext}
          disabled={!getProducts?.meta?.hasNextPage}
        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default Products_Table;
