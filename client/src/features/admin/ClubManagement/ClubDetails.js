import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Stack,
	IconButton,
	Grid,
	Paper,
	List,
	ListItem,
	ListItemText,
	Divider,
	Chip,
	TextField,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Tabs,
	Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { useDispatch, useSelector } from "react-redux";
import { closeClubDetails } from "./ClubManagementSlice";
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

const ClubDetails = ({ onUpdate }) => {
	const dispatch = useDispatch();
	const open = useSelector((state) => state.clubManagement?.clubDetailsOpen || false);
	const selectedClub = useSelector((state) => state.clubManagement?.selectedClub);

	const [currentTab, setCurrentTab] = useState(0);
	const [selectedChildId, setSelectedChildId] = useState("");
	const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
	const [selectedChildForVolunteer, setSelectedChildForVolunteer] = useState("");
	const [deleteChildDialog, setDeleteChildDialog] = useState({ open: false, childId: null, childName: "" });
	const [deleteVolunteerDialog, setDeleteVolunteerDialog] = useState({ open: false, volunteerId: null, volunteerName: "" });
	const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
	const [confirmRejectWaitingChild, setConfirmRejectWaitingChild] = useState({ open: false, childId: null, childName: "" });

	const { data: clubData, refetch } = useGetClubByIdQuery(selectedClub?._id, {
		skip: !selectedClub?._id,
	});
	const { data: allChildren = [] } = useGetChildrenQuery();
	const { data: allVolunteers = [], refetch: refetchVolunteers } = useGetVolunteersQuery();

	const [addChildToClub] = useAddChildToClubMutation();
	const [addClubToVolunteer] = useAddClubToVolunteerMutation();
	const [addVolunteerToClub] = useAddVolunteerToClubMutation();
	const [updateClubInVolunteer] = useUpdateClubInVolunteerMutation();
	const [removeChildFromClub] = useRemoveChildFromClubMutation();
	const [removeVolunteerFromClub] = useRemoveVolunteerFromClubMutation();
	const [refuseChildFromClub] = useRefuseChildFromClubMutation();

	useEffect(() => {
		if (open && selectedClub?._id) {
			refetch();
		}
	}, [open, selectedClub, refetch]);

	const [editVolunteerChild, setEditVolunteerChild] = useState({ open: false, volunteer: null, currentChild: null, clubEntry: null });

	const handleClose = () => {
		dispatch(closeClubDetails());
		setCurrentTab(0);
		setSelectedChildId("");
		setSelectedVolunteerId("");
		setSelectedChildForVolunteer("");
		setDeleteChildDialog({ open: false, childId: null, childName: "" });
		setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" });
		setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null });
	};

	const handleAddChild = async () => {
		if (!selectedChildId) return;

		try {
			await addChildToClub({
				childId: selectedChildId,
				clubId: selectedClub._id,
			}).unwrap();
			setSelectedChildId("");
			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to add child:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בהוספת ילד למועדונית" });
		}
	};

	const handleRemoveChild = (childId, childName) => {
		setDeleteChildDialog({ open: true, childId, childName });
	};

	const confirmRemoveChild = async () => {
		const { childId } = deleteChildDialog;
		setDeleteChildDialog({ open: false, childId: null, childName: "" });

		try {
			await removeChildFromClub({
				clubId: selectedClub._id,
				childId: childId,
			}).unwrap();
			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to remove child:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בהסרת ילד" });
		}
	};

	const handleEditVolunteerChild = (volunteer) => {
		// מצא את המתנדבת המלאה עם כל המועדוניות מ-allVolunteers
		const fullVolunteer = allVolunteers.find(v => v._id === volunteer._id) || volunteer;
		
		// מצא את הילד הנוכחי של המתנדבת במועדונית הזו
		const clubEntry = fullVolunteer.clubs?.find(c => c.club?._id === selectedClub._id || c.club === selectedClub._id);
		const currentChild = clubEntry?.child?._id || clubEntry?.child || null;
		setEditVolunteerChild({ open: true, volunteer: fullVolunteer, currentChild, clubEntry });
	};

	const handleUpdateVolunteerChild = async (newChildId) => {
		const { volunteer, clubEntry } = editVolunteerChild;
		
		try {
			if (!clubEntry || !clubEntry._id) {
				setErrorDialog({ open: true, message: "לא נמצאה מועדונית עבור מתנדבת זו" });
				console.error("Missing club entry:", { volunteer, clubEntry, selectedClub });
				return;
			}

		await updateClubInVolunteer({
			volunteerId: volunteer._id,
			clubId: clubEntry._id,
			clubData: { child: newChildId || null }
		}).unwrap();

		setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null });
		await refetch();
		await refetchVolunteers();
		if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to update child for volunteer:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בעדכון ילד" });
		}
	};

	const handleAddVolunteer = async () => {
		if (!selectedVolunteerId) {
			setErrorDialog({ open: true, message: "יש לבחור מתנדבת" });
			return;
		}

		try {
			// אם נבחר ילד, נשתמש בפונקציה שמוסיפה גם את הילד
			if (selectedChildForVolunteer) {
				// נוסיף את המועדונית עם הילד למתנדבת
				// הפונקציה הזו כבר מוסיפה את המתנדבת גם למועדונית
				await addClubToVolunteer({
					volunteerId: selectedVolunteerId,
					clubId: selectedClub._id,
					child: selectedChildForVolunteer,
				}).unwrap();
			} else {
				// אם לא נבחר ילד, רק נוסיף את המתנדבת למועדונית
				await addVolunteerToClub({
					volunteerId: selectedVolunteerId,
					clubId: selectedClub._id,
				}).unwrap();
			}

			setSelectedVolunteerId("");
			setSelectedChildForVolunteer("");
			
			// רענון נתונים
			await refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to add volunteer to club:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בהוספת מתנדבת למועדונית" });
		}
	};

	const handleRemoveVolunteer = (volunteerId, volunteerName) => {
		setDeleteVolunteerDialog({ open: true, volunteerId, volunteerName });
	};

	const confirmRemoveVolunteer = async () => {
		const { volunteerId } = deleteVolunteerDialog;
		setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" });

		try {
			await removeVolunteerFromClub({
				volunteerId,
				clubId: selectedClub._id,
			}).unwrap();
			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to remove volunteer:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בהסרת מתנדבת" });
		}
	};

	// טיפול בבקשות ממתינות - אישור
	const handleApproveWaitingChild = async (childId) => {
		try {
			await addChildToClub({
				childId: childId,
				clubId: selectedClub._id,
			}).unwrap();
			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to approve child:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה באישור הילד" });
		}
	};

	// טיפול בבקשות ממתינות - דחייה
	const handleRejectWaitingChild = async (child) => {
		setConfirmRejectWaitingChild({ open: true, childId: child._id, childName: `${child.firstName} ${child.lastName}` });
	};

	const confirmRejectChild = async () => {
		const { childId } = confirmRejectWaitingChild;
		setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" });

		try {
			await refuseChildFromClub({
				childId: childId,
				clubId: selectedClub._id,
			}).unwrap();
			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to reject child:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בדחיית הילד" });
		}
	};

	// סינון ילדים ומתנדבות שעדיין לא במועדונית
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

	// סינון ילדים שעדיין אין להם מתנדבת במועדונית זו
	// נבדוק אילו ילדים כבר משוייכים למתנדבות במועדונית הנוכחית
	const childrenWithVolunteers = new Set();
	
	// עוברים על כל המתנדבות במועדונית
	allVolunteers.forEach(volunteer => {
		// בודקים אם למתנדבת יש את המועדונית הנוכחית
		volunteer.clubs?.forEach(club => {
			const clubId = club.club?._id || club.club;
			if (clubId === selectedClub?._id && club.child) {
				// אם זה אובייקט, נקח את ה-_id שלו, אחרת זה כבר string של ID
				const childId = typeof club.child === 'object' ? club.child._id : club.child;
				if (childId) {
					childrenWithVolunteers.add(childId.toString());
				}
			}
		});
	});

	// ילדים זמינים להשמה עם מתנדבת - רק ילדים שרשומים למועדונית וללא מתנדבת
	const availableChildrenForVolunteer = clubData?.registeredChildren?.filter(
		(child) => !childrenWithVolunteers.has(child._id.toString())
	) || [];

	if (!selectedClub) return null;

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">{clubData?.name || selectedClub.name}</Typography>
					<IconButton onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent dividers>
				<Stack spacing={3}>
					{/* פרטי המועדונית */}
					<Paper elevation={2} sx={{ p: 2 }}>
						<Typography variant="h6" gutterBottom>
							פרטי המועדונית
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									יום פעילות
								</Typography>
								<Typography variant="body1">{clubData?.activityDay}</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									שעות פעילות
								</Typography>
								<Typography variant="body1">
									{clubData?.startTime} - {clubData?.endTime}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="body2" color="text.secondary">
									מיקום
								</Typography>
								<Typography variant="body1">{clubData?.location}</Typography>
							</Grid>
						</Grid>

						{/* מנהלי המועדונית */}
						{clubData?.clubManagers?.length > 0 && (
							<Box mt={2}>
								<Typography variant="subtitle2" gutterBottom>
									מנהלי המועדונית
								</Typography>
								{clubData.clubManagers.map((manager, index) => (
									<Box key={index} sx={{ mb: 1 }}>
										<Typography variant="body2">
											{manager.name} - {manager.phone}
											{manager.email && ` - ${manager.email}`}
										</Typography>
									</Box>
								))}
							</Box>
						)}
					</Paper>

					{/* טאבים לילדים, מתנדבות ובקשות */}
					<Box>
						<Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
							<Tab
								icon={<ChildCareIcon />}
								label={`ילדים רשומים (${clubData?.registeredChildren?.length || 0})`}
								iconPosition="start"
							/>
							<Tab
								icon={<PersonIcon />}
								label={`מתנדבות (${clubData?.volunteers?.length || 0})`}
								iconPosition="start"
							/>
							<Tab
								icon={<HourglassEmptyIcon />}
								label={`בקשות ממתינות (${clubData?.waitingChildren?.length || 0})`}
								iconPosition="start"
							/>
						</Tabs>

						{/* תוכן טאב ילדים */}
						{currentTab === 0 && (
							<Box sx={{ mt: 2 }}>
								{/* הוספת ילד */}
								<Paper elevation={1} sx={{ p: 2, mb: 2 }}>
									<Typography variant="subtitle2" gutterBottom>
										הוסף ילד למועדונית
									</Typography>
									<Stack direction="row" spacing={2} alignItems="center">
										<FormControl fullWidth>
											<InputLabel>בחר ילד</InputLabel>
											<Select
												value={selectedChildId}
												onChange={(e) => setSelectedChildId(e.target.value)}
												label="בחר ילד"
											>
												{availableChildren.map((child) => (
													<MenuItem key={child._id} value={child._id}>
														{child.Fname} {child.Lname} - {child.childId}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										<Button
											variant="contained"
											startIcon={<AddIcon />}
											onClick={handleAddChild}
											disabled={!selectedChildId}
										>
											הוסף
										</Button>
									</Stack>
								</Paper>

								{/* רשימת ילדים */}
								<Paper elevation={1} sx={{ p: 2 }}>
									<Typography variant="subtitle2" gutterBottom>
										ילדים רשומים
									</Typography>
									{clubData?.registeredChildren?.length === 0 ? (
										<Typography variant="body2" color="text.secondary">
											אין ילדים רשומים במועדונית
										</Typography>
									) : (
										<List>
											{clubData?.registeredChildren?.map((child, index) => (
												<React.Fragment key={child._id}>
													{index > 0 && <Divider />}
													<ListItem
														secondaryAction={
															<IconButton
																edge="end"
																color="error"
																onClick={() => handleRemoveChild(child._id, `${child.Fname} ${child.Lname}`)}
															>
																<DeleteIcon />
															</IconButton>
														}
													>
														<ListItemText
															primary={`${child.Fname} ${child.Lname}`}
															secondary={`ת.ז: ${child.childId} | טלפון: ${child.phone1}`}
														/>
													</ListItem>
												</React.Fragment>
											))}
										</List>
									)}
								</Paper>
							</Box>
						)}

						{/* תוכן טאב מתנדבות */}
						{currentTab === 1 && (
							<Box sx={{ mt: 2 }}>
								{/* הוספת מתנדבת */}
								<Paper elevation={1} sx={{ p: 2, mb: 2 }}>
									<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
										הוסף מתנדבת למועדונית
									</Typography>
									<Grid container spacing={2}>
										<Grid item xs={12} md={6}>
											<FormControl fullWidth>
												<InputLabel>בחר מתנדבת</InputLabel>
												<Select
													value={selectedVolunteerId}
													onChange={(e) => setSelectedVolunteerId(e.target.value)}
													label="בחר מתנדבת"
												>
													{availableVolunteers.map((volunteer) => (
														<MenuItem key={volunteer._id} value={volunteer._id}>
															{volunteer.fname} {volunteer.lname} - {volunteer.phone}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</Grid>
										<Grid item xs={12} md={6}>
											<FormControl fullWidth disabled={!selectedVolunteerId}>
												<InputLabel>בחר ילד (אופציונלי)</InputLabel>
												<Select
													value={selectedChildForVolunteer}
													onChange={(e) => setSelectedChildForVolunteer(e.target.value)}
													label="בחר ילד (אופציונלי)"
												>
													<MenuItem value="">
														<em>ללא ילד</em>
													</MenuItem>
													{availableChildrenForVolunteer.length === 0 ? (
														<MenuItem disabled value="">
															אין ילדים זמינים (כל הילדים כבר משוייכים למתנדבות)
														</MenuItem>
													) : (
														availableChildrenForVolunteer.map((child) => (
															<MenuItem key={child._id} value={child._id}>
																{child.Fname} {child.Lname} ({child.childId})
															</MenuItem>
														))
													)}
												</Select>
											</FormControl>
										</Grid>
										<Grid item xs={12}>
											<Button
												variant="contained"
												startIcon={<AddIcon />}
												onClick={handleAddVolunteer}
												disabled={!selectedVolunteerId}
												fullWidth
											>
												הוסף מתנדבת
											</Button>
										</Grid>
									</Grid>
								</Paper>

								{/* רשימת מתנדבות */}
								<Paper elevation={1} sx={{ p: 2 }}>
									<Typography variant="subtitle2" gutterBottom>
										מתנדבות במועדונית
									</Typography>
									{clubData?.volunteers?.length === 0 ? (
										<Typography variant="body2" color="text.secondary">
											אין מתנדבות במועדונית
										</Typography>
									) : (
										<List>
											{clubData?.volunteers?.map((volunteer, index) => {
												// מצא את המתנדבת המלאה עם כל המועדוניות
												const fullVolunteer = allVolunteers.find(v => v._id === volunteer._id) || volunteer;
												
												// מצא את הילד שהמתנדבת שומרת עליו במועדונית הזו
												const clubEntry = fullVolunteer.clubs?.find(c => c.clubName === selectedClub.name);
												const childName = clubEntry?.child 
													? `${clubEntry.child.Fname || ''} ${clubEntry.child.Lname || ''}`.trim()
													: 'ללא ילד';
												
												return (
													<React.Fragment key={volunteer._id}>
														{index > 0 && <Divider />}
														<ListItem
															secondaryAction={
																<Stack direction="row" spacing={1}>
																	<Button
																		size="small"
																		variant="outlined"
																		onClick={() => handleEditVolunteerChild(fullVolunteer)}
																	>
																		עדכן ילד
																	</Button>
																	<IconButton
																		edge="end"
																		color="error"
																		onClick={() => handleRemoveVolunteer(volunteer._id, `${volunteer.fname} ${volunteer.lname}`)}
																	>
																		<DeleteIcon />
																	</IconButton>
																</Stack>
															}
														>
															<ListItemText
																primary={`${volunteer.fname} ${volunteer.lname}`}
																secondary={
																	<>
																		טלפון: {volunteer.phone} | אימייל: {volunteer.email || 'לא צוין'}
																		<br />
																		👶 שומרת על: {childName}
																	</>
																}
															/>
														</ListItem>
													</React.Fragment>
												);
											})}
										</List>
									)}
								</Paper>
							</Box>
						)}

						{/* תוכן טאב בקשות ממתינות */}
						{currentTab === 2 && (
							<Box sx={{ mt: 2 }}>
								<Paper elevation={1} sx={{ p: 2 }}>
									<Typography variant="subtitle2" gutterBottom>
										בקשות ממתינות לאישור
									</Typography>
									{clubData?.waitingChildren?.length === 0 ? (
										<Typography variant="body2" color="text.secondary">
											אין בקשות ממתינות
										</Typography>
									) : (
										<List>
											{clubData?.waitingChildren?.map((child, index) => (
												<React.Fragment key={child._id}>
													{index > 0 && <Divider />}
													<ListItem
														secondaryAction={
															<Stack direction="row" spacing={1}>
																<IconButton
																	color="success"
																	onClick={() => handleApproveWaitingChild(child._id)}
																	title="אשר בקשה"
																>
																	<CheckIcon />
																</IconButton>
																<IconButton
																	color="error"
																	onClick={() => handleRejectWaitingChild(child)}
																	title="דחה בקשה"
																>
																	<ClearIcon />
																</IconButton>
															</Stack>
														}
													>
														<ListItemText
															primary={`${child.Fname} ${child.Lname}`}
															secondary={`ת.ז: ${child.childId} | טלפון: ${child.phone1}`}
														/>
													</ListItem>
												</React.Fragment>
											))}
										</List>
									)}
								</Paper>
							</Box>
						)}
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose}>סגור</Button>
			</DialogActions>

			{/* דיאלוג למחיקת ילד */}
			<Dialog open={deleteChildDialog.open} onClose={() => setDeleteChildDialog({ open: false, childId: null, childName: "" })}>
				<DialogTitle>אישור מחיקה</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך להסיר את {deleteChildDialog.childName} מהמועדונית?
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

			{/* דיאלוג למחיקת מתנדבת */}
			<Dialog open={deleteVolunteerDialog.open} onClose={() => setDeleteVolunteerDialog({ open: false, volunteerId: null, volunteerName: "" })}>
				<DialogTitle>אישור מחיקה</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך להסיר את {deleteVolunteerDialog.volunteerName} מהמועדונית?
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

			{/* דיאלוג לעדכון ילד למתנדבת */}
			<Dialog open={editVolunteerChild.open} onClose={() => setEditVolunteerChild({ open: false, volunteer: null, currentChild: null, clubEntry: null })} maxWidth="sm" fullWidth>
				<DialogTitle>עדכון ילד למתנדבת</DialogTitle>
				<DialogContent>
					<Box sx={{ mt: 2 }}>
						<Typography variant="body2" sx={{ mb: 2 }}>
							מתנדבת: {editVolunteerChild.volunteer?.fname} {editVolunteerChild.volunteer?.lname}
						</Typography>
						<FormControl fullWidth>
							<InputLabel>בחר ילד</InputLabel>
							<Select
								value={editVolunteerChild.currentChild || ""}
								onChange={(e) => setEditVolunteerChild(prev => ({ ...prev, currentChild: e.target.value }))}
								label="בחר ילד"
							>
								<MenuItem value="">
									<em>ללא ילד</em>
								</MenuItem>
								{availableChildrenForVolunteer.map((child) => (
									<MenuItem key={child._id} value={child._id}>
										{child.Fname} {child.Lname} ({child.childId})
									</MenuItem>
								))}
								{/* הוסף את הילד הנוכחי אם הוא קיים ולא ברשימה */}
								{editVolunteerChild.currentChild && 
								 !availableChildrenForVolunteer.some(c => c._id === editVolunteerChild.currentChild) && 
								 clubData?.registeredChildren?.find(c => c._id === editVolunteerChild.currentChild) && (
									<MenuItem value={editVolunteerChild.currentChild}>
										{(() => {
											const child = clubData.registeredChildren.find(c => c._id === editVolunteerChild.currentChild);
											return child ? `${child.Fname} ${child.Lname} (${child.childId}) - נוכחי` : '';
										})()}
									</MenuItem>
								)}
							</Select>
						</FormControl>
					</Box>
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

			{/* דיאלוג שגיאה */}
			<Dialog open={errorDialog.open} onClose={() => setErrorDialog({ open: false, message: "" })} dir="rtl">
				<DialogTitle sx={{ color: "error.main" }}>שגיאה</DialogTitle>
				<DialogContent>
					<Typography>{errorDialog.message}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setErrorDialog({ open: false, message: "" })} variant="contained">
						סגור
					</Button>
				</DialogActions>
			</Dialog>

			{/* דיאלוג אישור דחיית ילד ממתין */}
			<Dialog open={confirmRejectWaitingChild.open} onClose={() => setConfirmRejectWaitingChild({ open: false, childId: null, childName: "" })} dir="rtl">
				<DialogTitle>אישור דחייה</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך לדחות את בקשת ההצטרפות של {confirmRejectWaitingChild.childName}?
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
		</Dialog>
	);
};

export default ClubDetails;
