import {
  Autocomplete,
  Box,
  Button,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetWonDataByIdQuery } from "../../redux/leadsSlice";

const Wonup_Summary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // console.log("Fetched lead data:", getLead);

  const [formData, setFormData] = useState({
    c_name: "",
    company: "",
    email: "",
    mobile: "",
    alt_mobile: "",
    village: "",
    district: "",
    state: "",
    scheme: "",
    capacity: "",
    distance: "",
    tarrif: "",
    land: "",
    entry_date: "",
    interest: "",
    comment: "",
    submitted_by: "",
  });

  // console.log("Initial form data:", formData);

  const statesOfIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const sourceOptions = {
    "Referred by": ["Directors", "Clients", "Team members", "E-mail"],
    "Social Media": ["Whatsapp", "Instagram", "LinkedIn"],
    Marketing: ["Youtube", "Advertisements"],
    "IVR/My Operator": [],
    Others: [],
  };
  const landTypes = ["Leased", "Owned"];

  const leadId = searchParams.get("leadId");

  console.log("Lead ID from URL:", leadId);

  const {
    data: getLead,
    isLoading,
    error,
  } = useGetWonDataByIdQuery({ leadId }, { skip: !leadId });

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return parts[0].length === 4
      ? dateString
      : `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  useEffect(() => {
    if (!leadId) {
      console.error("Lead ID missing in URL.");
      return;
    }
    if (getLead?.data) {
      const lead = Array.isArray(getLead?.data) ? getLead?.data : getLead?.data;

      console.log("Fetched lead data:", lead);
      setFormData({
        ...lead,
        entry_date: formatDateToYYYYMMDD(lead.entry_date),
      });
    }
  }, [getLead, leadId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Field changed: ${name}, New Value: ${value}`);

    setFormData((prev) => {
      if (name === "available_land") {
        return {
          ...prev,
          land: {
            ...prev.land,
            available_land: value || "",
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  if (isLoading) return <p>Loading lead details...</p>;
  if (error) return <p>Error fetching lead details</p>;

  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 5,
        borderRadius: "lg",
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        boxShadow: 4,
      }}
    >
      <Typography level="h3" mb={4} textAlign="center" fontWeight="bold">
        Won Lead Summary
      </Typography>
      <form>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6}>
            <FormLabel>Customer Name</FormLabel>
            <Input
              name="c_name"
              value={formData.c_name}
              onChange={handleChange}
              fullWidth
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Company Name</FormLabel>
            <Input
              name="company"
              value={formData.company}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Group Name</FormLabel>
            <Input
              name="group"
              value={formData.group}
              onChange={handleChange}
              s
              readOnly
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <FormLabel>Source</FormLabel>
            <Select
              name="source"
              value={formData.source}
              onChange={(e, newValue) =>
                setFormData({ ...formData, source: newValue, reffered_by: "" })
              }
              required
              fullWidth
            >
              {Object.keys(sourceOptions).map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Grid>

          {formData.source && sourceOptions[formData.source]?.length > 0 && (
            <Grid xs={12} sm={6}>
              <FormLabel>Sub Source</FormLabel>
              <Select
                name="reffered_by"
                value={formData.reffered_by}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, reffered_by: newValue })
                }
                readOnly
                fullWidth
              >
                {sourceOptions[formData.source].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
          )}

          <Grid xs={12} sm={6}>
            <FormLabel>Email ID</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Mobile Number</FormLabel>
            <Input
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Alt Mobile Number</FormLabel>
            <Input
              name="alt_mobile"
              type="tel"
              value={formData.alt_mobile}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Village Name</FormLabel>
            <Input
              name="village"
              value={formData.village}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>District Name</FormLabel>
            <Input
              name="district"
              value={formData.district}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Select State</FormLabel>
            <Select
              name="state"
              value={formData.state}
              onChange={(e, newValue) =>
                setFormData({ ...formData, state: newValue })
              }
            >
              {statesOfIndia.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Capacity</FormLabel>
            <Input
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Sub Station Distance (KM)</FormLabel>
            <Input
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Tariff (Per Unit)</FormLabel>
            <Input
              name="tarrif"
              value={formData.tarrif}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Available Land</FormLabel>
            <Input
              name="available_land"
              value={formData.land?.available_land ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  land: { ...prev.land, available_land: e.target.value },
                }))
              }
              type="number"
              fullWidth
              variant="soft"
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Creation Date</FormLabel>
            <Input
              name="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={handleChange}
              readOnly
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Scheme</FormLabel>
            <Select
              name="scheme"
              value={formData.scheme}
              onChange={(e, newValue) =>
                setFormData({ ...formData, scheme: newValue })
              }
              readOnly
            >
              {["KUSUM A", "KUSUM C", "Other"].map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Land Types</FormLabel>
            <Autocomplete
              options={landTypes}
              value={formData.land?.land_type ?? null} // Ensure safe access
              onChange={(e, value) =>
                setFormData((prev) => ({
                  ...prev,
                  land: { ...prev.land, land_type: value || "" }, // Prevent undefined values
                }))
              }
              getOptionLabel={(option) => option} // Ensure proper display
              renderInput={(params) => (
                <Input
                  {...params}
                  placeholder="Land Type"
                  variant="soft"
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option === value} // Ensure correct selection matching
              sx={{ width: "100%" }}
              readOnly
            />
          </Grid>
          {/* <Grid xs={12} sm={6}>
            <FormLabel>Interest</FormLabel>
            <Select
              name="interest"
              value={formData.interest}
              onChange={(e, newValue) =>
                setFormData({ ...formData, interest: newValue })
              }
              required
            >
              {["Yes", "No"].map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Grid> */}
          <Grid xs={12} sm={6}>
            <FormLabel>Comments</FormLabel>
            <Input
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              multiline="true"
              rows={4}
              readOnly
            />
          </Grid>
          <Grid xs={12}>
            <Box textAlign="center" sx={{ mt: 3 }}>
              {/* <Button type="submit" variant="solid" loading={isLoading}>
                  Update
                </Button> */}
              <Button
                variant="soft"
                color="neutral"
                sx={{ ml: 2 }}
                onClick={() => navigate("/leads")}
              >
                Back
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Sheet>
  );
};

export default Wonup_Summary;
