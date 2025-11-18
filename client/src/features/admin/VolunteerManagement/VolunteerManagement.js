import React, { useMemo, useState } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useGetVolunteersQuery, useDeleteVolunteerMutation } from "../../../api/volunteerApi";
import VolunteerDetails from "./VolunteerDetails";
import EditVolunteerDialog from "./EditVolunteerDialog";
import AddVolunteerDialog from "./AddVolunteerDialog";
import "./volunteerManagement.css";

// פונקציה לחישוב גיל מתאריך לידה
function calcAge(dob) {
	if (!dob) return "-";
	const birth = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
	return age;
}

const Row = ({ volunteer, onDeleted }) => {
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
			<TableRow hover>
				<TableCell sx={{ width: "5%", textAlign: "right" }}>
					<IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell sx={{ width: "20%", textAlign: "right" }}>
					{volunteer.fname} {volunteer.lname}
				</TableCell>
				<TableCell sx={{ width: "15%", textAlign: "right" }}>{volunteer.id}</TableCell>
				<TableCell sx={{ width: "15%", textAlign: "right" }}>{volunteer.phone}</TableCell>
				<TableCell sx={{ width: "15%", textAlign: "right" }}>{volunteer.school}</TableCell>
				<TableCell sx={{ width: "10%", textAlign: "right" }}>{calcAge(volunteer.dateBorn)}</TableCell>
				<TableCell sx={{ width: "10%", textAlign: "right" }}>
					{volunteer.clubs?.length || 0}
				</TableCell>
				<TableCell sx={{ width: "10%", textAlign: "center" }}>
					<Stack direction="row" spacing={1} justifyContent="center">
						<Tooltip title="עריכת מתנדבת" arrow>
							<IconButton
								color="primary"
								onClick={() => setEditOpen(true)}
								aria-label="edit"
							>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="מחיקת מתנדבת" arrow>
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
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<VolunteerDetails volunteer={volunteer} onUpdated={onDeleted} />
					</Collapse>
				</TableCell>
			</TableRow>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="delete-volunteer-title">
				<DialogTitle id="delete-volunteer-title" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
					אישור מחיקה
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ textAlign: 'right' }}>
						האם אתה בטוח שברצונך למחוק את המתנדבת {volunteer.fname} {volunteer.lname}?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ justifyContent: 'flex-start', direction: 'ltr' }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" color="primary">ביטול</Button>
					<Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting}>
						{isDeleting ? <CircularProgress size={18} color="inherit" /> : "מחיקה סופית"}
					</Button>
				</DialogActions>
			</Dialog>

			<EditVolunteerDialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				volunteer={volunteer}
				onSuccess={onDeleted}
			/>
		</>
	);
};

const VolunteerManagement = () => {
	const { data: volunteers = [], isLoading, isError, error, refetch } = useGetVolunteersQuery();
	
	const [searchQuery, setSearchQuery] = useState("");
	const [searchField, setSearchField] = useState(""); // ריק = חיפוש חופשי
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	// סינון מתנדבות לפי חיפוש
	const filteredVolunteers = useMemo(() => {
		if (!searchQuery.trim()) return volunteers;
		const q = searchQuery.toLowerCase();
		
		return volunteers.filter(vol => {
			if (searchField === "name") {
				return (vol.fname + " " + vol.lname).toLowerCase().includes(q);
			} else if (searchField === "id") {
				return vol.id.toLowerCase().includes(q);
			} else if (searchField === "phone") {
				return vol.phone.includes(q);
			} else if (searchField === "school") {
				return vol.school.toLowerCase().includes(q);
			} else {
				// חיפוש חופשי בכל השדות
				return (
					(vol.fname + " " + vol.lname).toLowerCase().includes(q) ||
					vol.id.toLowerCase().includes(q) ||
					vol.phone.includes(q) ||
					vol.school.toLowerCase().includes(q) ||
					vol.email?.toLowerCase().includes(q)
				);
			}
		});
	}, [volunteers, searchQuery, searchField]);

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
				<CircularProgress size={60} />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box sx={{ padding: 3, textAlign: "center" }}>
				<Typography color="error" variant="h6">
					שגיאה בטעינת נתוני המתנדבות
				</Typography>
				<Typography color="error">{error?.data?.message || error?.message}</Typography>
			</Box>
		);
	}

		return (
			<Box sx={{ padding: 3, direction: 'rtl' }}>
				<Paper elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
					<Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center', mb: 3 }}>
						ניהול מתנדבות
					</Typography>

					{/* פילטרים וחיפוש */}
					<Stack direction="row" spacing={2} mb={2}>
						<FormControl sx={{ minWidth: 150 }}>
							<InputLabel>חיפוש לפי</InputLabel>
							<Select
								value={searchField}
								label="חיפוש לפי"
								onChange={(e) => setSearchField(e.target.value)}
							>
								<MenuItem value="">הכל</MenuItem>
								<MenuItem value="name">שם</MenuItem>
								<MenuItem value="id">ת.ז</MenuItem>
								<MenuItem value="phone">טלפון</MenuItem>
								<MenuItem value="school">בית ספר</MenuItem>
							</Select>
						</FormControl>

						<TextField
							fullWidth
							variant="outlined"
							placeholder="הקלד לחיפוש..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>

						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={() => setAddDialogOpen(true)}
							sx={{ minWidth: 200 }}
						>
							הוספת מתנדבת חדשה
						</Button>
					</Stack>

					<Typography variant="body1" color="textSecondary" mb={1}>
						מתנדבות רשומות: {filteredVolunteers.length}
					</Typography>
				</Paper>			<TableContainer component={Paper}>
				<Table sx={{ direction: 'rtl' }}>
					<TableHead>
						<TableRow sx={{ bgcolor: '#1976d2' }}>
							<TableCell sx={{ width: "5%", textAlign: "right", fontWeight: "bold", color: 'white' }}></TableCell>
							<TableCell sx={{ width: "20%", textAlign: "right", fontWeight: "bold", color: 'white' }}>שם מלא</TableCell>
							<TableCell sx={{ width: "15%", textAlign: "right", fontWeight: "bold", color: 'white' }}>תעודת זהות</TableCell>
							<TableCell sx={{ width: "15%", textAlign: "right", fontWeight: "bold", color: 'white' }}>טלפון</TableCell>
							<TableCell sx={{ width: "15%", textAlign: "right", fontWeight: "bold", color: 'white' }}>בית ספר</TableCell>
							<TableCell sx={{ width: "10%", textAlign: "right", fontWeight: "bold", color: 'white' }}>גיל</TableCell>
							<TableCell sx={{ width: "10%", textAlign: "right", fontWeight: "bold", color: 'white' }}>מועדוניות</TableCell>
							<TableCell sx={{ width: "10%", textAlign: "center", fontWeight: "bold", color: 'white' }}>פעולות</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredVolunteers.map((volunteer) => (
							<Row key={volunteer._id} volunteer={volunteer} onDeleted={refetch} />
						))}
						{filteredVolunteers.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} align="center">
									<Typography variant="body1" color="textSecondary" py={3}>
										לא נמצאו מתנדבות
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<AddVolunteerDialog
				open={addDialogOpen}
				onClose={() => setAddDialogOpen(false)}
				onSuccess={refetch}
			/>
		</Box>
	);
};

export default VolunteerManagement;
