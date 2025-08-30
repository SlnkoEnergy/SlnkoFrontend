import {
    Typography,
    Table,
    Sheet,
    FormControl,
    FormLabel,
    Input,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Checkbox from "@mui/joy/Checkbox";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

const UserDataTable = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState([]);

    const headers = [
        "Name",
        "Email",
        "Role",
        "Sub Role",
        "Department",
        "Reporting Manager",
    ];

    const data = [
        {
            name: "Sidharth",
            Email: "sidharth@gmail.com",
            Role: "IT",
            Sub_Role: "Manager",
            Department: "IT",
            Reporting_Manager: "Raunik",
        },
        {
            name: "Raunik",
            Email: "raunik@gmail.com",
            Role: "IT",
            Sub_Role: "CEO",
            Department: "IT",
            Reporting_Manager: "Director",
        },
        {
            name: "Sarvesh",
            Email: "sarvesh@gmail.com",
            Role: "IT",
            Sub_Role: "Director",
            Department: "IT",
            Reporting_Manager: "God",
        },
    ];

    const filteredData = data.filter((row) => {
        return (
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.Role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.Department.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allIds = filteredData.map((row) => row.name); // Assuming unique `name` here, replace with `_id` if applicable.
            setSelectedUser(allIds);
        } else {
            setSelectedUser([]);
        }
    };

    const handleRowSelect = (name) => {
        setSelectedUser((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name]
        );
    };

    return (
        <>
            <Box
                className="searchuser"
                sx={{
                    marginLeft: { xl: "15%", lg: "18%" },
                    borderRadius: "sm",
                    py: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    "& > *": {
                        minWidth: { xs: "120px", md: "160px" },
                    },
                }}
            >
                <FormControl sx={{ flex: 1 }} size="sm">
                    <FormLabel>Search</FormLabel>
                    <Input
                        size="sm"
                        placeholder="Search by Name, Dept., Email"
                        startDecorator={<SearchIcon />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </FormControl>
            </Box>

            <Sheet
                variant="outlined"
                sx={{
                    display: "flex",
                    width: "100%",
                    borderRadius: "12px",
                    flexShrink: 1,
                    overflow: "auto",
                    minHeight: 0,
                    marginLeft: { xl: "15%", lg: "18%" },
                    maxWidth: { lg: "85%", sm: "100%" },
                }}
            >
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                    <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
                        <Box component="tr">
                            <Box
                                component="th"
                                sx={{
                                    borderBottom: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "left",
                                }}
                            >
                                <Checkbox
                                    size="sm"
                                    checked={selectedUser.length === filteredData.length}
                                    onChange={handleSelectAll}
                                />
                            </Box>
                            {headers.map((header, index) => (
                                <Box
                                    component="th"
                                    key={index}
                                    sx={{
                                        borderBottom: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {header}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box component="tbody">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, index) => (
                                <Box
                                    component="tr"
                                    key={index}
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
                                        }}
                                    >
                                        <Checkbox
                                            size="sm"
                                            color="primary"
                                            checked={selectedUser.includes(row.name)} // Use unique identifier here
                                            onChange={() => handleRowSelect(row.name)}
                                        />
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.name}
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.Email}
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.Role}
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.Sub_Role}
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.Department}
                                    </Box>
                                    <Box component="td" sx={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                                        {row.Reporting_Manager}
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Box component="tr">
                                <Box
                                    component="td"
                                    colSpan={headers.length + 1}
                                    sx={{ padding: "8px", textAlign: "center" }}
                                >
                                    <Typography>No records found</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Sheet>
        </>
    );
};

export default UserDataTable;
