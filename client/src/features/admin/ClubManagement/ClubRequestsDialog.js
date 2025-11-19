import React, { useState } from "react";
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
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { useDispatch, useSelector } from "react-redux";
import { closeClubRequestsDialog } from "./ClubManagementSlice";
import {
	useGetAllClubRequestsQuery,
	useDeleteClubRequestMutation,
} from "../../../api/clubRequestApi";
import { useAddChildToClubMutation, useRefuseChildFromClubMutation } from "../../../api/clubApi";

const ClubRequestsDialog = ({ onUpdate }) => {
	const dispatch = useDispatch();
	const open = useSelector((state) => state.clubManagement?.clubRequestsDialogOpen || false);
	const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
	const [confirmRejectDialog, setConfirmRejectDialog] = useState({ open: false, request: null });

	const { data: clubRequests = [], refetch } = useGetAllClubRequestsQuery();
	const [deleteClubRequest] = useDeleteClubRequestMutation();
	const [addChildToClub] = useAddChildToClubMutation();
	const [refuseChildFromClub] = useRefuseChildFromClubMutation();

	const handleClose = () => {
		dispatch(closeClubRequestsDialog());
	};

	const handleApprove = async (request) => {
		try {
			// הוספת הילד למועדונית
			await addChildToClub({
				childId: request.childId._id,
				clubId: request.clubId._id,
			}).unwrap();

			// מחיקת הבקשה
			await deleteClubRequest(request._id).unwrap();

			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to approve request:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה באישור הבקשה" });
		}
	};

	const handleReject = async (request) => {
		setConfirmRejectDialog({ open: true, request });
	};

	const confirmReject = async () => {
		const request = confirmRejectDialog.request;
		setConfirmRejectDialog({ open: false, request: null });

		try {
			// סימון הילד כנדחה במועדונית
			await refuseChildFromClub({
				childId: request.childId._id,
				clubId: request.clubId._id,
			}).unwrap();

			// מחיקת הבקשה
			await deleteClubRequest(request._id).unwrap();

			refetch();
			if (onUpdate) onUpdate();
		} catch (error) {
			console.error("Failed to reject request:", error);
			setErrorDialog({ open: true, message: error.data?.message || "שגיאה בדחיית הבקשה" });
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">בקשות הצטרפות למועדוניות</Typography>
					<IconButton onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent dividers>
				{clubRequests.length === 0 ? (
					<Box sx={{ py: 4, textAlign: "center" }}>
						<Typography variant="body1" color="text.secondary">
							אין בקשות ממתינות
						</Typography>
					</Box>
				) : (
					<TableContainer component={Paper} variant="outlined">
						<Table>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
										שם הילד
									</TableCell>
									<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
										ת.ז ילד
									</TableCell>
									<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
										מועדונית
									</TableCell>
									<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
										תאריך בקשה
									</TableCell>
									<TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
										פעולות
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{clubRequests.map((request) => (
									<TableRow key={request._id} hover>
										<TableCell sx={{ textAlign: "center" }}>
											{request.childId?.Fname} {request.childId?.Lname}
										</TableCell>
										<TableCell sx={{ textAlign: "center" }}>
											{request.childId?.childId}
										</TableCell>
										<TableCell sx={{ textAlign: "center" }}>
											{request.clubId?.name}
										</TableCell>
										<TableCell sx={{ textAlign: "center" }}>
											{new Date(request.createdAt).toLocaleDateString("he-IL")}
										</TableCell>
										<TableCell sx={{ textAlign: "center" }}>
											<Stack direction="row" spacing={1} justifyContent="center">
												<IconButton
													color="success"
													onClick={() => handleApprove(request)}
													title="אשר בקשה"
												>
													<CheckIcon />
												</IconButton>
												<IconButton
													color="error"
													onClick={() => handleReject(request)}
													title="דחה בקשה"
												>
													<ClearIcon />
												</IconButton>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose}>סגור</Button>
			</DialogActions>

			{/* דיאלוג אישור דחייה */}
			<Dialog open={confirmRejectDialog.open} onClose={() => setConfirmRejectDialog({ open: false, request: null })} dir="rtl">
				<DialogTitle>אישור דחייה</DialogTitle>
				<DialogContent>
					<Typography>
						האם אתה בטוח שברצונך לדחות את בקשת ההצטרפות של {confirmRejectDialog.request?.childId?.firstName} {confirmRejectDialog.request?.childId?.lastName} למועדונית {confirmRejectDialog.request?.clubId?.name}?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmRejectDialog({ open: false, request: null })}>ביטול</Button>
					<Button onClick={confirmReject} color="error" variant="contained">דחה בקשה</Button>
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
		</Dialog>
	);
};

export default ClubRequestsDialog;
