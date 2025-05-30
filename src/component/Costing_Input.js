import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Grid, Sheet, Table } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "../utils/Axios";
import "./Commercial Offer/CSS/offer.css";

const Costing_Input = () => {
  const navigate = useNavigate();
  const [scmData, setscmData] = useState({
    spv_modules_555: "",
    spv_modules_580: "",
    spv_modules_550: "",
    spv_modules_585: "",
    solar_inverter: "",
    module_mounting_structure: "",
    mounting_hardware: "",
    dc_cable: "",
    ac_cable_inverter_accb: "",
    ac_cable_accb_transformer: "",
    ac_ht_cable_11KV: "",
    ac_ht_cable_33KV: "",
    earthing_station: "",
    earthing_strips: "",
    earthing_strip: "",
    lightening_arrestor: "",
    datalogger: "",
    auxilary_transformer: "",
    ups_ldb: "",
    balance_of_system: "",
    transportation: "",
    transmission_line_11kv: "",
    transmission_line_33kv: "",
    transmission_line_internal: "",
    transmission_line_print: "",
    ct_pt_11kv_MP: "",
    ct_pt_33kv_MP: "",
    ct_pt_11kv_Other: "",
    ct_pt_33kv_Other: "",
    abt_meter_11kv_MP: "",
    abt_meter_33kv_MP: "",
    abt_meter_11kv_Other: "",
    abt_meter_33kv_Other: "",
    vcb_kiosk: "",
    slnko_charges_scm: "",
    installation_commissioing: {
      labour_works: "",
      machinery: "",
      civil_material: "",
    },
    submitted_by_scm: "",
  });

  const [id, setId] = useState(""); // Store `_id` dynamically from GET API

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(token);

    if (!token) {
      throw new Error("No auth token found in localStorage.");
    }

    Axios.get("/get-comm-scm-rate", {
      headers: {
        "x-auth-token": token,
      },
    })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          console.log("Fetched data:", response.data[0]); // Debugging fetched data
          setscmData(response.data[0]);
          setId(response.data[0]._id); // Store `_id` dynamically
        } else {
          console.error("No data found in API response");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setscmData((prev) => {
      if (prev.installation_commissioing?.hasOwnProperty(name)) {
        return {
          ...prev,
          installation_commissioing: {
            ...prev.installation_commissioing,
            [name]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      console.error("Error: `_id` is missing, cannot update");
      return;
    }

    console.log("Submitting data to PUT API:", { id, scmData });

    try {
      const token = localStorage.getItem("authToken");
      console.log(token);

      if (!token) {
        throw new Error("No auth token found in localStorage.");
      }

      const response = await Axios.put(`/edit-scm-rate/${id}`, scmData, {
        headers: {
          "x-auth-token": token,
        },
      });

      toast.success("Data updated successfully!");
      console.log("Data updated successfully:", response.data);
      navigate("/comm_offer");
    } catch (error) {
      toast.error("Error updating data!");
      console.error(
        "Error updating data:",
        error.response ? error.response.data : error
      );
    }
  };

  return (
    <Grid
      container
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, sm: 3, md: 4, lg: 5 },
      }}
    >
      <Grid
        item
        xs={12}
        sm={10}
        md={8}
        lg={7}
        // sx={{
        //   height: "100%",
        // }}
      >
        {/* Table Section */}
        <Box
          sx={{
            width: "100%",
            height: "auto",
            display: "flex",
            justifyContent: "center",
            marginTop: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Sheet
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  borderCollapse: "collapse!important",
                  tableLayout: "auto",
                  border: "1px solid #dee2e6 !important",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>S.NO.</th>
                    <th style={{ width: "10%" }}>ITEM NAME</th>
                    <th style={{ width: "15%" }}>RATING</th>
                    <th style={{ width: "30%" }}>SPECIFICATION</th>
                    <th>Rate</th>
                    <th style={{ width: "10%" }}>Rate UoM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1.</td>
                    <td>SPV Modules</td>
                    <td>550 Wp</td>
                    <td>
                      Highly efficient Mono PERC M10 cells P-Type, PID Free & UV
                      Resistant, With Inbuilt Bypass Diode, Frame is made of
                      Aluminium Anodized With Power Tolerance + 5Wp, With RFID
                      Tag inside module, Product Warranty upto 12 Years and
                      Performance Warranty Upto 27/30 Year.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="spv_modules_550"
                        value={scmData.spv_modules_550}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>SPV Modules</td>
                    <td>555 Wp</td>
                    <td>
                      Highly efficient Mono PERC M10 cells P-Type, PID Free & UV
                      Resistant, With Inbuilt Bypass Diode, Frame is made of
                      Aluminium Anodized With Power Tolerance + 5Wp, With RFID
                      Tag inside module, Product Warranty upto 12 Years and
                      Performance Warranty Upto 27/30 Year.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="spv_modules_555"
                        value={scmData.spv_modules_555}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>SPV Modules</td>
                    <td>580 Wp</td>
                    <td>
                      Highly efficient TOPCon Bifacial N-Type, PID Free & UV
                      Resistant, With Inbuilt Bypass Diode, Frame is made of
                      Aluminium Anodized With Power Tolerance + 5Wp, With RFID
                      Tag inside module, Product Warranty upto 12 Years and
                      Performance Warranty Upto 27/30 Year.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="spv_modules_580"
                        value={scmData.spv_modules_580}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>SPV Modules</td>
                    <td>585 Wp</td>
                    <td>
                      Highly efficient TOPCon Bifacial N-Type, PID Free & UV
                      Resistant, With Inbuilt Bypass Diode, Frame is made of
                      Aluminium Anodized With Power Tolerance + 5Wp, With RFID
                      Tag inside module, Product Warranty upto 12 Years and
                      Performance Warranty Upto 27/30 Year.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="spv_modules_585"
                        value={scmData.spv_modules_585}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>
                  <tr>
                    <td>2.</td>
                    <td>Solar Inverter</td>
                    <td>295 kVA</td>
                    <td>
                      Grid-tied String Inverter, Three Phase, 50 Hz Inverter
                      output shall be at 800V, & IGBT/MOSFET Microprocessor,
                      Efficiency-98% or above. 5 years warranty shall be
                      provided by Manufacturer.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="solar_inverter"
                        value={scmData.solar_inverter}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Nos.</td>
                  </tr>
                  <tr>
                    <td>3.</td>
                    <td>Module Mounting Structure</td>
                    <td>2PX12 Table, 4LX6 Table, 2Px24 Table</td>
                    <td>
                      MMS Shall be designed for wind speed as per IS 875 Part 3
                      and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                      conform to IS 15961, Column (YS-250) shall conform to IS
                      2062 & HDG shall conform to IS 4759.1996 and . Exact
                      Sections shall be decided at the time of detailed
                      engineering. Depth of pile foundation shall be decided
                      after soil tests.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="module_mounting_structure"
                        value={scmData.module_mounting_structure}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Kg</td>
                  </tr>
                  <tr>
                    <td>4.</td>
                    <td>Module Mounting & MMS Hardware</td>
                    <td>SS304, HDG Grade 8.8</td>
                    <td>
                      SS304 for Module to Purlin Mounting & HDG Grade 8.8 for
                      all other connections
                    </td>
                    <td>
                      <input
                        type="number"
                        name="mounting_hardware"
                        value={scmData.mounting_hardware}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td>5.</td>
                    <td>DC Cable (Solar Module to Inverter)</td>
                    <td>
                      1C x 4 sqmm Cu flexible copper conductor solar DC cable
                      (Red & Black)
                    </td>
                    <td>
                      {" "}
                      Flexible copper conductor solar DC cable, Fine wire
                      strands of annealed tinned copper, Rated 1.5 kV DC,
                      Electron Beam Cross Linked Co-polymer(XLPO) Halogen Free
                      Insulation and outer sheath, Black color and Red Colour,
                      DC cables complying to EN50618, TUV 2PFG 1169 for service
                      life expectency of 25 years. Flame retardent, UV resistent
                    </td>
                    <td>
                      <input
                        type="number"
                        name="dc_cable"
                        value={scmData.dc_cable}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>6.</td>
                    <td>AC Cable (Inverter to ACCB)</td>
                    <td>
                      1.9/3.3 kV,3C,300 <br />
                      Sqmm Al, AR,XLPE, CABLE
                    </td>
                    <td>
                      Aluminium, FRLS with galvanized steel armouring minimum
                      area of coverage 90% , XLPE insulated compliant to IS:
                      7098, with distinct extruded XLPE inner sheath of black
                      color as per IS 5831. If armoured, Galvanized Steel
                      armouring to be used with minumum 90% area of coverage.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ac_cable_inverter_accb"
                        value={scmData.ac_cable_inverter_accb}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>7.</td>
                    <td>AC Cable (ACCB to Transformer)</td>
                    <td>
                      1.9/3.3 kV,3C,300 <br />
                      Sqmm Al, AR,XLPE, CABLE
                    </td>
                    <td>
                      Aluminium, FRLS with galvanized steel armouring minimum
                      area of coverage 90% , XLPE insulated compliant to IS:
                      7098, with distinct extruded XLPE inner sheath of black
                      color as per IS 5831. If armoured, Galvanized Steel
                      armouring to be used with minumum 90% area of coverage.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ac_cable_accb_transformer"
                        value={scmData.ac_cable_accb_transformer}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>8.</td>
                    <td>AC HT Cable (Transformer to HT Panel)</td>
                    <td>
                      11 kV(E),3C,120 <br />
                      Sqmm Al,Ar,HT,XLPE, CABLE
                    </td>
                    <td>
                      Aluminium, FRLS with galvanized steel armouring minimum
                      area of coverage 90% , XLPE insulated compliant to IS:
                      7098, with distinct extruded XLPE inner sheath of black
                      color as per IS 5831. If armoured, Galvanized Steel
                      armouring to be used with minumum 90% area of coverage.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ac_ht_cable_11KV"
                        value={scmData.ac_ht_cable_11KV}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>AC HT Cable (Transformer to HT Panel)</td>
                    <td>
                      33 kV(E),3C,120 <br />
                      Sqmm Al,Ar,HT,XLPE, CABLE
                    </td>
                    <td>
                      Aluminium, FRLS with galvanized steel armouring minimum
                      area of coverage 90% , XLPE insulated compliant to IS:
                      7098, with distinct extruded XLPE inner sheath of black
                      color as per IS 5831. If armoured, Galvanized Steel
                      armouring to be used with minumum 90% area of coverage.
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ac_ht_cable_33KV"
                        value={scmData.ac_ht_cable_33KV}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>16.</td>
                    <td>Earthing Station</td>
                    <td>
                      Maintenance Free Earth Electrode with Chemical Earthing
                      Set{" "}
                    </td>
                    <td>
                      The earthing for array and LT power system shall be made
                      of 3 mtr long , 17.2 mm dia, Copper Bonded , thickness of
                      250 microns, chemical compound filled, double walled
                      earthing electrodes including accessories, and providing
                      masonry enclosure with cast iron cover plate having
                      pad-locking arrangement, watering pipe using charcoal or
                      coke and salt as required as per provisions of IS: 3043
                    </td>
                    <td>
                      <input
                        type="number"
                        name="earthing_station"
                        value={scmData.earthing_station}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td>17.</td>
                    <td>Earthing Strips</td>
                    <td>25x3 mm GI strip</td>
                    <td>
                      25x3 mm GI strip With Zinc coating of 70 to 80 microns
                    </td>
                    <td>
                      <input
                        type="number"
                        name="earthing_strips"
                        value={scmData.earthing_strips}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>18.</td>
                    <td>Earthing Strips</td>
                    <td>50x6 mm GI strip</td>
                    <td>
                      50x6 mm GI strip With Zinc coating of 70 to 80 microns
                    </td>
                    <td>
                      <input
                        type="number"
                        name="earthing_strip"
                        value={scmData.earthing_strip}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/m</td>
                  </tr>

                  <tr>
                    <td>19.</td>
                    <td>Lightening Arrestor</td>
                    <td>107 Mtr Dia over 7 Mtr High Mast with counter</td>
                    <td>
                      ESE type as per NFC 17-102, ESE are considered with 107
                      Mtr Dia over 7 Mtr High Mast with counter
                    </td>
                    <td>
                      <input
                        type="number"
                        name="lightening_arrestor"
                        value={scmData.lightening_arrestor}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td>20.</td>
                    <td>Datalogger</td>
                    <td>As per inverter manufacturer</td>
                    <td>As per inverter manufacturer</td>
                    <td>
                      <input
                        type="number"
                        name="datalogger"
                        value={scmData.datalogger}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td>21.</td>
                    <td>Auxilary transformer</td>
                    <td>10 kVA,50Hz, 800/415 V, Dyn11</td>
                    <td>Dry Type Transformer</td>
                    <td>
                      <input
                        type="number"
                        name="auxilary_transformer"
                        value={scmData.auxilary_transformer}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Nos.</td>
                  </tr>

                  <tr>
                    <td>22.</td>
                    <td>UPS & LDB</td>
                    <td>1.5 kW Load with 1 Hour backup, Battery SMF Type</td>
                    <td>-</td>
                    <td>
                      <input
                        type="number"
                        name="ups_ldb"
                        value={scmData.ups_ldb}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td>23.</td>
                    <td>
                      Balance of system with Wet Module Cleaning System (MCS) &
                      Dry Cleaning semi automatic robot
                    </td>
                    <td>
                      Class C Items including Connectors, Lungs, Glands,
                      Termination Kits, Conduits, Cable Tie, Ferruls, Sleeves,
                      PU Foam, Route Marker, Danger boards and signages, Double
                      Warning Tape, & Fire Fighting System
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="balance_of_system"
                        value={scmData.balance_of_system}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>
                  <tr>
                    <td
                      colSpan={6}
                      style={{ fontWeight: "bold", fontSize: "2rem" }}
                    >
                      CIVIL WORKS
                    </td>
                  </tr>
                  <tr>
                    <td>24.</td>
                    <td>Installation and commissioing</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>LABOUR WORKS:</span>{" "}
                      Includes Pile casting, Module Mounting & Alignment, and
                      complete AC-DC work till commissioning inside plant
                      boundary
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="labour_works"
                        value={scmData.installation_commissioing.labour_works}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>MACHINARY :</span>{" "}
                      Includes Augar, Tractor, JCBs, Hydra, Ajax and other
                      machinaries
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="machinery"
                        value={scmData.installation_commissioing.machinery}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>
                        CIVIL MATERIAL:
                      </span>{" "}
                      Cement, Aggregates, Bricks, Sand & Iron Bars
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="civil_material"
                        value={scmData.installation_commissioing.civil_material}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>

                  <tr>
                    <td>25.</td>
                    <td>Transportaion</td>
                    <td>Transformer, LT/HT, Cables, BOS</td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="transportation"
                        value={scmData.transportation}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Vehicle</td>
                  </tr>

                  <tr>
                    <td>26.</td>
                    <td>Transmission Line</td>
                    <td>
                      11 kV Transmission Line with appropriate conductor size
                      and PCC Poles
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="transmission_line_11kv"
                        value={scmData.transmission_line_11kv}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Km</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>Transmission Line</td>
                    <td>
                      33 kV Transmission Line with appropriate conductor size
                      and PCC Poles.
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="transmission_line_33kv"
                        value={scmData.transmission_line_33kv}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Km</td>
                  </tr>

                  <tr>
                    <td>27.</td>
                    <td>CT PT</td>
                    <td>11kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Madhya
                      Pradesh
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ct_pt_11kv_MP"
                        value={scmData.ct_pt_11kv_MP}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>CT PT</td>
                    <td>33kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Madhya
                      Pradesh
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ct_pt_33kv_MP"
                        value={scmData.ct_pt_33kv_MP}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>CT PT</td>
                    <td>11kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Other
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ct_pt_11kv_Other"
                        value={scmData.ct_pt_11kv_Other}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>CT PT</td>
                    <td>33kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Other
                    </td>
                    <td>
                      <input
                        type="number"
                        name="ct_pt_33kv_Other"
                        value={scmData.ct_pt_33kv_Other}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td>28.</td>
                    <td>ABT Meter</td>
                    <td>11kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Madhya
                      Pradesh
                    </td>
                    <td>
                      <input
                        type="number"
                        name="abt_meter_11kv_MP"
                        value={scmData.abt_meter_11kv_MP}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>ABT Meter</td>
                    <td>33kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Madhya
                      Pradesh
                    </td>
                    <td>
                      <input
                        type="number"
                        name="abt_meter_33kv_MP"
                        value={scmData.abt_meter_33kv_MP}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>ABT Meter</td>
                    <td>11kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Other
                    </td>
                    <td>
                      <input
                        type="number"
                        name="abt_meter_11kv_Other"
                        value={scmData.abt_meter_11kv_Other}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td>ABT Meter</td>
                    <td>33kV</td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>State:</span> Other
                    </td>
                    <td>
                      <input
                        type="number"
                        name="abt_meter_33kv_Other"
                        value={scmData.abt_meter_33kv_Other}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr>

                  {/* <tr>
                    <td>29.</td>
                    <td>VCB Kiosk</td>
                    <td>As per DISCOM requirements</td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="vcb_kiosk"
                        value={scmData.vcb_kiosk}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Set</td>
                  </tr> */}

                  <tr>
                    <td>29.</td>
                    <td>SLNKO EPCM Service Charges</td>
                    <td>SLNKO FEE</td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        name="slnko_charges_scm"
                        value={scmData.slnko_charges_scm}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={{
                          width: "80%",
                          maxWidth: "300px",
                          padding: "10px",
                          fontSize: "1rem",
                          border: "2px solid #ddd",
                          borderRadius: "8px",
                          outline: "none",
                          boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease-in-out",
                        }}
                        placeholder="Enter Rate"
                        required
                        onFocus={(e) =>
                          (e.target.style.border = "2px solid #007bff")
                        }
                        onBlur={(e) =>
                          (e.target.style.border = "2px solid #ddd")
                        }
                      />
                    </td>
                    <td>INR/Wp</td>
                  </tr>
                </tbody>
                {/* <tfoot>
                  <tr>
                    <td colSpan={6}>
                      <Button type="submit" sx={{ mt: 1 }}>
                        Submit
                      </Button>
                    </td>
                  </tr>
                </tfoot> */}
                <tfoot>
                  <tr>
                    <td colSpan={6}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          sx={{
                            background:
                              "linear-gradient(135deg, #007bff, #0056b3)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            textTransform: "none",
                            boxShadow: "0px 3px 8px rgba(0, 123, 255, 0.3)",
                            transition: "all 0.3s ease-in-out",
                            minWidth: "150px",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #0056b3, #003580)",
                              transform: "translateY(-2px)",
                              boxShadow: "0px 6px 15px rgba(0, 123, 255, 0.5)",
                            },
                            "&:active": {
                              transform: "translateY(1px)",
                              boxShadow: "0px 2px 8px rgba(0, 123, 255, 0.3)",
                            },
                          }}
                        >
                          Update Data
                        </Button>
                      </Box>
                      <ToastContainer />
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Sheet>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Costing_Input;
