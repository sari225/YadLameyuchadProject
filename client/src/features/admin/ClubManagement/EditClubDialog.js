import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
	Alert,
	CircularProgress,
	Box,
	Typography,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	IconButton,
	Paper,
	Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateClubMutation } from "../../../api/clubApi";
import { parseServerError } from "../../../utils/errorHandler";

// =============================
//     סכמת Zod מלאה לעריכה
// =============================
const clubManagerSchema = z.object({
	name: z.string().min(1, "יש להזין שם מנהל"),
	phone: z
		.string()
		.min(1, "יש להזין מספר טלפון")
		.regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
		.min(9, "טלפון חייב להיות לפחות 9 ספרות")
		.max(10, "טלפון יכול להיות עד 10 ספרות"),
	email: z
		.string()
		.min(1, "יש להזין אימייל")
		.email("כתובת אימייל לא תקינה"),
});

const editClubSchema = z.object({
	name: z
		.string()
		.min(1, "יש להזין שם מועדונית")
		.max(100, "שם המועדונית יכול להכיל עד 100 תווים"),
	activityDay: z.string().min(1, "יש לבחור יום פעילות"),
	startTime: z.string().min(1, "יש להזין שעת התחלה"),
	endTime: z.string().min(1, "יש להזין שעת סיום"),
	location: z
		.string()
		.min(1, "יש להזין מיקום")
		.max(200, "המיקום יכול להכיל עד 200 תווים"),
	clubManagers: z.array(clubManagerSchema).min(1, "יש להוסיף לפחות מנהל אחד"),
});

// =============================
//      קומפוננטת עריכה מלאה
// =============================
const EditClubDialog = ({ open, onClose, club, onSuccess }) => {
	const [serverError, setServerError] = useState("");
	const [successDialog, setSuccessDialog] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(editClubSchema),
		defaultValues: {
			name: "",
			activityDay: "",
			startTime: "",
			endTime: "",
			location: "",
			clubManagers: [{ name: "", phone: "", email: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "clubManagers",
	});

	const [updateClub, { isLoading: isSaving }] = useUpdateClubMutation();

	// טעינת נתונים כשנפתח הדיאלוג
	useEffect(() => {
		if (open && club) {
			const managersData = club.clubManagers?.length
				? club.clubManagers.map((m) => ({
						name: m.name || "",
						phone: m.phone || "",
						email: m.email || "",
				  }))
				: [{ name: "", phone: "", email: "" }];

			reset({
				name: club.name || "",
				activityDay: club.activityDay || "",
				startTime: club.startTime || "",
				endTime: club.endTime || "",
				location: club.location || "",
				clubManagers: managersData,
			});
		}
	}, [open, club, reset]);

	// שליחת עדכון לשרת
	const onSubmit = async (data) => {
		setServerError("");

		try {
			// clubApi.updateClub expects an object: { id, clubData }
			await updateClub({ id: club._id, clubData: data }).unwrap();
			setSuccessDialog(true);
		} catch (error) {
			const errorMessage = parseServerError(error, "❌ שגיאה בעדכון מועדונית. אנא בדוק את הנתונים ונסה שוב.");
			setServerError(errorMessage);
		}
	};

	// סגירה מאפסת ערכים
	const handleClose = () => {
		setServerError("");
		reset();
		onClose();
	};

	const handleSuccessClose = () => {
		setSuccessDialog(false);
		if (onSuccess) onSuccess();
		onClose();
	};

	return (
		<>
			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth dir="rtl">
				<DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
					ערוך מועדונית: {club?.name}
				</DialogTitle>

				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent dividers>
						{serverError && (
							<Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError("")}>
								{serverError}
							</Alert>
						)}

						<Grid container spacing={2}>
							{/* שם המועדונית */}
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="שם המועדונית *"
									{...register("name")}
									error={!!errors.name}
									helperText={errors.name?.message}
								/>
							</Grid>

							{/* יום פעילות */}
							<Grid item xs={12} sm={6}>
								<FormControl fullWidth error={!!errors.activityDay}>
									<InputLabel>יום פעילות *</InputLabel>
									<Controller
										name="activityDay"
										control={control}
										render={({ field }) => (
											<Select {...field} label="יום פעילות *">
												<MenuItem value="ראשון">ראשון</MenuItem>
												<MenuItem value="שני">שני</MenuItem>
												<MenuItem value="שלישי">שלישי</MenuItem>
												<MenuItem value="רביעי">רביעי</MenuItem>
												<MenuItem value="חמישי">חמישי</MenuItem>
												<MenuItem value="שישי">שישי</MenuItem>
											</Select>
										)}
									/>
									{errors.activityDay && (
										<Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
											{errors.activityDay.message}
										</Typography>
									)}
								</FormControl>
							</Grid>

							{/* שעת התחלה */}
							<Grid item xs={12} sm={3}>
								<TextField
									fullWidth
									label="שעת התחלה *"
									type="time"
									{...register("startTime")}
									error={!!errors.startTime}
									helperText={errors.startTime?.message}
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>

							{/* שעת סיום */}
							<Grid item xs={12} sm={3}>
								<TextField
									fullWidth
									label="שעת סיום *"
									type="time"
									{...register("endTime")}
									error={!!errors.endTime}
									helperText={errors.endTime?.message}
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>

							{/* מיקום */}
							<Grid item xs={12}>
								<TextField
									fullWidth
									label="מיקום *"
									{...register("location")}
									error={!!errors.location}
									helperText={errors.location?.message}
								/>
							</Grid>

							{/* מנהלי מועדונית */}
							<Grid item xs={12}>
								<Divider sx={{ my: 2 }} />
								<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
									<Typography variant="h6">מנהלי המועדונית *</Typography>
									<Button
										variant="outlined"
										startIcon={<AddIcon />}
										onClick={() => append({ name: "", phone: "", email: "" })}
										size="small"
									>
										הוסף מנהל
									</Button>
								</Box>
								{errors.clubManagers && typeof errors.clubManagers.message === "string" && (
									<Alert severity="error" sx={{ mb: 2 }}>
										{errors.clubManagers.message}
									</Alert>
								)}
							</Grid>

							{fields.map((field, index) => (
								<Grid item xs={12} key={field.id}>
									<Paper elevation={2} sx={{ p: 2, position: "relative" }}>
										<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
											<Typography variant="subtitle2" color="primary">
												מנהל {index + 1}
											</Typography>
											{fields.length > 1 && (
												<IconButton
													size="small"
													color="error"
													onClick={() => remove(index)}
												>
													<DeleteIcon />
												</IconButton>
											)}
										</Box>
										<Grid container spacing={2}>
											<Grid item xs={12} sm={4}>
												<TextField
													fullWidth
													label="שם מלא *"
													{...register(`clubManagers.${index}.name`)}
													error={!!errors.clubManagers?.[index]?.name}
													helperText={errors.clubManagers?.[index]?.name?.message}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													fullWidth
													label="טלפון *"
													{...register(`clubManagers.${index}.phone`)}
													error={!!errors.clubManagers?.[index]?.phone}
													helperText={errors.clubManagers?.[index]?.phone?.message}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													fullWidth
													label="אימייל *"
													type="email"
													{...register(`clubManagers.${index}.email`)}
													error={!!errors.clubManagers?.[index]?.email}
													helperText={errors.clubManagers?.[index]?.email?.message}
												/>
											</Grid>
										</Grid>
									</Paper>
								</Grid>
							))}
						</Grid>
					</DialogContent>

					<DialogActions sx={{ p: 2 }}>
						<Button onClick={handleClose} disabled={isSaving}>
							ביטול
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSaving}
							startIcon={isSaving && <CircularProgress size={20} />}
						>
							{isSaving ? "שומר..." : "עדכן מועדונית"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* דיאלוג הצלחה */}
			<Dialog open={successDialog} onClose={handleSuccessClose}>
				<DialogTitle sx={{ textAlign: "center", color: "success.main" }}>
					✅ המועדונית עודכנה בהצלחה!
				</DialogTitle>
				<DialogContent>
					<Typography textAlign="center">
						הנתונים עודכנו במערכת בהצלחה
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSuccessClose} variant="contained" fullWidth>
						סגור
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default EditClubDialog;
