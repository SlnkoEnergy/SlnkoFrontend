import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React from "react";
import logo from "../../assets/Comm_offer/slnko.png";
import "../Commercial Offer/CSS/offer.css";

const Page7 = () => {
  return (
    <>
      <Grid
        sx={{
          width: "100%",
          // height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "@media print": {
            width: "210mm",
            height: "297mm",
            overflow: "hidden",
            margin: "0",
            padding: "0",
            pageBreakInside: "avoid",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: "60%",
            backgroundColor: "#F2F4F5",
            height: "1140px",
            width: "20%",
            zIndex: -1,
            "@media print": {
              height: "297mm !important",
              left: "67.59%",
              width: "40%",
            },
          }}
        ></Box>
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
            padding: "20px",
            "@media print": {
              width: "210mm",
              height: "297mm",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            <img
              className="logo-img2"
              width={"300px"}
              height={"180px"}
              alt="logo"
              src={logo}
            />

            <hr
              style={{
                width: "60%",
                borderTop: "3px solid #0f4C7f", // Keeps the line visible
                margin: "40px 0",
                boxShadow: "none !important", // Force removal of any shadow
                background: "transparent !important", // Ensure no background color
                border: "none !important", // Ensure no border shadow
                // Remove any outline if applied
              }}
              className="hr-line3"
            />
          </Box>
          <Sheet
            sx={{
              width: "100%",
              backgroundColor: "white",
            }}
          >
            <Table className="table-header1">
              <tbody>
                <tr>
                  <td style={{ width: "8%"}}>5</td>
                  <td >Module Mounting Structure (MMS) GA and part Drawing</td>
                  <td style={{ width: "18%" }}>Phase-01</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>6</td>
                  <td>MMS Foundation Design Calculations and Drawing</td>
                  <td style={{ width: "18%" }}>Phase-01</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>7</td>
                  <td>Pile Marking Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>8</td>
                  <td>DC Cable Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>9</td>
                  <td>DC Cable Losses Calculation</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>10</td>
                  <td>AC (LT & HT) Side Cable Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>11</td>
                  <td>AC (LT & HT) Cable Selection Calculation</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>12</td>
                  <td>Electrical Equipment Selection Calculations</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>13</td>
                  <td>Electrical Equipment Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>14</td>
                  <td>Lightening Arrestor Selection and Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>15</td>
                  <td>DC and AC Side Earthing Calculations</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>16</td>
                  <td>Earthing Pit GA Drawing</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>17</td>
                  <td>DC and AC Side Earthing Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>18</td>
                  <td>Module Cleaning Piping Sizing Calculation and Layout</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>19</td>
                  <td>Periphery Lighting and Camera Layout (if applicable)</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>20</td>
                  <td>Trench Layout and Design</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>21</td>
                  <td>Transformer Foundation Design and Drawing</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>22</td>
                  <td>Control Room Foundation Design and Drawings</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>23</td>
                  <td>Remote Monitoring System SLD (including WMS)</td>
                  <td style={{ width: "18%" }}>Phase-02</td>
                </tr>

                <tr>
                  <td style={{ width: "8%" }}>24</td>
                  <td>As-built Drawings</td>
                  <td style={{ width: "18%" }}>Phase-03</td>
                </tr>

                <tr>
                  <td
                    colSpan={3}
                    style={{
                      border: "none",
                      textAlign: "center",
                      padding: "12px",
                    }}
                  >
                    <Typography
                      fontSize="1.4rem"
                      fontWeight="300"
                      fontFamily="serif"
                      sx={{
                      '@media print':{
                        fontSize:'1.1rem'
                      }
                    }}
                    >
                      <strong>NOTE:</strong> All the above design and documents
                      are the general ones required for execution. However, if
                      there is any specific requirement raised by the
                      authority/client for any document not mentioned in the
                      list, SLNKO will be providing the same.
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Page7;