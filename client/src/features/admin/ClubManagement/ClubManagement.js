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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useGetClubsQuery, useDeleteClubMutation } from "../../../api/clubApi";
import { useNavigate } from "react-router-dom";
import AddClubDialog from "./AddClubDialog";
import EditClubDialog from "./EditClubDialog";
import "./clubManagement.css";

const ClubManagement = () => {
	const navigate = useNavigate();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedClubForDelete, setSelectedClubForDelete] = useState(null);
	const [selectedClubForEdit, setSelectedClubForEdit] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const { data: clubs = [], isLoading, refetch } = useGetClubsQuery();
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
			<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }} dir="rtl">
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					mb: 3,
					position: "relative",
				}}
			>
				<Typography variant="h4" sx={{ fontWeight: 600 }}>
					ניהול מועדוניות
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setAddDialogOpen(true)}
					sx={{
						position: "absolute",
						left: 0,
						backgroundColor: "#03a9f4",
						"&:hover": { backgroundColor: "#0288d1" },
					}}
				>
					הוסף מועדונית חדשה
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "#1976d2" }}>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								שם המועדונית
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								יום פעילות
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								שעות
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								מיקום
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								ילדים רשומים
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								מתנדבות
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								בקשות ממתינות
							</TableCell>
							<TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
								פעולות
							</TableCell>
						</TableRow>
						</TableHead>
						<TableBody>
							{clubs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center">
									<Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
										אין מועדוניות קיימות. לחץ על 'הוסף מועדונית חדשה' כדי להתחיל
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							clubs.map((club) => (
								<TableRow 
									key={club._id} 
									hover
									onClick={() => handleViewClub(club._id)}
									sx={{ cursor: "pointer" }}
									role="button"
									tabIndex={0}
								>
									<TableCell sx={{ textAlign: "center" }}>{club.name}</TableCell>
									<TableCell sx={{ textAlign: "center" }}>{club.activityDay}</TableCell>
									<TableCell sx={{ textAlign: "center" }}>
										{club.startTime} - {club.endTime}
									</TableCell>
									<TableCell sx={{ textAlign: "center" }}>{club.location}</TableCell>
									<TableCell sx={{ textAlign: "center" }}>
										{club.registeredChildren?.length > 0 && (
											<Chip
												label={club.registeredChildren.length}
												color="primary"
												size="small"
											/>
										)}
										{club.registeredChildren?.length === 0 && (
											<Typography variant="body2" color="text.secondary">
												{club.registeredChildren.length}
											</Typography>
										)}
									</TableCell>
									<TableCell sx={{ textAlign: "center" }}>
										{club.volunteers?.length > 0 && (
											<Chip
												label={club.volunteers.length}
												color="secondary"
												size="small"
											/>
										)}
										{club.volunteers?.length === 0 && (
											<Typography variant="body2" color="text.secondary">
												{club.volunteers.length}
											</Typography>
										)}
									</TableCell>
									<TableCell sx={{ textAlign: "center" }}>
										{club.waitingChildren?.length > 0 && (
											<Chip
												label={club.waitingChildren.length}
												color="warning"
												size="small"
											/>
										)}
										{club.waitingChildren?.length === 0 && (
											<Typography variant="body2" color="text.secondary">
												{club.waitingChildren.length}
											</Typography>
										)}
									</TableCell>
									<TableCell sx={{ textAlign: "center" }}>
										<IconButton
											color="primary"
											onClick={(e) => { e.stopPropagation(); handleViewClub(club._id); }}
											title="צפה בפרטים"
										>
											<VisibilityIcon />
										</IconButton>
										<IconButton
											color="primary"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedClubForEdit(club);
												setEditDialogOpen(true);
											}}
											title="ערוך"
										>
											<EditIcon />
										</IconButton>
										<IconButton
											color="error"
											onClick={(e) => { e.stopPropagation(); handleDeleteClub(club); }}
											title="מחק"
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* דיאלוג הוספת מועדונית */}
			<AddClubDialog
				open={addDialogOpen}
				onClose={() => setAddDialogOpen(false)}
				onSuccess={refetch}
			/>

			{/* דיאלוג עריכת מועדונית */}
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
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} dir="rtl">
				<DialogTitle>אישור מחיקה</DialogTitle>
				<DialogContent>
					{deleteError && (
						<Typography color="error" sx={{ mb: 2 }}>
							{deleteError}
						</Typography>
					)}
					<Typography>
						האם אתה בטוח שברצונך למחוק את המועדונית "{selectedClubForDelete?.name}"?
					</Typography>
					<Typography variant="body2" color="error" sx={{ mt: 1 }}>
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
						{isDeleting ? "מוחק..." : "מחק"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ClubManagement;
