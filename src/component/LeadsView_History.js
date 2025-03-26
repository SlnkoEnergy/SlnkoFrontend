import React, { useEffect, useMemo, useState } from 'react';
import { Table, Sheet, Typography, Box, Divider } from '@mui/joy';
import Img1 from "../assets/follow_up_history.png";
import { useGetEntireLeadsQuery } from '../redux/leadsSlice';
import { useGetTasksHistoryQuery } from '../redux/tasksSlice';
import { useGetLoginsQuery } from '../redux/loginSlice';

const FollowUpHistory = () => {
    const { data: getLead = {} } = useGetEntireLeadsQuery();
    const { data: getTask = [] } = useGetTasksHistoryQuery();
    const { data: usersData = [], isLoading: isFetchingUsers } = useGetLoginsQuery();

    const getTaskArray = useMemo(() => Array.isArray(getTask) ? getTask : getTask?.data || [], [getTask]);
    
    const getLeadArray = useMemo(() => [
        ...(getLead?.lead?.initialdata || []),
        ...(getLead?.lead?.followupdata || []),
        ...(getLead?.lead?.warmdata || []),
        ...(getLead?.lead?.wondata || []),
        ...(getLead?.lead?.deaddata || []),
    ], [getLead]);

    const LeadId = localStorage.getItem("view_history");
    
    const lead = getLeadArray.find(lead => String(lead.id) === LeadId) || null;
    const filteredTasks = getTaskArray.filter(task => String(task.id) === LeadId);

    const bdMembers = useMemo(() => {
        return (usersData?.data || [])
            .filter(user => user.department === "BD")
            .map(member => ({ label: member.name, id: member._id }));
    }, [usersData]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const userSessionData = localStorage.getItem("userDetails");
        if (userSessionData) {
            setUser(JSON.parse(userSessionData));
        }
    }, []);

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Box textAlign="center" mb={3}>
                <img src={Img1} alt="Follow Up" style={{ width: 60 }} />
                <Typography level="h2" sx={{ color: '#D78827', fontWeight: 'bold' }}>
                    View History
                </Typography>
            </Box>

            {lead ? (
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
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976D2' }}>
                        Client Information
                    </Typography>
                    <Divider />
                    <Typography sx={{ fontSize: '1.1rem', color: '#333' }}>
    <strong>Client Name:</strong> {lead.c_name || "N/A"} &nbsp;| &nbsp;&nbsp; 
    <strong>POC:</strong> {user?.name || "N/A"} &nbsp;| &nbsp;&nbsp;  {/* Updated this line */}
    <strong>Company:</strong> {lead.company || "N/A"} &nbsp;| &nbsp;&nbsp; 
    <strong>Location:</strong> {lead.state || "N/A"}
</Typography>

                </Sheet>
            ) : (
                <Typography textAlign="center" color="error">
                    No lead data found.
                </Typography>
            )}

            <Sheet variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table 
                    borderAxis="both" 
                    size="lg" 
                    sx={{ 
                        '& th': { backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '1.1rem' }, 
                        '& td': { fontSize: '1rem' } 
                    }}
                >
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>By Whom</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.date || "N/A"}</td>
                                    <td>{row.reference || "N/A"}</td>
                                    <td>{row.by_whom || "N/A"}</td>
                                    <td>{row.comment || "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '10px', fontStyle: 'italic' }}>
                                    No task history available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Sheet>
        </Box>
    );
};

export default FollowUpHistory;
