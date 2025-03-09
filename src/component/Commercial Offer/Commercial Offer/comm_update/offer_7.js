import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/Comm_offer/slnko.png";
import "../CSS/offer.css";

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
            width: "100%",
            height: "100%",
            overflow: "hidden",
            margin: "0",
            padding: "0",
            pageBreakInside: "avoid",
          },
        }}
      >
        {/* <Box
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
        ></Box> */}
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
            padding: "10px",
            "@media print": {
              width: "100%",
              height: "98vh",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              gap: 2,
              marginTop: "2%",
            }}
          >
            <img
              width={"220px"}
              height={"110px"}
              alt="logo"
              src={logo}
              loading="lazy"
            />

            <hr
              style={{
                width: "60%",
                color: "blue",
                borderTop: "2px solid #0f4C7f",
                margin: "19px 0",
              }}
            />
          </Box>


          <Sheet
            sx={{
              width: "100%",
              backgroundColor: "white",
            }}
          >
            <Table className="table-header1" sx={{
               "@media print": {
                fontSize: "1.2rem"
              }
            }}>
              <tbody>
                <tr>
                  <td style={{textAlign:"center"}}>5</td>
                  <td >Module Mounting Structure (MMS) GA and part Drawing</td>
                  <td>Phase-01</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>6</td>
                  <td>MMS Foundation Design Calculations and Drawing</td>
                  <td>Phase-01</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>7</td>
                  <td>Pile Marking Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>8</td>
                  <td>DC Cable Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}} >9</td>
                  <td>DC Cable Losses Calculation</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>10</td>
                  <td>AC (LT & HT) Side Cable Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>11</td>
                  <td>AC (LT & HT) Cable Selection Calculation</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>12</td>
                  <td>Electrical Equipment Selection Calculations</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>13</td>
                  <td>Electrical Equipment Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>14</td>
                  <td>Lightening Arrestor Selection and Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>15</td>
                  <td>DC and AC Side Earthing Calculations</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>16</td>
                  <td>Earthing Pit GA Drawing</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>17</td>
                  <td>DC and AC Side Earthing Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>18</td>
                  <td>Module Cleaning Piping Sizing Calculation and Layout</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>19</td>
                  <td>Periphery Lighting and Camera Layout (if applicable)</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>20</td>
                  <td>Trench Layout and Design</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>21</td>
                  <td>Transformer Foundation Design and Drawing</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>22</td>
                  <td>Control Room Foundation Design and Drawings</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>23</td>
                  <td>Remote Monitoring System SLD (including WMS)</td>
                  <td>Phase-02</td>
                </tr>

                <tr>
                  <td style={{textAlign:"center"}}>24</td>
                  <td>As-built Drawings</td>
                  <td>Phase-03</td>
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
                      textAlign={"justify"}
                      sx={{
                      '@media print':{
                        fontSize:'1.3rem'
                      }
                    }}
                    >
                      <strong>NOTE:</strong> The above designs and documents
                      are the standard requirements for execution. However, if
                      the authority or client requests any additional documents
                      not listed, SLNKO will provide them as required.
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