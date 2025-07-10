import React from 'react';
import {
  Table,
  Sheet,
  Typography,
  Checkbox,
  Box,
} from '@mui/joy';

const MaterialScope = () => {
  return (
   <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: "flex",
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          maxHeight: "70vh",
          fontSize:"14px",
          maxWidth: "100%"
        }}
      >
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
                <Checkbox
                  size="sm"
                  
                />
              </Box>
              {[
                "Item",
                "Scope",
                "PR No",
                "Status"
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize:"14px",
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
           
                <Box
                  component="tr"
                  sx={{
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize:"14px",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      color="primary"
                     
                    />
                  </Box>
                  
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px dotted #888",
                        padding: "8px",
                        textAlign: "left",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      
                    >
                      
                    </Box>
                 

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                   
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                   
                  </Box>
                  
                 
                 

                 
                </Box>
              
          </Box>
        </Box>
      </Sheet>
  );
};

export default MaterialScope;
