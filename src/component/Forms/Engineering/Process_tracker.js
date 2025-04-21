import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Tooltip,
  Select,
  Option,
  FormControl,
  FormLabel,
  Input,
} from "@mui/joy";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import img1 from "../../../assets/eng/milestones.png";
import img2 from "../../../assets/eng/PV.png";
import img3 from "../../../assets/eng/grounding.png";
import img4 from "../../../assets/eng/trench-coat.png";
import img5 from "../../../assets/eng/internet.png";
import img6 from "../../../assets/eng/air-conditioner.png";
import img7 from "../../../assets/eng/pay.png";


const options = ["Done", "Ongoing"];
const shareOptions = ["Yes", "No"];

const labelsLot1 = [
  "PV Array Layout",
  "Earthing",
  "Trench Layout",
  "Comm. CableLayout",
  "AC Cable Schedule",
  "BOQ",
];

const labelsLot2 = [
  "DC Cable Routing",
  "AC Cable Routing",
  "DC/AC SLD",
  "BAY SLD",
  "DC Cable Schedule",
  "Street Light BOQ & Route",
];

const CivilandMech = [
  "Survey File",
  "Pile Marking",
  "Transformer Foundation",
  "HT Panel Foundation",
  "LT Panel Foundation",
  "Yard Marking",
  "MCS",
  "Piling BOQ",
  "STAAD",
  "BOQ(MMS)",
  "MMS GA",
  "MMS HDG",
  "MMS FAB",
  "Inverter Mounting Drawing",
  "Fencing Layout",
  "Camera and Street Light BOQ",
];

const trackerDataLot1 = [
  {
    title: "PV Array Layout",
    status: "Done",
    statusColor: "success",
    image: img2,
  },
  {
    title: "Earthing",
    status: "Done",
    statusColor: "success",
    image: img3,
  },
  {
    title: "Trench Layout",
    status: "Done",
    statusColor: "success",
    image: img4,
  },
  {
    title: "Comm. Cable Layout",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "AC Cable Schedule",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
  {
    title: "BOQ",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
];

const trackerDataLot2 = [
  {
    title: "DC Cable Routing",
    status: "Done",
    statusColor: "success",
    image: img2,
  },
  {
    title: "AC Cable Routing",
    status: "Done",
    statusColor: "success",
    image: img3,
  },
  {
    title: "DC/AC SLD",
    status: "Done",
    statusColor: "success",
    image: img4,
  },
  {
    title: "BAY SLD",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "DC Cable Schedule",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
  {
    title: "Street Light BOQ & Route",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
];

const trackerDataCivilandMech = [
  {
    title: "Survey File",
    status: "Done",
    statusColor: "success",
    image: img2,
  },
  {
    title: "Pile Marking",
    status: "Done",
    statusColor: "success",
    image: img3,
  },
  {
    title: "Transformer Foundation",
    status: "Done",
    statusColor: "success",
    image: img4,
  },
  {
    title: "HT Panel Foundation",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "LT Panel Foundation",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
  {
    title: "Yard Marking",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
  {
    title: "MCS",
    status: "Done",
    statusColor: "success",
    image: img4,
  },
  {
    title: "Piling BOQ",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "STAAD",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
  {
    title: "BOQ(MMS)",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
  {
    title: "MMS GA",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "MMS HDG",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
  {
    title: "MMS FAB",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
  {
    title: "Inverter Mounting Drawing",
    status: "Not Started",
    statusColor: "danger",
    image: img7,
  },
  {
    title: "Fencing Layout",
    status: "Ongoing",
    statusColor: "warning",
    image: img5,
  },
  {
    title: "Camera and Street Light BOQ",
    status: "Ongoing",
    statusColor: "warning",
    image: img6,
  },
];

const FormComponentLot1 = () => {
  const [sharedStates, setSharedStates] = useState(
    Array(labelsLot1.length).fill("")
  );

  const handleSharedChange = (index, value) => {
    const updated = [...sharedStates];
    updated[index] = value;
    setSharedStates(updated);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 3,
        maxWidth: 600,
        mx: "auto",
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      <Grid container spacing={2}>
        {labelsLot1.map((label, index) => (
          <React.Fragment key={index}>
            <Grid xs={4}>
              <Typography mt={3} level="body-md">
                {label}
              </Typography>
            </Grid>
            <Grid xs={4}>
              <FormControl size="sm" sx={{ width: "100%" }}>
                <FormLabel>Status</FormLabel>
                <Select defaultValue="">
                  {options.map((opt, i) => (
                    <Option key={i} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={4}>
              <FormControl size="sm" sx={{ width: "100%" }}>
                <FormLabel>Shared</FormLabel>
                <Select
                  value={sharedStates[index]}
                  onChange={(_, value) => handleSharedChange(index, value)}
                >
                  {shareOptions.map((opt, i) => (
                    <Option key={i} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              {sharedStates[index] === "Yes" && (
                <FormControl size="sm" sx={{ mt: 1 }}>
                  <FormLabel>Link</FormLabel>
                  <Input placeholder="Enter link" />
                </FormControl>
              )}
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Card>
  );
};

const FormComponentLot2 = () => (
  <Card
    variant="outlined"
    sx={{ p: 3, maxWidth: 600, mx: "auto", maxHeight: 400, overflowY: "auto" }}
  >
    <Grid container spacing={2}>
      {labelsLot2.map((label, index) => (
        <React.Fragment key={index}>
          <Grid xs={4}>
            <Typography mt={3} level="body-md">
              {label}
            </Typography>
          </Grid>
          <Grid xs={4}>
            <FormControl size="sm" sx={{ width: "100%" }}>
              <FormLabel>Status</FormLabel>
              <Select defaultValue="">
                {options.map((opt, i) => (
                  <Option key={i} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={4}>
            <FormControl size="sm" sx={{ width: "100%" }}>
              <FormLabel>Shared</FormLabel>
              <Select defaultValue="">
                {shareOptions.map((opt, i) => (
                  <Option key={i} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  </Card>
);

const FormComponentCivilandMech = () => (
  <Card
    variant="outlined"
    sx={{ p: 3, maxWidth: 600, mx: "auto", maxHeight: 400, overflowY: "auto" }}
  >
    <Grid container spacing={2}>
      {CivilandMech.map((label, index) => (
        <React.Fragment key={index}>
          <Grid xs={4}>
            <Typography mt={3} level="body-md">
              {label}
            </Typography>
          </Grid>
          <Grid xs={4}>
            <FormControl size="sm" sx={{ width: "100%" }}>
              <FormLabel>Status</FormLabel>
              <Select defaultValue="">
                {options.map((opt, i) => (
                  <Option key={i} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={4}>
            <FormControl size="sm" sx={{ width: "100%" }}>
              <FormLabel>Shared</FormLabel>
              <Select defaultValue="">
                {shareOptions.map((opt, i) => (
                  <Option key={i} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  </Card>
);

const TrackerTimelineLot1 = ({ trackerDataLot2 = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "green";
      case "Ongoing":
        return "orange";
      case "Not Started":
        return "red";
      default:
        return "gray";
    }
  };

  const iconStyle = (item) => ({
    background: "#fff",
    color: "#000",
    boxShadow: "0 0 0 4px " + getStatusColor(item.status),
    backgroundImage: `url(${item.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  return (
    <Box
      sx={{
        height: "80vh", // Adjust height as needed
        overflowY: "auto",
        pr: 1,
      }}
    >
      <VerticalTimeline>
        {trackerDataLot1.map((item, idx) => (
          <VerticalTimelineElement
            key={idx}
            contentStyle={{
              borderTop: `4px solid ${getStatusColor(item.status)}`,
            }}
            contentArrowStyle={{
              borderRight: `7px solid ${getStatusColor(item.status)}`,
            }}
            iconStyle={iconStyle(item)}
            icon={<div></div>}
          >
            <Typography sx={{cursor:'pointer'}} level="h5" fontWeight={600}>
              {item.title}
            </Typography>
            <Typography level="body2" color={getStatusColor(item.status)}>
              {item.status}
            </Typography>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </Box>
  );
};

const TrackerTimelineLot2 = ({ trackerDataLot2 = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "green";
      case "Ongoing":
        return "orange";
      case "Not Started":
        return "red";
      default:
        return "gray";
    }
  };

  const iconStyle = (item) => ({
    background: "#fff",
    color: "#000",
    boxShadow: "0 0 0 4px " + getStatusColor(item.status),
    backgroundImage: `url(${item.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  return (
    <Box
      sx={{
        height: "80vh", // Adjust height as needed
        overflowY: "auto",
        pr: 1,
      }}
    >
      <VerticalTimeline>
        {trackerDataLot2.map((item, idx) => (
          <VerticalTimelineElement
            key={idx}
            contentStyle={{
              borderTop: `4px solid ${getStatusColor(item.status)}`,
            }}
            contentArrowStyle={{
              borderRight: `7px solid ${getStatusColor(item.status)}`,
            }}
            iconStyle={iconStyle(item)}
            icon={<div></div>}
          >
            <Typography sx={{cursor:'pointer'}} level="h5" fontWeight={600}>
              {item.title}
            </Typography>
            <Typography level="body2" color={getStatusColor(item.status)}>
              {item.status}
            </Typography>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </Box>
  );
};

const TrackerTimelineCivilandMech = ({ trackerDataCivilandMech = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "green";
      case "Ongoing":
        return "orange";
      case "Not Started":
        return "red";
      default:
        return "gray";
    }
  };

  const iconStyle = (item) => ({
    background: "#fff",
    color: "#000",
    boxShadow: "0 0 0 4px " + getStatusColor(item.status),
    backgroundImage: `url(${item.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  return (
    <Box
      sx={{
        height: "80vh",
        overflowY: "auto",
        pr: 1,
      }}
    >
      <VerticalTimeline>
        {trackerDataCivilandMech.map((item, idx) => (
          <VerticalTimelineElement
            key={idx}
            contentStyle={{
              borderTop: `4px solid ${getStatusColor(item.status)}`,
            }}
            contentArrowStyle={{
              borderRight: `7px solid ${getStatusColor(item.status)}`,
            }}
            iconStyle={iconStyle(item)}
            icon={<div></div>}
          >
            <Typography sx={{cursor:'pointer'}} level="h5" fontWeight={600}>
              {item.title}
            </Typography>
            <Typography level="body2" color={getStatusColor(item.status)}>
              {item.status}
            </Typography>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </Box>
  );
};

const ProcessTracker = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedOption, setSelectedOption] = useState("tracker");

  const showDropdown = [
    "Drawing Lot1",
    "Drawing Lot2",
    "Civil & Mechanical",
  ].includes(activeTab);

  return (
    <Box p={4} maxWidth={1200} mx="auto">
      <Box textAlign="center" mb={4}>
        <Box component="img" src={img1} alt="Milestones" />
        <Typography level="h2" color="primary" fontWeight={600}>
          Process Tracker
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          {[
            { label: "Project Id", value: "RJK/CHARLIE/1234" },
            { label: "Name", value: "Ritesh" },
            { label: "Company", value: "Charlie Pvt. Ltd." },
            { label: "State", value: "Rajasthan" },
            { label: "Type", value: "Kusum A" },
            { label: "Capacity", value: "2.56 AC / 3.54 DC" },
            { label: "Orientation", value: "Landscape" },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Typography level="body-lg">
                <b>{item.label}:</b> {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Card>

      <Box display="flex" gap={2} mb={4}>
        {[
          "Dashboard",
          "Drawing Lot1",
          "Drawing Lot2",
          "Civil & Mechanical",
        ].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "solid" : "outlined"}
            color={activeTab === tab ? "primary" : "neutral"}
            onClick={() => {
              setActiveTab(tab);
              setSelectedOption("tracker");
            }}
            sx={{ fontSize: "1.1rem" }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {showDropdown && (
        <Box mb={4}>
          <Typography level="h4" mb={1}>
            Choose View
          </Typography>
          <Select
            value={selectedOption}
            onChange={(e, val) => setSelectedOption(val)}
            sx={{ width: 200 }}
          >
            <Option value="form">Form</Option>
            <Option value="tracker">Tracker</Option>
          </Select>
        </Box>
      )}

      {activeTab === "Dashboard" && (
        <>
          <Grid container spacing={3} mb={4}>
            {[
              {
                label: "Project Completed",
                percent: 60,
                color: "success",
                tooltip: "8 out of 28 Completed",
              },
              {
                label: "Project Ongoing",
                percent: 30,
                color: "warning",
                tooltip: "10 out of 28 Ongoing",
              },
              {
                label: "Not Started",
                percent: 10,
                color: "danger",
                tooltip: "4 out of 28 Not started",
              },
            ].map((item, idx) => (
              <Grid key={idx} xs={12} sm={4}>
                <Tooltip
                  title={item.tooltip}
                  arrow
                  variant="solid"
                  color={item.color}
                  slotProps={{
                    root: {
                      sx: {
                        backgroundColor:
                          item.color === "success"
                            ? "#2e7d32"
                            : item.color === "warning"
                            ? "#ed6c02"
                            : item.color === "danger"
                            ? "#d32f2f"
                            : undefined,
                        color: "#fff",
                      },
                    },
                    arrow: {
                      sx: {
                        "--unstable_Tooltip-arrowBackground":
                          item.color === "success"
                            ? "#2e7d32"
                            : item.color === "warning"
                            ? "#ed6c02"
                            : item.color === "danger"
                            ? "#d32f2f"
                            : undefined,
                      },
                    },
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{ p: 2, textAlign: "center", cursor: "pointer" }}
                  >
                    <Typography level="h2" color={item.color}>
                      {item.percent}%
                    </Typography>
                    <Typography level="h4">{item.label}</Typography>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {[
              { title: "Drawing Lot 1", done: 4, total: 6 },
              { title: "Drawing Lot 2", done: 4, total: 6 },
              { title: "Civil and Mechanical", done: 8, total: 16 },
            ].map((section, idx) => (
              <Grid key={idx} xs={12} sm={4}>
                <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <Typography level="h3">
                    <b>{section.done}</b> out of <b>{section.total}</b>
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 1 }}
                  >
                    <Chip color="success" variant="solid" size="md">
                      Completed
                    </Chip>
                  </Box>
                  <Typography level="h5">{section.title}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {["Drawing Lot1"].includes(activeTab) &&
        (selectedOption === "form" ? (
          <FormComponentLot1 />
        ) : (
          <TrackerTimelineLot1 trackerDataLot1={trackerDataLot1} />
        ))}

      {["Drawing Lot2"].includes(activeTab) &&
        (selectedOption === "form" ? (
          <FormComponentLot2 />
        ) : (
          <TrackerTimelineLot2 trackerDataLot2={trackerDataLot2} />
        ))}

      {["Civil & Mechanical"].includes(activeTab) &&
        (selectedOption === "form" ? (
          <FormComponentCivilandMech />
        ) : (
          <TrackerTimelineCivilandMech
            trackerDataCivilandMech={trackerDataCivilandMech}
          />
        ))}
    </Box>
  );
};

export default ProcessTracker;