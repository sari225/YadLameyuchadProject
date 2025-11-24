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
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	InputAdornment,
	TextField,
	CircularProgress,
	Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useGetVolunteersQuery } from "../../../api/volunteerApi";
import VolunteerRow from "./VolunteerRow";
import AddVolunteerDialog from "./AddVolunteerDialog";
import "./styles/VolunteerManagement.css";
import { parseServerError } from "../../../utils/errorHandler";

const VolunteerManagement = () => {
	const { data: volunteers = [], isLoading, isError, error, refetch } = useGetVolunteersQuery();
	
	const [searchQuery, setSearchQuery] = useState("");
	const [searchField, setSearchField] = useState(""); // ריק = חיפוש חופשי
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	// סינון ומיון מתנדבות
	const filteredVolunteers = useMemo(() => {
		let result = volunteers;
		
		// סינון לפי חיפוש
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = volunteers.filter(vol => {
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
		}
		
		// מיון לפי שם (אלפביתי) - יוצרים עותק לפני המיון
		return [...result].sort((a, b) => {
			const nameA = (a.fname + " " + a.lname).toLowerCase();
			const nameB = (b.fname + " " + b.lname).toLowerCase();
			return nameA.localeCompare(nameB, 'he');
		});
	}, [volunteers, searchQuery, searchField]);

	if (isLoading) {

		return (
			<Box className="volunteer-loading">
				<CircularProgress size={60} />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box className="volunteer-error">
				<Typography color="error" variant="h6">
					שגיאה בטעינת נתוני המתנדבות
				</Typography>
				<Typography color="error">{parseServerError(error, "שגיאה בטעינת נתוני המתנדבות")}</Typography>
			</Box>
		);
	}

	return (
		<Box className="volunteer-container">
			{/* כותרת */}
			<Typography variant="h4" className="volunteer-header-title">
				ניהול מתנדבות
			</Typography>

			{/* מספר מתנדבות */}
			<Typography variant="body1" className="volunteer-count">
				מתנדבות רשומות: {volunteers.length}
			</Typography>

			{/* פילטרים וחיפוש */}
			<Paper className="volunteer-filter-paper">
				<Box className="volunteer-filter-stack">
					<TextField
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

					<FormControl className="volunteer-select">
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
							<MenuItem value="school">סמינר</MenuItem>
						</Select>
					</FormControl>

					<Button
						variant="contained"
						onClick={() => setAddDialogOpen(true)}
						className="volunteer-add-button"
					>
						<AddIcon />
					</Button>
				</Box>
			</Paper>

			<TableContainer component={Paper} className="volunteer-table-container">
				<Table className="volunteer-table">
					<TableHead>
						<TableRow className="volunteer-table-header">
							<TableCell className="volunteer-table-cell"></TableCell>
						<TableCell className="volunteer-table-cell">שם מלא</TableCell>
						<TableCell className="volunteer-table-cell">ת"ז</TableCell>
						<TableCell className="volunteer-table-cell">טלפון</TableCell>
						<TableCell className="volunteer-table-cell">סמינר</TableCell>
						<TableCell className="volunteer-table-cell">גיל</TableCell>
							<TableCell className="volunteer-table-cell">מועדוניות</TableCell>
							<TableCell className="volunteer-table-cell">פעולות</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredVolunteers.map((volunteer) => (
							<VolunteerRow key={volunteer._id} volunteer={volunteer} onDeleted={refetch} />
						))}
						{filteredVolunteers.length === 0 && (
							<TableRow>
								<TableCell colSpan={8} className="volunteer-empty">
									<Box className="volunteer-empty-message">
										<Typography className="volunteer-empty-text">
											{searchQuery || searchField ? 'לא נמצאו מתנדבות מתאימות' : 'אין מתנדבות במערכת'}
										</Typography>
										<Typography className="volunteer-empty-subtitle">
											{searchQuery || searchField ? 'נסי לחפש עם מילים אחרות או נקי את החיפוש' : 'התחילי בהוספת מתנדבת חדשה'}
										</Typography>
									</Box>
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
