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
    Collapse,
    Button,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useGetChildrenQuery, useDeleteChildMutation } from "../../../api/childApi";
import { useGetClubsQuery } from "../../../api/clubApi";
import { useApproveChildMutation } from "../../../api/authApi";
import ChildDetails from "./ChildDetails";
import { parseServerError } from "../../../utils/errorHandler";
import EditChildDialog from "./EditChildDialog";
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
import "./childManagement.css";


const Row = ({ child, childClubs, onDeleted, isPending }) => {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteChild, { isLoading: isDeleting }] = useDeleteChildMutation();
    const [approveChild, { isLoading: isApproving }] = useApproveChildMutation();

    const handleDelete = async () => {
        try {
            await deleteChild(child._id).unwrap();
            setConfirmOpen(false);
            if (onDeleted) onDeleted();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleApprove = async () => {
        try {
            await approveChild(child._id).unwrap();
            if (onDeleted) onDeleted();
        } catch (e) {
            console.error("Approve failed", e);
        }
    };

    return (
        <>
            <TableRow hover>
                <TableCell sx={{ width: "5%", textAlign: "center" }}>
                    <IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: "23%", textAlign: "center" }}>{child.Fname} {child.Lname}</TableCell>
                <TableCell sx={{ width: "18%", textAlign: "center" }}>{child.childId}</TableCell>
                <TableCell sx={{ width: "27%", textAlign: "center" }}>{child.phone1}</TableCell>
                <TableCell sx={{ width: "27%", textAlign: "center" }}>{calcAge(child.dateOfBirth) || "-"}</TableCell>
                <TableCell sx={{ width: "12%", textAlign: "center" }}>
                    {isPending ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="אישור בקשה" arrow>
                                <IconButton
                                    color="success"
                                    onClick={handleApprove}
                                    disabled={isApproving || isDeleting}
                                    aria-label="approve"
                                >
                                    {isApproving ? <CircularProgress size={24} color="inherit" /> : <CheckIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="דחיית בקשה" arrow>
                                <IconButton
                                    color="error"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting || isApproving}
                                    aria-label="delete"
                                >
                                    {isDeleting ? <CircularProgress size={24} color="inherit" /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ) : (
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="עריכת ילד" arrow>
                                <IconButton
                                    color="primary"
                                    onClick={() => setEditOpen(true)}
                                    aria-label="edit"
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="מחיקת ילד" arrow>
                                <IconButton
                                    color="error"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting}
                                    aria-label="delete"
                                >
                                    {isDeleting ? <CircularProgress size={24} color="inherit" /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <ChildDetails child={child} childClubs={childClubs} />
                    </Collapse>
                </TableCell>
            </TableRow>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="delete-child-title">
                <DialogTitle id="delete-child-title" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    {isPending ? "אישור דחיה" : "אישור מחיקה"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ textAlign: 'right' }}>
                        {isPending
                            ? `?האם אתה בטוח שברצונך לדחות את בקשת ההצטרפות של ${child.Fname} ${child.Lname}`
                            : `?האם אתה בטוח שברצונך למחוק את הילד ${child.Fname} ${child.Lname}`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', direction: 'ltr' }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="primary">ביטול</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={18} color="inherit" /> : (isPending ? "דחיה סופית" : "מחיקה סופית")}
                    </Button>
                </DialogActions>
            </Dialog>

            <EditChildDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                child={child}
                onSuccess={onDeleted}
            />
        </>
    );
};


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
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>

                        {/* שדה חיפוש */}
                        <TextField
                            placeholder="חיפוש..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            className="search-input"
                            sx={{ flex: 1 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon className="search-icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* סלקט */}
                        <FormControl className="search-select-wrapper" sx={{ minWidth: 200 }}>
                            <Select
                                displayEmpty
                                id="search-field"
                                value={searchField}
                                onChange={(e) => dispatch(setSearchField(e.target.value))}
                                renderValue={(val) =>
                                    val
                                        ? {
                                              name: "שם",
                                              educationInstitution: "מוסד לימודי",
                                              age: "גיל",
                                              dateOfBirth: "תאריך לידה",
                                              clubs: "מועדוניות",
                                          }[val]
                                        : "כל השדות"
                                }
                            >
                                <MenuItem value="">כל השדות</MenuItem>
                                <MenuItem value="name">שם</MenuItem>
                                <MenuItem value="educationInstitution">מוסד לימודי</MenuItem>
                                <MenuItem value="age">גיל</MenuItem>
                                <MenuItem value="dateOfBirth">תאריך לידה</MenuItem>
                                <MenuItem value="clubs">מועדוניות</MenuItem>
                            </Select>
                        </FormControl>

                        {/* כפתור הוספה */}
                        <IconButton
                            className="add-child-button"
                            onClick={() => setAddDialogOpen(true)}
                        >
                            <AddIcon sx={{ fontSize: "2rem" }} />
                        </IconButton>
                    </Stack>
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
                                <TableRow sx={{ bgcolor: '#d21979ff' }}>
                                    <TableCell sx={{ width: '5%', fontWeight: 'bold', color: 'white', textAlign: 'center' }} />
                                    <TableCell sx={{ width: '23%', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>שם</TableCell>
                                    <TableCell sx={{ width: '18%', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>ת.ז</TableCell>
                                    <TableCell sx={{ width: '27%', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>טלפון</TableCell>
                                    <TableCell sx={{ width: '15%', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>גיל</TableCell>
                                    <TableCell sx={{ width: '12%', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>פעולות</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {showPending ? (
                                    pendingChildren.length > 0 ? (
                                        pendingChildren.map((child) => (
                                            <Row key={child._id} child={child} childClubs={getChildClubsForChild(child)} onDeleted={refetch} isPending={true} />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>אין בקשות ממתינות</TableCell>
                                        </TableRow>
                                    )
                                ) : (
                                    filteredApproved.length > 0 ? (
                                        filteredApproved.map((child) => (
                                            <Row key={child._id} child={child} childClubs={getChildClubsForChild(child)} onDeleted={refetch} isPending={false} />
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
