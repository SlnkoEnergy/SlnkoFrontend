import { Box, Button, Grid, Sheet, Table, Typography } from "@mui/joy";
import React from "react";
import "./Commercial Offer/CSS/offer.css";

const Costing_Input = () => {
   const handleSubmit = () =>{

   }


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
        sx={{
          height: "100%",
        }}
      >
        {/* Logo Section */}
        {/* <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "flex-end",

            gap: 2,
          }}
        >
          <img width={"220px"} height={"110px"} alt="logo" src={logo} />
          <hr
            style={{
              width: "60%",
              color: "blue",
              borderTop: "3px solid #0f4C7f",
              margin: "19px 0",
            }}
          />
        </Box> */}

        {/* Title Section */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",

            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "#56A4DA",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: "bolder",
              textDecoration: "underline rgb(243, 182, 39)",
              textDecorationThickness: "3px",
              textUnderlineOffset: "6px",
            }}
          >
            Reference&nbsp;{" "}
          </Typography>
          <Typography
            sx={{
              color: "black",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: "bolder",
              textDecoration: "underline rgb(243, 182, 39)",
              textDecorationThickness: "3px",
              textUnderlineOffset: "6px",
            }}
          >
            Material List
          </Typography>
        </Box> */}

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
            <Table className="table-header">
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
                    Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag
                    inside module, Product Warranty upto 12 Years and
                    Performance Warranty Upto 27/30 Year.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag
                    inside module, Product Warranty upto 12 Years and
                    Performance Warranty Upto 27/30 Year.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag
                    inside module, Product Warranty upto 12 Years and
                    Performance Warranty Upto 27/30 Year.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag
                    inside module, Product Warranty upto 12 Years and
                    Performance Warranty Upto 27/30 Year.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Efficiency-98% or above. 5 years warranty shall be provided
                    by Manufacturer.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Nos.</td>
                </tr>
                <tr>
                  <td>3.</td>
                  <td>Module Mounting Structure</td>
                  <td>2PX12 Table</td>
                  <td>
                    MMS Shall be designed for wind speed as per IS 875 Part 3
                    and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                    conform to IS 15961, Column (YS-250) shall conform to IS
                    2062 & HDG shall conform to IS 4759.1996 and . Exact
                    Sections shall be decided at the time of detailed
                    engineering. Depth of pile foundation shall be decided after
                    soil tests.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Kg</td>
                </tr>

                <tr>
                  <td></td>
                  <td>Module Mounting Structure</td>
                  <td>4LX6 Table</td>
                  <td>
                    MMS Shall be designed for wind speed as per IS 875 Part 3
                    and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                    conform to IS 15961, Column (YS-250) shall conform to IS
                    2062 & HDG shall conform to IS 4759.1996 and . Exact
                    Sections shall be decided at the time of detailed
                    engineering. Depth of pile foundation shall be decided after
                    soil tests.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Kg</td>
                </tr>

                <tr>
                  <td></td>
                  <td>Module Mounting Structure</td>
                  <td>2Px24 Table</td>
                  <td>
                    MMS Shall be designed for wind speed as per IS 875 Part 3
                    and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                    conform to IS 15961, Column (YS-250) shall conform to IS
                    2062 & HDG shall conform to IS 4759.1996 and . Exact
                    Sections shall be decided at the time of detailed
                    engineering. Depth of pile foundation shall be decided after
                    soil tests.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Kg</td>
                </tr>

                <tr>
                  <td>4.</td>
                  <td>Module Mounting & MMS Hardware</td>
                  <td>SS304, HDG Grade 8.8</td>
                  <td>
                    SS304 for Module to Purlin Mounting & HDG Grade 8.8 for all
                    other connections
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Wp</td>
                </tr>

                <tr>
                  <td>5.</td>
                  <td>DC Cable (Solar Module to Inverter)</td>
                  <td>
                    1C x 4 sqmm Cu flexible copper conductor solar DC cable (Red
                    & Black)
                  </td>
                  <td>
                    {" "}
                    Flexible copper conductor solar DC cable, Fine wire strands
                    of annealed tinned copper, Rated 1.5 kV DC, Electron Beam
                    Cross Linked Co-polymer(XLPO) Halogen Free Insulation and
                    outer sheath, Black color and Red Colour, DC cables
                    complying to EN50618, TUV 2PFG 1169 for service life
                    expectency of 25 years. Flame retardent, UV resistent
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/m</td>
                </tr>

                <tr>
                  <td>16.</td>
                  <td>Earthing Station</td>
                  <td>
                    Maintenance Free Earth Electrode with Chemical Earthing Set{" "}
                  </td>
                  <td>
                    The earthing for array and LT power system shall be made of
                    3 mtr long , 17.2 mm dia, Copper Bonded , thickness of 250
                    microns, chemical compound filled, double walled earthing
                    electrodes including accessories, and providing masonry
                    enclosure with cast iron cover plate having pad-locking
                    arrangement, watering pipe using charcoal or coke and salt
                    as required as per provisions of IS: 3043
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/m</td>
                </tr>

                <tr>
                  <td>19.</td>
                  <td>Lightening Arrestor</td>
                  <td>107 Mtr Dia over 7 Mtr High Mast with counter</td>
                  <td>
                    ESE type as per NFC 17-102, ESE are considered with 107 Mtr
                    Dia over 7 Mtr High Mast with counter
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                    Termination Kits, Conduits, Cable Tie, Ferruls, Sleeves, PU
                    Foam, Route Marker, Danger boards and signages, Double
                    Warning Tape, & Fire Fighting System
                  </td>
                  <td>-</td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Set</td>
                </tr>
                <tr>
                  <td colSpan={6} style={{fontWeight:"bold", fontSize:"2rem"}}>CIVIL WORKS</td>
                </tr>
                <tr>
                  <td>24.</td>
                  <td>Installation and commissioing</td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>LABOUR WORKS:</span>{" "}
                    Includes Pile casting, Module Mounting & Alignment, and
                    complete AC-DC work till commissioning inside plant boundary
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Wp</td>
                </tr>

                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>CIVIL MATERIAL:</span>{" "}
                    Cement, Aggregates, Bricks, Sand & Iron Bars
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Vehicle</td>
                </tr>

                <tr>
                  <td>26.</td>
                  <td>Transmission Line</td>
                  <td>
                    11 kV Transmission Line with appropriate conductor size and
                    PCC Poles
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Km</td>
                </tr>

                <tr>
                  <td></td>
                  <td>Transmission Line</td>
                  <td>
                    33 kV Transmission Line with appropriate conductor size and
                    PCC Poles.
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
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
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Set</td>
                </tr>

                <tr>
                  <td>29.</td>
                  <td>VCB Kiosk</td>
                  <td>As per DISCOM requirements</td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Set</td>
                </tr>

                <tr>
                  <td>30.</td>
                  <td>RMS at Substation side</td>
                  <td>As per DISCOM requirements</td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Set</td>
                </tr>

                <tr>
                  <td>31.</td>
                  <td>Plant Insurance</td>
                  <td>Transit & EAR</td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR</td>
                </tr>

                <tr>
                  <td>32.</td>
                  <td>SLNKO EPCM Service Charges</td>
                  <td>SLNKO FEE</td>
                  <td></td>
                  <td>
                    <input
                      type="number"
                      style={{
                        width: "80%",
                        padding: "5px",
                        fontSize: "1rem",
                      }}
                      placeholder="Enter Rate"
                    />
                  </td>
                  <td>INR/Wp</td>
                </tr>
              </tbody>
              <tfoot>
                <td colSpan={6}>
                <Button type="submit" sx={{ mt: 1 }}>
                    Submit
                  </Button>
                </td>
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