import React, { useState } from "react";
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
	CircularProgress,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useGetClubsQuery, useDeleteClubMutation } from "../../../api/clubApi";
import { useNavigate } from "react-router-dom";
import AddClubDialog from "./AddClubDialog";
import EditClubDialog from "./EditClubDialog";
import "./styles/ClubManagement.css";
import "../ManagementPanel/styles/AdminManagement.css";
import { parseServerError } from "../../../utils/errorHandler";

const ClubManagement = () => {
	const navigate = useNavigate();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedClubForDelete, setSelectedClubForDelete] = useState(null);
	const [selectedClubForEdit, setSelectedClubForEdit] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const { data: clubs = [], isLoading, isError, error, refetch } = useGetClubsQuery();
	const [deleteClub, { isLoading: isDeleting }] = useDeleteClubMutation();

	const handleDeleteClub = (club) => {
		setSelectedClubForDelete(club);
		setDeleteError("");
		setDeleteDialogOpen(true);
	};

	const confirmDeleteClub = async () => {
		setDeleteError("");
		try {
			await deleteClub(selectedClubForDelete._id).unwrap();
			setDeleteDialogOpen(false);
			setSelectedClubForDelete(null);
			refetch();
		} catch (error) {
			console.error("Failed to delete club:", error);
			setDeleteError(error.data?.message || "שגיאה במחיקת מועדונית");
		}
	};

	const handleViewClub = (clubId) => {
		navigate(`/admin/clubsManagement/${clubId}`);
	};

	if (isLoading) {
		return (
			<Box className="club-management-loading">
				<CircularProgress size={60} />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box className="club-management-error">
				<Typography color="error" variant="h6">
					שגיאה בטעינת נתוני המועדוניות
				</Typography>
				<Typography color="error">{parseServerError(error, "שגיאה בטעינת נתוני המועדוניות")}</Typography>
			</Box>
		);
	}

	return (
		<Box className="club-management-container">
			{/* כותרת */}
			<Typography variant="h4" className="club-management-header-title">
				ניהול מועדוניות
			</Typography>

			{/* כפתור הוספה */}
			<Box className="club-management-button-container">
				<Button
					variant="contained"
					onClick={() => setAddDialogOpen(true)}
					className="club-management-add-button"
				>
					<AddIcon />
					הוסף מועדונית חדשה
				</Button>
			</Box>

			<TableContainer component={Paper} className="club-management-table-container">
				<Table className="club-management-table">
					<TableHead>
						<TableRow className="club-management-table-header">
							<TableCell className="club-management-table-cell">שם המועדונית</TableCell>
							<TableCell className="club-management-table-cell">יום פעילות</TableCell>
							<TableCell className="club-management-table-cell">שעות</TableCell>
							<TableCell className="club-management-table-cell">מיקום</TableCell>
							<TableCell className="club-management-table-cell">ילדים</TableCell>
							<TableCell className="club-management-table-cell">מתנדבות</TableCell>
							<TableCell className="club-management-table-cell">בקשות ממתינות</TableCell>
							<TableCell className="club-management-table-cell">פעולות</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clubs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="club-management-empty">
									<Box className="club-management-empty-message">
										<Typography className="club-management-empty-text">
											אין מועדוניות במערכת
										</Typography>
										<Typography className="club-management-empty-subtitle">
											התחל בהוספת מועדונית חדשה
										</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							clubs.map((club) => (
								<TableRow 
									key={club._id} 
									hover
									className="club-management-table-body-row"
									onClick={() => handleViewClub(club._id)}
								>
									<TableCell className="club-management-table-body-cell">{club.name}</TableCell>
									<TableCell className="club-management-table-body-cell">{club.activityDay}</TableCell>
									<TableCell className="club-management-table-body-cell">
										{club.startTime} - {club.endTime}
									</TableCell>
									<TableCell className="club-management-table-body-cell">{club.location}</TableCell>
									<TableCell className="club-management-table-body-cell">
										{club.registeredChildren?.length > 0 ? (
											<Chip
												label={club.registeredChildren.length}
												color="primary"
												size="small"
											/>
										) : (
											<Typography variant="body2" color="text.secondary">
												0
											</Typography>
										)}
									</TableCell>
									<TableCell className="club-management-table-body-cell">
										{club.volunteers?.length > 0 ? (
											<Chip
												label={club.volunteers.length}
												color="secondary"
												size="small"
											/>
										) : (
											<Typography variant="body2" color="text.secondary">
												0
											</Typography>
										)}
									</TableCell>
									<TableCell className="club-management-table-body-cell">
										{club.waitingChildren?.length > 0 ? (
											<Chip
												label={club.waitingChildren.length}
												color="warning"
												size="small"
											/>
										) : (
											<Typography variant="body2" color="text.secondary">
												0
											</Typography>
										)}
									</TableCell>
								<TableCell className="club-management-table-body-cell">
									<Tooltip title="צפה בפרטים" arrow>
										<IconButton
											className="club-management-icon-button-view"
											onClick={(e) => {
												e.stopPropagation();
												handleViewClub(club._id);
											}}
										>
											<VisibilityIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title="עריכת מועדונית" arrow>
										<IconButton
											className="club-management-icon-button-edit"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedClubForEdit(club);
												setEditDialogOpen(true);
											}}
										>
											<EditIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title="מחיקת מועדונית" arrow>
										<IconButton
											className="club-management-icon-button-delete"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteClub(club);
											}}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<AddClubDialog
				open={addDialogOpen}
				onClose={() => setAddDialogOpen(false)}
				onSuccess={refetch}
			/>

			<EditClubDialog
				open={editDialogOpen}
				onClose={() => {
					setEditDialogOpen(false);
					setSelectedClubForEdit(null);
				}}
				club={selectedClubForEdit}
				onSuccess={refetch}
			/>

			{/* דיאלוג מחיקת מועדונית */}
			<Dialog 
				open={deleteDialogOpen} 
				onClose={() => setDeleteDialogOpen(false)} 
				dir="rtl"
				aria-labelledby="delete-club-title"
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
					<IconButton onClick={() => setDeleteDialogOpen(false)} className="dialog-close-button">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{deleteError && (
						<Typography color="error" className="club-management-delete-error">
							{deleteError}
						</Typography>
					)}
					<Typography>
						האם אתה בטוח שברצונך למחוק את המועדונית{" "}
						<strong>{selectedClubForDelete?.name}</strong>?
					</Typography>
					<Typography variant="body2" color="error" className="club-management-delete-warning">
						פעולה זו תמחק גם את כל הקשרים של המועדונית עם ילדים ומתנדבות.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
						ביטול
					</Button>
					<Button
						onClick={confirmDeleteClub}
						color="error"
						variant="contained"
						disabled={isDeleting}
					>
						{isDeleting ? <CircularProgress size={24} /> : "מחק"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ClubManagement;
