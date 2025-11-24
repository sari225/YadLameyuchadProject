import React, { useState } from "react";
import {
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import { useDeleteChildMutation } from "../../../api/childApi";
import { useApproveChildMutation } from "../../../api/authApi";
import ChildDetails from "./ChildDetails";
import EditChildDialog from "./EditChildDialog";
import { calcAge } from "./childManagementHelpers";

const ChildRow = ({ child, childClubs, onDeleted, isPending }) => {
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
                                    sx={{ color: '#87c8d2' }}
                                    onClick={handleApprove}
                                    disabled={isApproving || isDeleting}
                                    aria-label="approve"
                                >
                                    {isApproving ? <CircularProgress size={24}  /> : <CheckIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="דחיית בקשה" arrow>
                                <IconButton
                                    color="error"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting || isApproving}
                                    aria-label="delete"
                                >
                                    {isDeleting ? <CircularProgress size={24}  /> : <DeleteIcon />}
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

export default ChildRow;