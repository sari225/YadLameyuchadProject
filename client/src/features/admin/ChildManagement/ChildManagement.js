import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useGetChildrenQuery } from "../../../api/childApi";
import { useGetClubsQuery } from "../../../api/clubApi";
import ChildRow from "./ChildRow";
import { parseServerError } from "../../../utils/errorHandler";
import AddChildDialog from "./AddChildDialog";
import {
    setSearchQuery,
    setSearchField,
    setShowPending,
} from "./ChildManagmentSlice";
import {
    calcAge,
    filterApprovedChildren,
    filterPendingChildren,
    createClubsDict,
    filterAndSortChildren,
    getChildClubs,
} from "./childManagementHelpers";
import "./style/childManagement.css";

const ChildManagement = () => {
    const dispatch = useDispatch();
    const { data: children = [], isLoading, isError, error, refetch } = useGetChildrenQuery();
    const { data: clubs = [] } = useGetClubsQuery();

    const searchQuery = useSelector((state) => state.childManagement.searchQuery);
    const searchField = useSelector((state) => state.childManagement.searchField);
    const showPending = useSelector((state) => state.childManagement.showPending);

    const approvedChildren = filterApprovedChildren(children);
    const pendingChildren = filterPendingChildren(children);
    const clubsDict = createClubsDict(clubs);
    const filteredApproved = filterAndSortChildren(approvedChildren, searchQuery, searchField, clubsDict);

    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const getChildClubsForChild = (child) => {
        return getChildClubs(child, clubsDict);
    };

    return (
        <Box className="child-management-container">
            <Typography variant="h4" className="page-title">
                ניהול ילדים
            </Typography>

            <Paper className="tabs-paper">
                <Box className="tabs-container">
                    <Button
                        onClick={() => dispatch(setShowPending(false))}
                        className={!showPending ? 'tab-btn active' : 'tab-btn'}
                    >
                        ילדים רשומים ({approvedChildren.length})
                    </Button>
                    <Button
                        onClick={() => dispatch(setShowPending(true))}
                        className={showPending ? 'tab-btn active' : 'tab-btn'}
                    >
                        בקשות הצטרפות ({pendingChildren.length})
                    </Button>
                </Box>
            </Paper>

            {!showPending && (
                <Paper className="search-paper">
                    <Box className="search-filter-stack">
                        {/* שדה חיפוש */}
                        <TextField
                            placeholder="הקלד לחיפוש..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            className="search-input"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon className="search-icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* סלקט */}
                        <FormControl className="search-select-wrapper">
                            <InputLabel>חיפוש לפי</InputLabel>
                            <Select
                                value={searchField}
                                label="חיפוש לפי"
                                onChange={(e) => dispatch(setSearchField(e.target.value))}
                            >
                                <MenuItem value="">הכל</MenuItem>
                                <MenuItem value="name">שם</MenuItem>
                                <MenuItem value="educationInstitution">מוסד לימודי</MenuItem>
                                <MenuItem value="age">גיל</MenuItem>
                                <MenuItem value="dateOfBirth">תאריך לידה</MenuItem>
                                <MenuItem value="clubs">מועדוניות</MenuItem>
                            </Select>
                        </FormControl>

                        {/* כפתור הוספה */}
                        <Button
                            variant="contained"
                            onClick={() => setAddDialogOpen(true)}
                            className="add-child-button"
                        >
                            <AddIcon />
                        </Button>
                    </Box>
                </Paper>
            )}

            <Paper>
                {isLoading ? (
                    <Box p={3}>טוען נתונים...</Box>
                ) : isError ? (
                    <Box p={3} color="error.main">{parseServerError(error, "שגיאה")}</Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow className="table-header-row">
                                    <TableCell className="header-cell header-cell-expand" />
                                    <TableCell className="header-cell header-cell-name">שם</TableCell>
                                    <TableCell className="header-cell header-cell-id">ת.ז</TableCell>
                                    <TableCell className="header-cell header-cell-phone">טלפון</TableCell>
                                    <TableCell className="header-cell header-cell-age">גיל</TableCell>
                                    <TableCell className="header-cell header-cell-actions">פעולות</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {showPending ? (
                                    pendingChildren.length > 0 ? (
                                        pendingChildren.map((child) => (
                                            <ChildRow key={child._id} child={child} childClubs={getChildClubsForChild(child)} onDeleted={refetch} isPending={true} />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>אין בקשות ממתינות</TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    filteredApproved.length > 0 ? (
                                        filteredApproved.map((child) => (
                                            <ChildRow key={child._id} child={child} childClubs={getChildClubsForChild(child)} onDeleted={refetch} isPending={false} />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>לא נמצאו ילדים</TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <AddChildDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onSuccess={refetch}
            />
        </Box>
    );
};

export default ChildManagement;
