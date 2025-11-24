import React, { useState } from "react";
import {
    TableRow,
    TableCell,
    IconButton,
    Collapse,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Tooltip,
    Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
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
            <TableRow hover className="child-row">
                <TableCell className="child-row-cell-icon">
                    <IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell className="child-row-cell-name">{child.Fname} {child.Lname}</TableCell>
                <TableCell className="child-row-cell-id">{child.childId}</TableCell>
                <TableCell className="child-row-cell-phone">{child.phone1}</TableCell>
                <TableCell className="child-row-cell-age">{calcAge(child.dateOfBirth) || "-"}</TableCell>
                <TableCell className="child-row-cell-actions">
                    {isPending ? (
                        <Box className="child-actions-stack">
                            <Tooltip title="אישור בקשה" arrow>
                                <IconButton
                                    className="approve-icon-button"
                                    onClick={handleApprove}
                                    disabled={isApproving || isDeleting}
                                    aria-label="approve"
                                >
                                    {isApproving ? <CircularProgress size={24}  /> : <CheckIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="דחיית בקשה" arrow>
                                <IconButton
                                    className="delete-icon-button"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting || isApproving}
                                    aria-label="delete"
                                >
                                    {isDeleting ? <CircularProgress size={24}  /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box className="child-actions-stack">
                            <Tooltip title="עריכת ילד" arrow>
                                <IconButton
                                    className="edit-icon-button"
                                    onClick={() => setEditOpen(true)}
                                    aria-label="edit"
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="מחיקת ילד" arrow>
                                <IconButton
                                    className="delete-icon-button"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isDeleting}
                                    aria-label="delete"
                                >
                                    {isDeleting ? <CircularProgress size={24} color="inherit" /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell className="child-collapse-cell" colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <ChildDetails child={child} childClubs={childClubs} />
                    </Collapse>
                </TableCell>
            </TableRow>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                aria-labelledby="delete-child-title"
                PaperProps={{
                    className: "admin-management-container",
                    sx: {
                        borderRadius: '20px',
                        '@media (max-width: 768px)': {
                            width: '95%',
                            maxWidth: '450px',
                            margin: '16px',
                            borderRadius: '20px'
                        }
                    }
                }}
            >
                <DialogTitle className="dialog-title">
                    <Typography variant="h5" className="dialog-title-text">
                        {isPending ? "אישור דחיה" : "אישור מחיקה"}
                    </Typography>
                    <IconButton onClick={() => setConfirmOpen(false)} className="dialog-close-button">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {isPending
                            ? `האם אתה בטוח שברצונך לדחות את בקשת ההצטרפות של ${child.Fname} ${child.Lname}?`
                            : <>האם אתה בטוח שברצונך למחוק את הילד <strong>{child.Fname} {child.Lname}</strong>?</>
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>
                        ביטול
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <CircularProgress size={24} /> : (isPending ? "דחיה סופית" : "מחק")}
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