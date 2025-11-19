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
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useGetChildrenQuery, useDeleteChildMutation } from "../../../api/childApi";
import { useGetClubsQuery } from "../../../api/clubApi";
import { useApproveChildMutation } from "../../../api/authApi";
import ChildDetails from "./ChildDetails";
import EditChildDialog from "./EditChildDialog";
import AddChildDialog from "./AddChildDialog";
import "./childManagement.css";
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
			<TableCell sx={{ width: "27%", textAlign: "center" }}>{calcAge(child.dateOfBirth)}</TableCell>
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
		</TableRow><TableRow>
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
	const { data: children = [], isLoading, isError, error, refetch } = useGetChildrenQuery();
	const { data: clubs = [] } = useGetClubsQuery();
	
	const [showPending, setShowPending] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchField, setSearchField] = useState(""); // ריק = חיפוש חופשי
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	const approvedChildren = useMemo(() => children.filter(c => c.isApproved === true), [children]);
	// Pending = not approved yet BUT email/otp verified
	const pendingChildren = useMemo(() => children.filter(c => c.isApproved === false && c.isVerified === true), [children]);

	// יצירת מילון מועדוניות
	const clubsDict = useMemo(() => {
		const dict = {};
		clubs.forEach(club => {
			dict[club._id] = { name: club.name, children: club.registeredChildren };
		});
		return dict;
	}, [clubs]);

	// פונקציה להחזרת מועדוניות של ילד
	const getChildClubs = (child) => {
		if (!child || !child.clubs || child.clubs.length === 0) return [];
		return child.clubs
			.map(clubId => clubsDict[clubId])
			.filter(Boolean);
	};

	// סינון ילדים מאושרים לפי חיפוש ומיון לפי שם פרטי
	const filteredApproved = useMemo(() => {
		let filtered = approvedChildren;
		
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			
			filtered = approvedChildren.filter(child => {
				switch(searchField) {
					case "name":
						return (child.Fname + " " + child.Lname).toLowerCase().includes(query);
					case "educationInstitution":
						return (child.educationInstitution || "").toLowerCase().includes(query);
					case "age":
						if (!child.dateOfBirth) return false;
						const age = calcAge(child.dateOfBirth);
						return age !== null && age.toString() === query;
					case "dateOfBirth":
						return (child.dateOfBirth || "").includes(query);
					case "clubs":
						const childClubs = getChildClubs(child);
						return childClubs.some(club => club.name.toLowerCase().includes(query));
					default: {
						// חיפוש חופשי על כל השדות
						const contains = (v) => (v ?? "").toString().toLowerCase().includes(query);
						const fullName = `${child.Fname || ""} ${child.Lname || ""}`;
						const age = calcAge(child.dateOfBirth);
						const dobIso = child.dateOfBirth || "";
						const dobLocal = child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : "";
						const clubs = getChildClubs(child);
						const clubsJoined = clubs.map(c => c.name).join(", ");
						const allergiesJoined = Array.isArray(child.allergies) ? child.allergies.join(", ") : (child.allergies || "");
						const emailConsentLabel = child.emailConsent ? "כן" : "לא";

						const matches = [
							contains(fullName),
							contains(child.childId),
							contains(child.parentName),
							contains(child.educationInstitution),
							contains(child.phone1),
							contains(child.phone2),
							contains(child.email),
							contains(child.address?.city),
							contains(child.address?.street),
							contains(child.address?.building),
							contains(child.definition),
							contains(allergiesJoined),
							contains(dobIso),
							contains(dobLocal),
							contains(clubsJoined),
							contains(emailConsentLabel),
							age !== null ? age.toString() === query : false,
						];

						return matches.some(Boolean);
					}
				}
			});
		}
		
		// מיון לפי שם פרטי (א' ב')
		return filtered.sort((a, b) => {
			return (a.Fname || "").localeCompare(b.Fname || "", 'he');
		});
	}, [approvedChildren, searchQuery, searchField, clubsDict]);

	return (
		<Box sx={{ 
			p: 3, 
			direction: 'rtl', 
			textAlign: 'right'
		}}>
			<Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
				ניהול ילדים
			</Typography>

			{/* כפתורי מעבר בין טאבים - עיצוב מקורי */}
			<Paper sx={{ mb: 2, p: 2, background: 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)' }}>
				<Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
					<Button
						onClick={() => setShowPending(false)}
						sx={{
							flex: 1,
							borderRadius: '6px',
							py: 1.5,
							backgroundColor: !showPending ? 'white' : 'transparent',
							color: !showPending ? '#0288d1' : 'rgba(255,255,255,0.9)',
							fontWeight: !showPending ? 600 : 500,
							boxShadow: !showPending ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
							transition: 'all 0.3s ease',
							'&:hover': {
								backgroundColor: !showPending ? 'white' : 'rgba(255,255,255,0.15)',
							}
						}}
					>
						ילדים רשומים ({approvedChildren.length})
					</Button>
					<Button
						onClick={() => setShowPending(true)}
						sx={{
							flex: 1,
							borderRadius: '6px',
							py: 1.5,
							backgroundColor: showPending ? 'white' : 'transparent',
							color: showPending ? '#0288d1' : 'rgba(255,255,255,0.9)',
							fontWeight: showPending ? 600 : 500,
							boxShadow: showPending ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
							transition: 'all 0.3s ease',
							'&:hover': {
								backgroundColor: showPending ? 'white' : 'rgba(255,255,255,0.15)',
							}
						}}
					>
						בקשות הצטרפות ({pendingChildren.length})
					</Button>
				</Box>
			</Paper>

			{/* חיפוש מתקדם - רק בטאב ילדים רשומים */}
			{!showPending && (
				<Paper sx={{ p: 2, mb: 2 }}>
					<Stack direction="row" spacing={2} alignItems="center">
						<TextField
							fullWidth
							placeholder="חיפוש..."
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
						<FormControl sx={{ minWidth: 200 }}>
							<InputLabel shrink id="search-field-label">חיפוש לפי</InputLabel>
							<Select
								displayEmpty
								id="search-field"
								labelId="search-field-label"
								value={searchField}
								label="חיפוש לפי"
								onChange={(e) => setSearchField(e.target.value)}
								renderValue={(val) => val ? (
									{
										name: 'שם',
										educationInstitution: 'מוסד לימודי',
										age: 'גיל',
										dateOfBirth: 'תאריך לידה',
										clubs: 'מועדוניות'
									}[val]
								) : 'כל השדות'}
							>
								<MenuItem value="">כל השדות (ברירת מחדל)</MenuItem>
								<MenuItem value="name">שם</MenuItem>
								<MenuItem value="educationInstitution">מוסד לימודי</MenuItem>
								<MenuItem value="age">גיל</MenuItem>
								<MenuItem value="dateOfBirth">תאריך לידה</MenuItem>
								<MenuItem value="clubs">מועדוניות</MenuItem>
							</Select>
						</FormControl>
						<Button
							variant="contained"
							onClick={() => setAddDialogOpen(true)}
							startIcon={<AddIcon />}
							sx={{
								bgcolor: '#4CAF50',
								'&:hover': { bgcolor: '#388E3C' },
								whiteSpace: 'nowrap',
								minWidth: 'fit-content',
								fontWeight: 'bold',
							}}
						>
							הוספת ילד
						</Button>
					</Stack>
				</Paper>
			)}

			{/* תוכן טבלה */}
			<Paper>
				{isLoading ? (
					<Box p={3}>טוען נתונים...</Box>
				) : isError ? (
					<Box p={3} color="error.main">{error?.data?.message || error?.error || "שגיאה"}</Box>
				) : (
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow sx={{ bgcolor: '#1976d2' }}>
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
										<Row key={child._id} child={child} childClubs={getChildClubs(child)} onDeleted={refetch} isPending={true} />
									))
									) : (
										<TableRow>
											<TableCell colSpan={6} align="center" sx={{ py: 4 }}>אין בקשות ממתינות</TableCell>
										</TableRow>
									)
								) : (
									filteredApproved.length > 0 ? (
									filteredApproved.map((child) => (
										<Row key={child._id} child={child} childClubs={getChildClubs(child)} onDeleted={refetch} isPending={false} />
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