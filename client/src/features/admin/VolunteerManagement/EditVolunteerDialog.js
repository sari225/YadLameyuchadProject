import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Grid,
	CircularProgress,
	Alert,
	Typography,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateVolunteerMutation } from "../../../api/volunteerApi";
import { parseServerError } from "../../../utils/errorHandler";
import { volunteerSchema } from "./volunteerSchema";

const EditVolunteerDialog = ({ open, onClose, volunteer, onSuccess }) => {
	const [updateVolunteer, { isLoading }] = useUpdateVolunteerMutation();
	const [serverError, setServerError] = useState("");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		mode: 'onSubmit',
		resolver: zodResolver(volunteerSchema),
		defaultValues: {
			id: "",
			fname: "",
			lname: "",
			school: "",
			phone: "",
			email: "",
			dateBorn: "",
			city: "",
			street: "",
			building: "",
		},
	});

	// טעינת הנתונים לטופס כשפותחים את הדיאלוג
	useEffect(() => {
		if (volunteer && open) {
			reset({
				id: volunteer.id || "",
				fname: volunteer.fname || "",
				lname: volunteer.lname || "",
				school: volunteer.school || "",
				phone: volunteer.phone || "",
				email: volunteer.email || "",
				dateBorn: volunteer.dateBorn ? volunteer.dateBorn.split("T")[0] : "",
				city: volunteer.address?.city || "",
				street: volunteer.address?.street || "",
				building: String(volunteer.address?.building || ""),
			});
			setServerError("");
		}
	}, [volunteer, open, reset]);

	const onSubmit = async (data) => {
		setServerError("");

		const volunteerData = {
			...data,
			address: {
				city: data.city,
				street: data.street,
				building: Number(data.building),
			},
		};

		// הסרת city, street, building מהשורש
		delete volunteerData.city;
		delete volunteerData.street;
		delete volunteerData.building;

		try {
			await updateVolunteer({
				id: volunteer._id,
				volunteerData: volunteerData,
			}).unwrap();
			if (onSuccess) onSuccess();
			onClose();
		} catch (error) {
			const errorMessage = parseServerError(error, "❌ שגיאה בעדכון מתנדבת. אנא בדקי את הנתונים ונסי שוב.");
			setServerError(errorMessage);
		}
	};

	const handleClose = () => {
		setServerError("");
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
					'@media (max-width: 768px)': {
						width: '95%',
						margin: '16px',
						borderRadius: '20px'
					}
				}
			}}
		>
			<DialogTitle className="dialog-title">
				<Typography variant="h5" className="dialog-title-text">
					עריכת פרטי מתנדבת
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

					<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							label="שם פרטי"
							{...register("fname")}
							error={!!errors.fname}
							helperText={errors.fname?.message || ''}
							inputProps={{ maxLength: 20 }}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							label="שם משפחה"
							{...register("lname")}
							error={!!errors.lname}
							helperText={errors.lname?.message || ''}
							inputProps={{ maxLength: 20 }}
						/>
					</Grid>					<Grid item xs={12}>
						<TextField
							fullWidth
							label="תעודת זהות"
							{...register("id")}
							error={!!errors.id}
							helperText={errors.id?.message || ''}
							inputProps={{ 
								pattern: "[0-9]*",
								maxLength: 9
							}}
						/>
					</Grid>					<Grid item xs={12}>
						<TextField
							fullWidth
							label="טלפון"
							{...register("phone")}
							error={!!errors.phone}
							helperText={errors.phone?.message || ''}
							inputProps={{ pattern: "[0-9]*", maxLength: 10 }}
						/>
					</Grid>					<Grid item xs={12}>
					<TextField
						fullWidth
						label="סמינר"
						{...register("school")}
							error={!!errors.school}
							helperText={errors.school?.message || ''}
							inputProps={{ maxLength: 20 }}
						/>
					</Grid>					<Grid item xs={12}>
						<TextField
							fullWidth
							label="אימייל (אופציונלי)"
							type="email"
							{...register("email")}
							error={!!errors.email}
							helperText={errors.email?.message || ''}
						/>
					</Grid>						<Grid item xs={12}>
							<TextField
								fullWidth
								label="תאריך לידה"
								type="date"
								{...register("dateBorn")}
								error={!!errors.dateBorn}
								helperText={errors.dateBorn?.message || ''}
								InputLabelProps={{
									shrink: true,
								}}
								inputProps={{
									max: new Date().toISOString().split('T')[0]
								}}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="עיר"
								{...register("city")}
								error={!!errors.city}
								helperText={errors.city?.message || ''}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="רחוב"
								{...register("street")}
								error={!!errors.street}
								helperText={errors.street?.message || ''}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="מספר בית"
								type="number"
								{...register("building")}
								error={!!errors.building}
								helperText={errors.building?.message || ''}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isLoading}>
						ביטול
					</Button>
					<Button type="submit" variant="contained" disabled={isLoading}>
						{isLoading ? <CircularProgress size={24} /> : "שמור"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditVolunteerDialog;
