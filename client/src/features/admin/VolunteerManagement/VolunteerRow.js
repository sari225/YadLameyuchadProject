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
	Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
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
		<Dialog 
			open={confirmOpen} 
			onClose={() => setConfirmOpen(false)} 
			aria-labelledby="delete-volunteer-title"
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
					אישור מחיקה
				</Typography>
				<IconButton onClick={() => setConfirmOpen(false)} className="dialog-close-button">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Typography>
					האם אתה בטוח שברצונך למחוק את המתנדבת{" "}
					<strong>{volunteer.fname} {volunteer.lname}</strong>?
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setConfirmOpen(false)}>ביטול</Button>
				<Button
					onClick={handleDelete}
					variant="contained"
					color="error"
					disabled={isDeleting}
				>
					{isDeleting ? <CircularProgress size={24} /> : "מחק"}
				</Button>
			</DialogActions>
		</Dialog>			{/* דיאלוג עריכה */}
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
