import { Player } from "@lottiefiles/react-lottie-player";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/Lotties/animation-loading.json";
import { Divider, Grid, Modal, Option, Select } from "@mui/joy";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import NoData from "../../assets/alert-bell.svg";
import { toast } from "react-toastify";
import { useGetAllMaterialQuery } from "../../redux/Eng/masterSheet";

const Material_Category_Tab = ({ selectedModuleData, id }) => {
  const headers = selectedModuleData?.fields?.map((field) => field.name) || [];

  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [selectedInverter, setSelectedInverter] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const {
    data: materialModelData,
    isLoading: loadingMaterialModelData,
    isError: errorMaterial,
  } = useGetAllMaterialQuery(id, {
    skip: !id, // Avoid fetch if ID is null
  });

  console.log("material:", materialModelData);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Status Filter</FormLabel>
        <Select size="sm" placeholder="Select status">
          <Option value="">All</Option>
          <Option value="Available">Available</Option>
          <Option value="Not Available">Not Available</Option>
        </Select>
      </FormControl>
    </>
  );

  const formatDate = (date) => {
    if (!date) return new Date();
    const [day, month, year] = date.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };


  const isLoading = false;
  const error = false;

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            startDecorator={<SearchIcon />}
            type="text"
            placeholder="Search by ID, Name, State, Mobile..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        {isLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Player
              autoplay
              loop
              src={animationData}
              style={{ height: 100, width: 100 }}
            />
          </Box>
        ) : error ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              // color: "red",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <PermScanWifiIcon style={{ color: "red", fontSize: "2rem" }} />
            <Typography
              fontStyle={"italic"}
              fontWeight={"600"}
              sx={{ color: "#0a6bcc" }}
            >
              Hang tight! Internet Connection will be back soon..
            </Typography>
          </span>
        ) : (
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <Checkbox size="sm" />
                </Box>
                {[
                  ...(selectedModuleData?.fields?.map((field) => field.name) ||
                    []),
                  "Status",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {materialModelData?.data.length > 0 ? (
                materialModelData.data.map((material) => (
                  <Box
                    component="tr"
                    key={material._id}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    {/* Checkbox column */}
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        color="primary"
                        checked={selected.includes(material._id)}
                      />
                    </Box>

                    {/* Dynamic data columns */}
                    {material.category.fields.map((field, idx) => {
                      const fieldValue = material.data.find(
                        (d) => d.name === field.name
                      );
                      return (
                        <Box
                          component="td"
                          key={idx}
                          sx={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {fieldValue?.values
                            ?.map((v) => v.input_values)
                            .join(", ") || "-"}
                        </Box>
                      );
                    })}

                    {/* Status column */}
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {material.is_available ? "Available" : "Not Available"}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={
                      materialModelData?.data?.[0]?.category?.fields.length +
                        2 || 3
                    }
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "16px",
                      textAlign: "center",
                      color: "gray",
                    }}
                  >
                    No data available
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Sheet>
    </>
  );
};
export default Material_Category_Tab;
