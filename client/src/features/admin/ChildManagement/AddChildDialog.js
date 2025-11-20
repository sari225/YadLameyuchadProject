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
} from "@mui/material";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateChildMutation } from "../../../api/childApi";
import { parseServerError } from "../../../utils/errorHandler";

// =============================
//     סכמת Zod מלאה להוספה
// =============================
const addSchema = z.object({
	childId: z
		.string()
		.nonempty("יש להזין מספר ילד")
		.regex(/^[0-9]+$/, "מספר ילד חייב להכיל רק ספרות")
		.min(5, "מספר ילד חייב להכיל לפחות 5 ספרות")
		.max(9, "מספר ילד יכול להכיל עד 9 ספרות"),

	parentName: z.string().nonempty("יש להזין שם הורה"),
	Fname: z.string().nonempty("יש להזין שם פרטי"),
	Lname: z.string().nonempty("יש להזין שם משפחה"),

	dateOfBirth: z
		.string()
		.nonempty("יש להזין תאריך לידה")
		.refine((val) => !isNaN(Date.parse(val)), "תאריך לידה לא תקין")
		.refine(
			(val) => new Date(val) <= new Date(),
			"תאריך לידה לא יכול להיות עתידי"
		),

	city: z.string().nonempty("יש להזין עיר"),
	street: z.string().nonempty("יש להזין רחוב"),
	building: z
		.string()
		.nonempty("יש להזין מספר בית")
		.regex(/^[0-9]+$/, "מספר בית חייב להיות מספר"),

	educationInstitution: z
		.string()
		.nonempty("יש להזין שם מוסד לימודי")
		.max(100, "שם המוסד יכול להכיל עד 100 תווים"),

	phone1: z
		.string()
		.nonempty("יש להזין מספר טלפון")
		.regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
		.min(9, "טלפון חייב להיות לפחות 9 ספרות")
		.max(10, "טלפון יכול להיות עד 10 ספרות"),

	phone2: z
		.string()
		.nonempty("יש להזין מספר טלפון נוסף")
		.regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
		.min(9, "טלפון חייב להיות לפחות 9 ספרות")
		.max(10, "טלפון יכול להיות עד 10 ספרות"),

	email: z
		.string()
		.nonempty("יש להזין אימייל")
		.email("כתובת אימייל לא תקינה"),

	specialNeeds: z.string().optional(), // definition במודל
	allergies: z.string().optional(), // במודל: מערך מחרוזות
	emailConsent: z.boolean().optional(),
});

// =============================
//      קומפוננטת הוספה מלאה
// =============================
const AddChildDialog = ({ open, onClose, onSuccess }) => {
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(addSchema),
		defaultValues: {
			childId: "",
			parentName: "",
			Fname: "",
			Lname: "",
			dateOfBirth: "",
			city: "",
			street: "",
			building: "",
			educationInstitution: "",
			phone1: "",
			phone2: "",
			email: "",
			specialNeeds: "",
			allergies: "",
			// emailConsent: false, // הוסר
		},
	});

	const [createChild, { isLoading: isSaving }] = useCreateChildMutation();

	// שליחת יצירה לשרת
	const onSubmit = async (data) => {
		setServerError("");

		const childData = {
			childId: data.childId,
			parentName: data.parentName,
			Fname: data.Fname,
			Lname: data.Lname,
			dateOfBirth: data.dateOfBirth,
			phone1: data.phone1,
			phone2: data.phone2,
			email: data.email || "",
			educationInstitution: data.educationInstitution,
			address: {
				city: data.city,
				street: data.street,
				building: data.building,
			},
			allergies: data.allergies
				? data.allergies.split(",").map((x) => x.trim())
				: [],
			definition: data.specialNeeds || "",
			emailConsent: false,
			isApproved: true,
			isVerified: true,
		};

		try {
			await createChild(childData).unwrap();
			if (onSuccess) onSuccess();
			// נקה טופס וסגור
			reset();
			onClose();
		} catch (error) {
			const errorMessage = parseServerError(error, "❌ שגיאה ביצירת ילד. אנא בדקי את הנתונים ונסי שוב.");
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
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth dir="rtl">
			<DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
				הוספת ילד חדש
			</DialogTitle>

			<DialogContent>
				<Typography
					sx={{
						mb: 2,
						textAlign: "center",
						color: "text.secondary",
						fontSize: "0.95rem",
					}}
				>
					מלאי את פרטי הילד. שדות עם * הם שדות חובה.
				</Typography>

				{serverError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{serverError}
					</Alert>
				)}

				<Box component="form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						{/* מס' זהות */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="מספר זהות *"
								{...register("childId")}
								error={!!errors.childId}
								helperText={errors.childId?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* שם הורה */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="שם הורה *"
								{...register("parentName")}
								error={!!errors.parentName}
								helperText={errors.parentName?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* שם פרטי */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="שם פרטי *"
								{...register("Fname")}
								error={!!errors.Fname}
								helperText={errors.Fname?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* שם משפחה */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="שם משפחה *"
								{...register("Lname")}
								error={!!errors.Lname}
								helperText={errors.Lname?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* תאריך לידה */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								type="date"
								label="תאריך לידה *"
								{...register("dateOfBirth")}
								error={!!errors.dateOfBirth}
								helperText={errors.dateOfBirth?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* אימייל */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="אימייל *"
								{...register("email")}
								error={!!errors.email}
								helperText={errors.email?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* עיר */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="עיר *"
								{...register("city")}
								error={!!errors.city}
								helperText={errors.city?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* רחוב */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="רחוב *"
								{...register("street")}
								error={!!errors.street}
								helperText={errors.street?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* מספר בית */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="מספר בית *"
								{...register("building")}
								error={!!errors.building}
								helperText={errors.building?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* מוסד לימודי */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="מוסד לימודי *"
								{...register("educationInstitution")}
								error={!!errors.educationInstitution}
								helperText={errors.educationInstitution?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* טלפון אבא */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="טלפון אבא *"
								{...register("phone1")}
								error={!!errors.phone1}
								helperText={errors.phone1?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* טלפון אמא */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="טלפון אמא *"
								{...register("phone2")}
								error={!!errors.phone2}
								helperText={errors.phone2?.message}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* הגדרת הילד */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="פירוט הגדרה של הילד"
								{...register("specialNeeds")}
								error={!!errors.specialNeeds}
								helperText={errors.specialNeeds?.message}
								multiline
								rows={2}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* אלרגיות */}
						<Grid item xs={12} sm={6}>
							<TextField
								variant="standard"
								label="פירוט אלרגיות (מופרד בפסיקים)"
								{...register("allergies")}
								error={!!errors.allergies}
								helperText={errors.allergies?.message}
								multiline
								rows={2}
								fullWidth
								InputLabelProps={{
									shrink: true,
									sx: {
										right: 0,
										left: "auto",
										transformOrigin: "top right",
									},
								}}
							/>
						</Grid>

						{/* שדה דיוור הוסר מהטופס */}
					</Grid>

					<DialogActions sx={{ mt: 3 }}>
						<Button onClick={handleClose} variant="outlined">
							ביטול
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="success"
							disabled={isSaving || !isValid}
						>
							{isSaving ? <CircularProgress size={22} /> : "הוספת ילד"}
						</Button>
					</DialogActions>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default AddChildDialog;

