import React, { useState } from "react";
import {
	TableRow,
	TableCell,
	IconButton,
	Collapse,
	Button,
	Box,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useDeleteVolunteerMutation } from "../../../api/volunteerApi";
import { calculateAge } from "./helpers";
import VolunteerDetails from "./VolunteerDetails";
import EditVolunteerDialog from "./EditVolunteerDialog";
import "./styles/VolunteerManagement.css";

const VolunteerRow = ({ volunteer, onDeleted }) => {
	const [open, setOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteVolunteer, { isLoading: isDeleting }] = useDeleteVolunteerMutation();

	const handleDelete = async () => {
		try {
			await deleteVolunteer(volunteer._id).unwrap();
			setConfirmOpen(false);
			if (onDeleted) onDeleted();
		} catch (e) {
			console.error("Delete failed", e);
		}
	};

	return (
		<>
			<TableRow hover className="volunteer-row">
				<TableCell className="volunteer-row-cell-icon">
					<IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell className="volunteer-row-cell-name">
					{volunteer.fname} {volunteer.lname}
				</TableCell>
				<TableCell className="volunteer-row-cell-id">{volunteer.id}</TableCell>
				<TableCell className="volunteer-row-cell-phone">{volunteer.phone}</TableCell>
				<TableCell className="volunteer-row-cell-school">{volunteer.school}</TableCell>
				<TableCell className="volunteer-row-cell-age">
					{calculateAge(volunteer.dateBorn)}
				</TableCell>
				<TableCell className="volunteer-row-cell-clubs">
					{volunteer.clubs?.length || 0}
				</TableCell>
				<TableCell className="volunteer-row-cell-actions">
					<Box className="volunteer-actions-stack">
						<Tooltip title="עריכת מתנדבת" arrow>
							<IconButton
								className="edit-icon-button"
								onClick={() => setEditOpen(true)}
								aria-label="edit"
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="מחיקת מתנדבת" arrow>
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
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell className="volunteer-collapse-cell" colSpan={8}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<VolunteerDetails volunteer={volunteer} onUpdated={onDeleted} />
					</Collapse>
				</TableCell>
			</TableRow>

			{/* דיאלוג אישור מחיקה */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="delete-volunteer-title">
				<DialogTitle id="delete-volunteer-title" className="volunteer-dialog-title">
					אישור מחיקה
				</DialogTitle>
				<DialogContent>
					<DialogContentText className="volunteer-dialog-content">
						האם אתה בטוח שברצונך למחוק את המתנדבת {volunteer.fname} {volunteer.lname}?
					</DialogContentText>
				</DialogContent>
				<DialogActions className="volunteer-dialog-actions">
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" color="primary">
						ביטול
					</Button>
					<Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting}>
						{isDeleting ? <CircularProgress size={18} color="inherit" /> : "מחיקה סופית"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* דיאלוג עריכה */}
			<EditVolunteerDialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				volunteer={volunteer}
				onSuccess={onDeleted}
			/>
		</>
	);
};

export default VolunteerRow;
