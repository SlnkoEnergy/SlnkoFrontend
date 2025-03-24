import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Sheet, Typography, Box, Divider } from '@mui/joy';
import Img1 from "../assets/follow_up_history.png";




const FollowUpHistory = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/followup-history'); // Replace with your API endpoint
                setData(response.data);
                console.log('Fetched Data:', response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box textAlign="center" mb={3}>
                <img src={Img1} alt="Follow Up" style={{ width: 60 }} />
                <Typography level="h2" sx={{ color: '#D78827', fontWeight: 'bold' }}>Follow Up History</Typography>
            </Box>

            <Sheet
                variant="soft"
                sx={{ 
                    p: 3, 
                    mb: 2, 
                    backgroundColor: '#e3f2fd',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}
            >
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976D2' }}>Client Information</Typography>
                <Divider />
                <Typography sx={{ fontSize: '1.1rem', color: '#333' }}>
                    <strong>Client Name:</strong> Ramesh &nbsp;| &nbsp;&nbsp; 
                    <strong>POC:</strong> Shambhavi &nbsp;| &nbsp;&nbsp; 
                    <strong>Company:</strong> Charlie Pvt.Ltd &nbsp;| &nbsp;&nbsp; 
                    <strong>Location:</strong> Rajasthan
                </Typography>
            </Sheet>

            <Sheet variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table borderAxis="both" size="lg" sx={{ '& th': { backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '1.1rem' }, '& td': { fontSize: '1rem' } }}>
                    <thead>
                        <tr>
                            <th>FollowUp</th>
                            <th>Comments</th>
                            <th>Reference</th>
                            <th>Involvements</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.followUp}</td>
                                <td>{row.comments}</td>
                                <td>{row.reference}</td>
                                <td>{row.involvement}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Sheet>
        </Box>
    );
};

export default FollowUpHistory;