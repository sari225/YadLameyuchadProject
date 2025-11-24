import React, { useState, useEffect } from "react";
import {
	Button,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	CircularProgress,
	Chip,
	Tabs,
	Tab,
	Grid,
	Autocomplete,
	TextField,
	Tooltip,
} from "@mui/material";
import {
	ArrowForward as ArrowForwardIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Check as CheckIcon,
	Clear as ClearIcon,
	Edit as EditIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import {
	useGetClubByIdQuery,
	useAddChildToClubMutation,
	useAddVolunteerToClubMutation,
	useRemoveChildFromClubMutation,
	useRemoveVolunteerFromClubMutation,
	useRefuseChildFromClubMutation,
} from "../../../api/clubApi";
import { useGetChildrenQuery } from "../../../api/childApi";
import { useGetVolunteersQuery, useAddClubToVolunteerMutation, useUpdateClubInVolunteerMutation } from "../../../api/volunteerApi";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/ClubDetailsPage.css";

const ClubDetailsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { data: clubData, isLoading, refetch } = useGetClubByIdQuery(id);
	const { data: allChildren = [] } = useGetChildrenQuery();
	const { data: allVolunteers = [], refetch: refetchVolunteers } = useGetVolunteersQuery();

	const [addChildToClub] = useAddChildToClubMutation();
	const [addVolunteerToClub] = useAddVolunteerToClubMutation();
	const [addClubToVolunteer] = useAddClubToVolunteerMutation();
	const [updateClubInVolunteer] = useUpdateClubInVolunteerMutation();
	const [removeChildFromClub] = useRemoveChildFromClubMutation();
	const [removeVolunteerFromClub] = useRemoveVolunteerFromClubMutation();
	const [refuseChildFromClub] = useRefuseChildFromClubMutation();

	const [tabValue, setTabValue] = useState(0);
	const [selectedChild, setSelectedChild] = useState(null);
	const [selectedVolunteer, setSelectedVolunteer] = useState(null);
	const [selectedChildForVolunteer, setSelectedChildForVolunteer] = useState(null);
	const [deleteChildDialog, setDeleteChildDialog] = useState({ open: false, childId: null, childName: "" });
	const [deleteVolunteerDialog, setDeleteVolunteerDialog] = useState({ open: false, volunteerId: null, volunteerName: "" });
	const [confirmRejectWaitingChild, setConfirmRejectWaitingChild] = useState({ open: false, childId: null, childName: "" });
	const [editVolunteerChild, setEditVolunteerChild] = useState({ open: false, volunteer: null, currentChild: null, clubEntry: null });
	const [serverError, setServerError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	useEffect(() => {
		refetch();
	}, [refetch]);

	const handleAddChild = async () => {
		if (!selectedChild) {
			setServerError("יש לבחור ילד");
			setTimeout(() => setServerError(""), 3000);
			return;
		}

		try {
			await addChildToClub({
				childId: selectedChild._id,
				clubId: id,
			}).unwrap();
			setSelectedChild(null);
			setSuccessMessage("הילד נוסף בהצלחה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בהוספת ילד למועדונית");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleRemoveChild = (child) => {
		setDeleteChildDialog({ open: true, childId: child._id, childName: `${child.Fname} ${child.Lname}` });
	};

	const confirmRemoveChild = async () => {
		const { childId } = deleteChildDialog;
		setDeleteChildDialog({ open: false, childId: null, childName: "" });

		try {
			await removeChildFromClub({
				clubId: id,
				childId: childId,
			}).unwrap();
			setSuccessMessage("הילד הוסר בהצלחה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בהסרת ילד");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleAddVolunteer = async () => {
		if (!selectedVolunteer) {
			setServerError("יש לבחור מתנדבת");
			setTimeout(() => setServerError(""), 3000);
			return;
		}

		try {
			if (selectedChildForVolunteer) {
				await addClubToVolunteer({
					volunteerId: selectedVolunteer._id,
					clubId: id,
					child: selectedChildForVolunteer._id,
				}).unwrap();
			} else {
				await addVolunteerToClub({
					volunteerId: selectedVolunteer._id,
					clubId: id,
				}).unwrap();
			}

			setSelectedVolunteer(null);
			setSelectedChildForVolunteer(null);
			setSuccessMessage("המתנדבת נוספה בהצלחה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בהוספת מתנדבת למועדונית");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleEditVolunteerChild = (volunteer) => {
		const fullVolunteer = allVolunteers.find(v => v._id === volunteer._id) || volunteer;
		const clubEntry = fullVolunteer.clubs?.find(c => c.club?._id === id || c.club === id);
		const currentChild = clubEntry?.child?._id || clubEntry?.child || null;
		setEditVolunteerChild({ open: true, volunteer: fullVolunteer, currentChild, clubEntry });
	};

	const handleUpdateVolunteerChild = async (newChildId) => {
		const { volunteer, clubEntry } = editVolunteerChild;
		
		try {
			if (!clubEntry || !clubEntry._id) {
				setServerError("לא נמצאה מועדונית עבור מתנדבת זו");
				return;
			}

		await updateClubInVolunteer({
			volunteerId: volunteer._id,
			clubId: clubEntry._id,
			clubData: { child: newChildId || null }
		}).unwrap();

		setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null });
		setSuccessMessage("הילד עודכן בהצלחה");
		await refetch();
		await refetchVolunteers();
		setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בעדכון ילד");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleRemoveVolunteer = (volunteer) => {
		setDeleteVolunteerDialog({ open: true, volunteerId: volunteer._id, volunteerName: `${volunteer.fname} ${volunteer.lname}` });
	};

	const confirmRemoveVolunteer = async () => {
		const { volunteerId } = deleteVolunteerDialog;
		setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" });

		try {
			await removeVolunteerFromClub({
				volunteerId,
				clubId: id,
			}).unwrap();
			setSuccessMessage("המתנדבת הוסרה בהצלחה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בהסרת מתנדבת");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleApproveWaitingChild = async (child) => {
		try {
			await addChildToClub({
				childId: child._id,
				clubId: id,
			}).unwrap();
			setSuccessMessage("הילד אושר בהצלחה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה באישור הילד");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const handleRejectWaitingChild = async (child) => {
		setConfirmRejectWaitingChild({ open: true, childId: child._id, childName: `${child.Fname} ${child.Lname}` });
	};

	const confirmRejectChild = async () => {
		const { childId } = confirmRejectWaitingChild;
		setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" });

		try {
			await refuseChildFromClub({
				childId: childId,
				clubId: id,
			}).unwrap();
			setSuccessMessage("הבקשה נדחתה");
			refetch();
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (error) {
			setServerError(error.data?.message || "שגיאה בדחיית הילד");
			setTimeout(() => setServerError(""), 3000);
		}
	};

	const availableChildren = allChildren.filter(
		(child) =>
			child.isApproved &&
			!clubData?.registeredChildren?.some((c) => c._id === child._id) &&
			!clubData?.waitingChildren?.some((c) => c._id === child._id)
	);

	const availableVolunteers = allVolunteers.filter(
		(volunteer) =>
			!clubData?.volunteers?.some((v) => v._id === volunteer._id)
	);

	const childrenWithVolunteers = new Set();
	allVolunteers.forEach(volunteer => {
		volunteer.clubs?.forEach(club => {
			const clubId = club.club?._id || club.club;
			if (clubId === id && club.child) {
				const childId = typeof club.child === 'object' ? club.child._id : club.child;
				if (childId) {
					childrenWithVolunteers.add(childId.toString());
				}
			}
		});
	});

	const availableChildrenForVolunteer = clubData?.registeredChildren?.filter(
		(child) => !childrenWithVolunteers.has(child._id.toString())
	) || [];

	if (isLoading) {
		return (
			<div className="club-details-loading-container">
				<CircularProgress />
			</div>
		);
	}

	if (!clubData) {
		return (
			<div className="club-details-error-container">
				<Alert severity="error">מועדונית לא נמצאה</Alert>
			</div>
		);
	}

		return (
			<div className="club-details-container">
				<div className="club-details-header">
					<IconButton onClick={() => navigate("/admin/clubsManagement")}>
						<ArrowForwardIcon />
					</IconButton>
					<Typography variant="h4" className="club-details-title">
						{clubData.name}
					</Typography>
				</div>		{serverError && (
			<Alert severity="error" sx={{ mb: 2 }}>
				{serverError}
			</Alert>
		)}		{successMessage && (
			<Alert severity="success" sx={{ mb: 2 }}>
				{successMessage}
			</Alert>
		)}		{/* Info Summary - Single Line */}
		<div className="club-details-info-summary">
			<Grid container spacing={1.5} alignItems="center">
				<Grid item>
					<Chip 
						label={`יום: ${clubData.activityDay}`}
						className="club-details-info-chip"
						size="small"
					/>
				</Grid>
				<Grid item>
					<Chip 
						label={`שעות: ${clubData.startTime} - ${clubData.endTime}`}
						className="club-details-info-chip"
						size="small"
					/>
				</Grid>
				<Grid item>
					<Chip 
						label={`מיקום: ${clubData.location}`}
						className="club-details-info-chip"
						size="small"
					/>
				</Grid>
			</Grid>
		</div>
		{/* Club Managers - Single Line */}
			{clubData?.clubManagers?.length > 0 && (
				<div className="club-details-managers-summary">
					<Typography variant="subtitle1" className="club-details-managers-title">
						מנהלי המועדונית:
					</Typography>
					<Grid container spacing={2} alignItems="center">
						{clubData.clubManagers.map((manager, index) => (
							<Grid item key={index}>
								<Chip
									label={`${manager.name} • ${manager.phone}${manager.email ? ` • ${manager.email}` : ''}`}
									variant="outlined"
									className="club-details-manager-chip"
									size="medium"
								/>
							</Grid>
						))}
					</Grid>
				</div>
			)}

			{/* Tabs */}
			<div className="club-details-tabs-paper">
				<Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
					<Tab label={`ילדים רשומים (${clubData.registeredChildren?.length || 0})`} />
					<Tab label={`מתנדבות (${clubData.volunteers?.length || 0})`} />
					<Tab label={`בקשות ממתינות (${clubData.waitingChildren?.length || 0})`} />
				</Tabs>
			</div>

			{/* Tab 0: Children */}
			{tabValue === 0 && (
				<>
					<div className="club-details-controls-section">
						<div className="club-details-controls-flex">
							<div className="club-details-autocomplete-wrapper">
								<Autocomplete
									fullWidth
									options={availableChildren}
									getOptionLabel={(option) => `${option.Fname} ${option.Lname} - ${option.childId}`}
									value={selectedChild}
									onChange={(event, newValue) => setSelectedChild(newValue)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="חפש ובחר ילד"
											placeholder="הקלד שם או ת.ז"
											size="medium"
											fullWidth
										/>
									)}
									noOptionsText="לא נמצאו ילדים זמינים"
									isOptionEqualToValue={(option, value) => option._id === value._id}
								/>
							</div>
							<Button
								variant="contained"
								onClick={handleAddChild}
								disabled={!selectedChild}
								className="club-details-add-button"
							>
								<AddIcon />
							</Button>
						</div>
					</div>
					<Paper>
						<TableContainer>
							<Table>
							<TableHead>
								<TableRow className="club-details-table-header">
									<TableCell className="club-details-table-header-cell">ת.ז</TableCell>
									<TableCell className="club-details-table-header-cell">שם פרטי</TableCell>
									<TableCell className="club-details-table-header-cell">שם משפחה</TableCell>
									<TableCell className="club-details-table-header-cell">טלפון</TableCell>
									<TableCell className="club-details-table-header-cell">פעולות</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{clubData.registeredChildren?.length > 0 ? (
									[...clubData.registeredChildren]
										.sort((a, b) => a.Fname.localeCompare(b.Fname, 'he'))
										.map((child) => (
											<TableRow key={child._id} hover>
												<TableCell className="club-details-table-body-cell">{child.childId}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.Fname}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.Lname}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.phone1}</TableCell>
												<TableCell className="club-details-table-body-cell">
													<Tooltip title="הסרת ילד" arrow>
														<IconButton className="club-details-delete-icon-button" onClick={() => handleRemoveChild(child)}>
															<DeleteIcon />
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>
										))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="club-details-empty-message">
											<Typography variant="body1" color="text.secondary">
												אין ילדים רשומים במועדונית
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						</TableContainer>
					</Paper>
				</>
			)}

			{/* Tab 1: Volunteers */}
			{tabValue === 1 && (
				<>
					<div className="club-details-controls-section">
						<div className="club-details-controls-flex">
							<div className="club-details-autocomplete-wrapper">
								<Autocomplete
									fullWidth
									options={availableVolunteers}
									getOptionLabel={(option) => `${option.fname} ${option.lname} - ${option.phone}`}
									value={selectedVolunteer}
									onChange={(event, newValue) => setSelectedVolunteer(newValue)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="חפש ובחר מתנדבת"
											placeholder="הקלד שם או טלפון"
											size="medium"
											fullWidth
										/>
									)}
									noOptionsText="לא נמצאו מתנדבות זמינות"
									isOptionEqualToValue={(option, value) => option._id === value._id}
								/>
							</div>
							<div className="club-details-autocomplete-wrapper">
								<Autocomplete
									fullWidth
									options={availableChildrenForVolunteer}
									getOptionLabel={(option) => `${option.Fname} ${option.Lname} (${option.childId})`}
									value={selectedChildForVolunteer}
									onChange={(event, newValue) => setSelectedChildForVolunteer(newValue)}
									disabled={!selectedVolunteer}
									renderInput={(params) => (
										<TextField
											{...params}
											label="בחר ילד (אופציונלי)"
											placeholder="חפש ילד..."
											size="medium"
											fullWidth
										/>
									)}
									noOptionsText={availableChildrenForVolunteer.length === 0 ? "אין ילדים זמינים" : "לא נמצאו תוצאות"}
									isOptionEqualToValue={(option, value) => option._id === value._id}
								/>
							</div>
							<Button
								variant="contained"
								onClick={handleAddVolunteer}
								disabled={!selectedVolunteer}
								className="club-details-add-button"
							>
								<AddIcon />
							</Button>
						</div>
					</div>
					<Paper>
						<TableContainer className="club-details-volunteers-table-container">
						<Table>
							<TableHead>
								<TableRow className="club-details-table-header">
									<TableCell className="club-details-table-header-cell">שם פרטי</TableCell>
									<TableCell className="club-details-table-header-cell">שם משפחה</TableCell>
									<TableCell className="club-details-table-header-cell">טלפון</TableCell>
									<TableCell className="club-details-table-header-cell">אימייל</TableCell>
									<TableCell className="club-details-table-header-cell">שומרת על</TableCell>
									<TableCell className="club-details-table-header-cell">פעולות</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
							{clubData.volunteers?.length > 0 ? (
								[...clubData.volunteers]
									.sort((a, b) => a.fname.localeCompare(b.fname, 'he'))
									.map((volunteer) => {
										const fullVolunteer = allVolunteers.find(v => v._id === volunteer._id) || volunteer;
										const clubEntry = fullVolunteer.clubs?.find(c => c.club?._id === id || c.club === id);
										const childName = clubEntry?.child 
											? `${clubEntry.child.Fname || ''} ${clubEntry.child.Lname || ''}`.trim()
											: 'ללא ילד';
										
										return (
											<TableRow key={volunteer._id} hover>
												<TableCell className="club-details-table-body-cell">{volunteer.fname}</TableCell>
												<TableCell className="club-details-table-body-cell">{volunteer.lname}</TableCell>
												<TableCell className="club-details-table-body-cell">{volunteer.phone}</TableCell>
												<TableCell className="club-details-table-body-cell">{volunteer.email || '-'}</TableCell>
											<TableCell className="club-details-table-body-cell">
												{childName !== 'ללא ילד' ? (
													<Chip label={childName} size="small" className="club-details-child-chip" />
												) : (
													<Typography variant="body2" color="text.secondary">
														{childName}
													</Typography>
												)}
											</TableCell>
											<TableCell className="club-details-table-body-cell">
												<Tooltip title="עדכון ילד למתנדבת" arrow>
													<IconButton
														className="club-details-edit-icon-button"
														onClick={() => handleEditVolunteerChild(fullVolunteer)}
													>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="הסרת מתנדבת" arrow>
													<IconButton className="club-details-delete-icon-button" onClick={() => handleRemoveVolunteer(volunteer)}>
														<DeleteIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={6} className="club-details-empty-message">
											<Typography variant="body1" color="text.secondary">
												אין מתנדבות במועדונית
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						</TableContainer>
					</Paper>
				</>
			)}

			{/* Tab 2: Waiting Children */}
			{tabValue === 2 && (
				<Paper>
					<TableContainer className="club-details-waiting-table-container">
						<Table>
							<TableHead>
								<TableRow className="club-details-table-header">
									<TableCell className="club-details-table-header-cell">ת.ז</TableCell>
									<TableCell className="club-details-table-header-cell">שם פרטי</TableCell>
									<TableCell className="club-details-table-header-cell">שם משפחה</TableCell>
									<TableCell className="club-details-table-header-cell">טלפון</TableCell>
									<TableCell className="club-details-table-header-cell">פעולות</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{clubData.waitingChildren?.length > 0 ? (
									[...clubData.waitingChildren]
										.sort((a, b) => a.Fname.localeCompare(b.Fname, 'he'))
										.map((child) => (
											<TableRow key={child._id} hover>
												<TableCell className="club-details-table-body-cell">{child.childId}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.Fname}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.Lname}</TableCell>
												<TableCell className="club-details-table-body-cell">{child.phone1}</TableCell>
												<TableCell className="club-details-table-body-cell">
													<Tooltip title="אישור בקשה" arrow>
														<IconButton
															className="club-details-check-icon-button"
															onClick={() => handleApproveWaitingChild(child)}
														>
															<CheckIcon />
														</IconButton>
													</Tooltip>
													<Tooltip title="דחיית בקשה" arrow>
														<IconButton
															className="club-details-clear-icon-button"
															onClick={() => handleRejectWaitingChild(child)}
														>
															<ClearIcon />
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>
										))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="club-details-empty-message">
											<Typography variant="body1" color="text.secondary">
												אין בקשות ממתינות
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			)}

			{/* Delete Child Dialog */}
			<Dialog 
				open={deleteChildDialog.open} 
				onClose={() => setDeleteChildDialog({ open: false, childId: null, childName: "" })}
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
				dir="rtl"
			>
				<DialogTitle className="dialog-title">
					<Typography variant="h5" className="dialog-title-text">
						אישור מחיקה
					</Typography>
					<IconButton onClick={() => setDeleteChildDialog({ open: false, childId: null, childName: "" })} className="dialog-close-button">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך להסיר את <strong>{deleteChildDialog.childName}</strong> מהמועדונית?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteChildDialog({ open: false, childId: null, childName: "" })}>
						ביטול
					</Button>
					<Button onClick={confirmRemoveChild} color="error" variant="contained">
						מחק
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Volunteer Dialog */}
			<Dialog 
				open={deleteVolunteerDialog.open} 
				onClose={() => setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" })}
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
				dir="rtl"
			>
				<DialogTitle className="dialog-title">
					<Typography variant="h5" className="dialog-title-text">
						אישור מחיקה
					</Typography>
					<IconButton onClick={() => setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" })} className="dialog-close-button">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך להסיר את <strong>{deleteVolunteerDialog.volunteerName}</strong> מהמועדונית?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" })}>
						ביטול
					</Button>
					<Button onClick={confirmRemoveVolunteer} color="error" variant="contained">
						מחק
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Volunteer Child Dialog */}
			<Dialog 
				open={editVolunteerChild.open} 
				onClose={() => setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null })} 
				maxWidth="sm" 
				fullWidth
				aria-labelledby="edit-volunteer-child-title"
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
				dir="rtl"
			>
				<DialogTitle className="dialog-title">
					<Typography variant="h5" className="dialog-title-text">
						עדכון ילד למתנדבת
					</Typography>
					<IconButton onClick={() => setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null })} className="dialog-close-button">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<div className="club-details-edit-volunteer-content">
						<Typography variant="body2" className="club-details-edit-volunteer-subtitle">
							מתנדבת: {editVolunteerChild.volunteer?.fname} {editVolunteerChild.volunteer?.lname}
						</Typography>
						<Autocomplete
							fullWidth
						options={[
							...availableChildrenForVolunteer,
							...(editVolunteerChild.currentChild && 
								!availableChildrenForVolunteer.some(c => c._id === editVolunteerChild.currentChild) && 
								clubData?.registeredChildren?.find(c => c._id === editVolunteerChild.currentChild)
									? [clubData.registeredChildren.find(c => c._id === editVolunteerChild.currentChild)]
									: [])
						]}
						getOptionLabel={(option) => {
							if (!option) return '';
							const originalChild = editVolunteerChild.clubEntry?.child?._id || editVolunteerChild.clubEntry?.child;
							const isCurrentChild = originalChild && option._id === originalChild;
							return `${option.Fname} ${option.Lname} (${option.childId})${isCurrentChild ? ' - נוכחי' : ''}`;
						}}
						value={clubData?.registeredChildren?.find(c => c._id === editVolunteerChild.currentChild) || null}
						onChange={(event, newValue) => setEditVolunteerChild(prev => ({ ...prev, currentChild: newValue?._id || null }))}
							renderInput={(params) => (
								<TextField
									{...params}
									label="חפש ובחר ילד"
									placeholder="הקלד שם או ת.ז (השאר ריק להסרה)"
									size="medium"
									fullWidth
								/>
							)}
							noOptionsText="לא נמצאו ילדים זמינים"
							isOptionEqualToValue={(option, value) => option._id === value._id}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null })}>
						ביטול
					</Button>
					<Button onClick={() => handleUpdateVolunteerChild(editVolunteerChild.currentChild)} variant="contained">
						עדכן
					</Button>
				</DialogActions>
			</Dialog>

			{/* Reject Waiting Child Dialog */}
			<Dialog 
				open={confirmRejectWaitingChild.open} 
				onClose={() => setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" })}
				aria-labelledby="reject-child-title"
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
				dir="rtl"
			>
				<DialogTitle className="dialog-title">
					<Typography variant="h5" className="dialog-title-text">
						אישור דחייה
					</Typography>
					<IconButton onClick={() => setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" })} className="dialog-close-button">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך לדחות את בקשת ההצטרפות של <strong>{confirmRejectWaitingChild.childName}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" })}>
						ביטול
					</Button>
					<Button onClick={confirmRejectChild} color="error" variant="contained">
						דחה בקשה
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ClubDetailsPage;
