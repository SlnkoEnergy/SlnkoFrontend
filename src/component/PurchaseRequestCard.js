import { Box, Table } from "@mui/joy";
import Typography from "@mui/joy/Typography";

const PurchaseRequestCard = () => {
  
    
  return (
    <Box sx={{ p: 2, borderRadius: "md", boxShadow: "sm", maxWidth: 800, mx: "auto" }}>
      <Table
        borderAxis="none"
        hoverRow={false}
        size="sm"
        variant="plain"
        sx={{ "--TableCell-paddingY": "8px", "--TableCell-paddingX": "12px" }}
      >
        <thead>
          <tr>
            <th>
              <Typography level="body-sm" color="neutral">PR No</Typography>
            </th>
            <th>
              <Typography level="body-sm" color="neutral">Created On</Typography>
            </th>
            <th>
              <Typography level="body-sm" color="neutral">Created By</Typography>
            </th>
            <th>
              <Typography level="body-sm" color="neutral">Live Status</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#PR-108</td>
            <td>04 July 2025</td>
            <td>Siddharth Singh</td>
            <td>
              <Typography color="success">Live</Typography>
            </td>
            
          </tr>
          <tr>
            <td>#PR-108</td>
            <td>04 July 2025</td>
            <td>Siddharth Singh</td>
            <td>
              <Typography color="success">Live</Typography>
            </td>
            
          </tr>
          <tr>
            <td>#PR-108</td>
            <td>04 July 2025</td>
            <td>Siddharth Singh</td>
            <td>
              <Typography color="success">Live</Typography>
            </td>
            
          </tr>
        </tbody>
      </Table>
    </Box>
  );
};

export default PurchaseRequestCard;
