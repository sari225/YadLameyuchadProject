import React, { useState } from "react";
import {
	Box,
	Typography,
	Grid,
	Chip,
	Stack,
	Button,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	IconButton,
	Alert,
	CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
	useAddClubToVolunteerMutation,
	useRemoveClubFromVolunteerMutation,
} from "../../../api/volunteerApi";
import { useGetChildrenQuery } from "../../../api/childApi";
import { useGetClubsQuery } from "../../../api/clubApi";

const VolunteerDetails = ({ volunteer, onUpdated }) => {
	const [addClub, { isLoading: isAdding }] = useAddClubToVolunteerMutation();
	const [removeClub, { isLoading: isRemoving }] = useRemoveClubFromVolunteerMutation();
	const { data: children = [] } = useGetChildrenQuery();
	const { data: clubs = [] } = useGetClubsQuery();

	const [showAddClub, setShowAddClub] = useState(false);
	const [newClub, setNewClub] = useState({ clubName: "", child: "" });
	const [error, setError] = useState("");

	if (!volunteer) return null;

	const handleAddClub = async () => {
		if (!newClub.clubName.trim() || !newClub.child) {
			setError("יש למלא את כל השדות");
			return;
		}

		try {
			setError("");
			await addClub({
				volunteerId: volunteer._id,
				clubName: newClub.clubName,
				child: newClub.child,
			}).unwrap();

			setNewClub({ clubName: "", child: "" });
			setShowAddClub(false);
			if (onUpdated) onUpdated();
		} catch (err) {
			console.error("Failed to add club:", err);
			setError(err?.data?.message || "שגיאה בהוספת מועדונית");
		}
	};

	const handleRemoveClub = async (clubId) => {
		try {
			await removeClub({
				volunteerId: volunteer._id,
				clubId: clubId,
			}).unwrap();

			if (onUpdated) onUpdated();
		} catch (err) {
			console.error("Failed to remove club:", err);
			setError(err?.data?.message || "שגיאה בהסרת מועדונית");
		}
	};

	// רשימת ילדים מאושרים בלבד
	const approvedChildren = children.filter((c) => c.isApproved === true);

	return (
		<Box sx={{ margin: 2.5, p: 3, bgcolor: "#f5f5f5", borderRadius: 1, textAlign: "right" }}>
			{error && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
					{error}
				</Alert>
			)}

			<Grid container spacing={5}>
				{/* פרטים אישיים */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						פרטים אישיים
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>תעודת זהות:</strong> {volunteer.id}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>שם מלא:</strong> {volunteer.fname} {volunteer.lname}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>תאריך לידה:</strong>{" "}
						{volunteer.dateBorn ? new Date(volunteer.dateBorn).toLocaleDateString("he-IL") : "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>בית ספר:</strong> {volunteer.school || "—"}
					</Typography>
				</Grid>

				{/* פרטי תקשורת */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						פרטי תקשורת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>טלפון:</strong> {volunteer.phone}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>אימייל:</strong> {volunteer.email || "—"}
					</Typography>
				</Grid>

				{/* כתובת */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						כתובת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>עיר:</strong> {volunteer.address?.city || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>רחוב:</strong> {volunteer.address?.street || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>מספר בית:</strong> {volunteer.address?.building || "—"}
					</Typography>
				</Grid>

				{/* מועדוניות */}
				<Grid item xs={12} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						מועדוניות ({volunteer.clubs?.length || 0})
					</Typography>

					{volunteer.clubs && volunteer.clubs.length > 0 ? (
						<Stack spacing={1}>
							{volunteer.clubs.map((club, idx) => {
								const childName = club.child
									? `${club.child.Fname || ""} ${club.child.Lname || ""}`
									: "ילד לא זמין";
								return (
									<Box
										key={club._id || idx}
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											bgcolor: "white",
											p: 1,
											borderRadius: 1,
										}}
									>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: "bold" }}>
												{club.clubName}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												ילד: {childName}
											</Typography>
										</Box>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleRemoveClub(club._id)}
											disabled={isRemoving}
											aria-label="remove club"
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</Box>
								);
							})}
						</Stack>
					) : (
						<Typography variant="body2" color="text.secondary">
							אין מועדוניות רשומות
						</Typography>
					)}

					{/* כפתור להוספת מועדונית */}
					<Box sx={{ mt: 2 }}>
						{!showAddClub ? (
							<Button
								variant="outlined"
								size="small"
								startIcon={<AddIcon />}
								onClick={() => setShowAddClub(true)}
								fullWidth
							>
								הוסף מועדונית
							</Button>
						) : (
							<Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, border: "1px dashed #ccc" }}>
								<Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
									הוספת מועדונית חדשה
								</Typography>

								<FormControl fullWidth size="small" sx={{ mb: 1 }}>
									<InputLabel>בחר מועדונית</InputLabel>
									<Select
										value={newClub.clubName}
										label="בחר מועדונית"
										onChange={(e) => setNewClub({ ...newClub, clubName: e.target.value })}
									>
										{clubs.map((club) => (
											<MenuItem key={club._id} value={club.name}>
												{club.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								<FormControl fullWidth size="small" sx={{ mb: 1 }}>
									<InputLabel>בחר ילד</InputLabel>
									<Select
										value={newClub.child}
										label="בחר ילד"
										onChange={(e) => setNewClub({ ...newClub, child: e.target.value })}
									>
										{approvedChildren.map((child) => (
											<MenuItem key={child._id} value={child._id}>
												{child.Fname} {child.Lname} ({child.childId})
											</MenuItem>
										))}
									</Select>
								</FormControl>

								<Stack direction="row" spacing={1}>
									<Button
										variant="contained"
										size="small"
										onClick={handleAddClub}
										disabled={isAdding}
									>
										{isAdding ? <CircularProgress size={18} /> : "הוסף"}
									</Button>
									<Button
										variant="outlined"
										size="small"
										onClick={() => {
											setShowAddClub(false);
											setNewClub({ clubName: "", child: "" });
											setError("");
										}}
										disabled={isAdding}
									>
										ביטול
									</Button>
								</Stack>
							</Box>
						)}
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default VolunteerDetails;
