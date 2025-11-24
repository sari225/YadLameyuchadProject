import React, { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateClubMutation } from "../../../api/clubApi";
import { parseServerError } from "../../../utils/errorHandler";
import "./styles/ClubDialog.css";

// =============================
//     סכמת Zod מלאה להוספה
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

const addClubSchema = z.object({
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
//      קומפוננטת הוספה מלאה
// =============================
const AddClubDialog = ({ open, onClose, onSuccess }) => {
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(addClubSchema),
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

	const [createClub, { isLoading: isSaving }] = useCreateClubMutation();

	// שליחת יצירה לשרת
	const onSubmit = async (data) => {
		setServerError("");

		try {
			await createClub(data).unwrap();
			if (onSuccess) onSuccess();
			reset();
			onClose();
		} catch (error) {
			const errorMessage = parseServerError(error, "❌ שגיאה ביצירת מועדונית. אנא בדוק את הנתונים ונסה שוב.");
			setServerError(errorMessage);
		}
	};

	// סגירה מאפסת ערכים
	const handleClose = () => {
		setServerError("");
		reset();
		onClose();
	};


	return (
		<Dialog 
			open={open} 
			onClose={handleClose} 
			maxWidth="md" 
			fullWidth 
			dir="rtl" 
			PaperProps={{
				className: "admin-management-container",
				sx: {
					borderRadius: '20px',
					maxHeight: '90vh',
					overflowY: 'auto',
					'&::-webkit-scrollbar': {
						width: '10px'
					},
					'&::-webkit-scrollbar-track': {
						background: '#f1f1f1',
						borderRadius: '10px',
						margin: '8px 0'
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#87c8d2',
						borderRadius: '10px',
						border: '2px solid #f1f1f1'
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: '#6bb5c1'
					},
					'@media (max-width: 768px)': {
						width: '95%',
						margin: '16px',
						borderRadius: '20px'
					}
				}
			}}
		>
		<DialogTitle className="dialog-title" sx={{ flexShrink: 0 }}>
				<Typography variant="h5" className="dialog-title-text">
					הוספת מועדונית חדשה
				</Typography>
				<IconButton onClick={handleClose} className="dialog-close-button">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<Grid container spacing={3}>
						{/* שורה 1: שם ומיקום */}
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="שם המועדונית *"
								{...register("name")}
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="מיקום *"
								{...register("location")}
								error={!!errors.location}
								helperText={errors.location?.message}
							/>
			</Grid>

			{/* שורה 2: יום פעילות ושעות */}
			<Grid item xs={12} sm={5}>
				<FormControl fullWidth error={!!errors.activityDay} sx={{ minWidth: '100%' }}>
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
									<MenuItem value="שבת">שבת</MenuItem>
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
				<Grid item xs={12} sm={3.5}>
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
				<Grid item xs={12} sm={3.5}>
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

				{/* שורה 3: כותרת מנהלים */}
				<Grid item xs={12}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography variant="h6" sx={{ color: '#87c8d2', fontWeight: 600, fontFamily: 'Rubik' }}>
							מנהלי המועדונית *
						</Typography>
						<IconButton
							onClick={() => append({ name: "", phone: "", email: "" })}
							sx={{
							color: '#87c8d2',
							'&:hover': {
								backgroundColor: 'rgba(135, 200, 210, 0.1)'
							}
							}}
						>
							<AddIcon />
						</IconButton>
					</Box>
							{errors.clubManagers && typeof errors.clubManagers.message === "string" && (
								<Alert severity="error" sx={{ mb: 2 }}>
									{errors.clubManagers.message}
								</Alert>
							)}
						</Grid>

						{/* רשימת מנהלים */}
						{fields.map((field, index) => (
							<Grid item xs={12} key={field.id}>
								<Box 
									sx={{ 
										p: 2.5,
										border: '2px solid #e0e0e0',
										borderRadius: '12px',
										backgroundColor: 'white',
										position: 'relative'
									}}
								>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
										<Typography variant="subtitle2" sx={{ color: '#87c8d2', fontWeight: 600, fontFamily: 'Rubik' }}>
											מנהל {index + 1}
										</Typography>
										{fields.length > 1 && (
											<IconButton
												size="small"
												onClick={() => remove(index)}
												sx={{ color: '#9e63a9' }}
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
								</Box>
							</Grid>
						))}
					</Grid>
				</DialogContent>

				<DialogActions sx={{ p: 3, gap: 2 }}>
					<Button onClick={handleClose} disabled={isSaving}>
						ביטול
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSaving}
						startIcon={isSaving && <CircularProgress size={20} />}
						sx={{
							background: 'linear-gradient(135deg, #87c8d2 0%, #b5e2ec 100%)',
							fontFamily: 'Rubik',
							fontWeight: 600,
							'&:hover': {
								boxShadow: '0 6px 16px rgba(135, 200, 210, 0.5)'
							}
						}}
					>
						{isSaving ? "שומר..." : "הוסף מועדונית"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default AddClubDialog;
