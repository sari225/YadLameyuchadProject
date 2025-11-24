import React, { useState } from "react";
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
import { useCreateVolunteerMutation } from "../../../api/volunteerApi";
import { parseServerError } from "../../../utils/errorHandler";
import { volunteerSchema } from "./volunteerSchema";

const AddVolunteerDialog = ({ open, onClose, onSuccess }) => {
	const [createVolunteer, { isLoading }] = useCreateVolunteerMutation();
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

	const onSubmit = async (data) => {
		setServerError("");

		const dataToSend = {
			...data,
			address: {
				city: data.city,
				street: data.street,
				building: Number(data.building),
			},
		};

		// הסרת city, street, building מהשורש
		delete dataToSend.city;
		delete dataToSend.street;
		delete dataToSend.building;

		try {
			await createVolunteer(dataToSend).unwrap();
			if (onSuccess) onSuccess();
			reset();
			onClose();
		} catch (error) {
			const errorMessage = parseServerError(error, "❌ שגיאה בהוספת מתנדבת. אנא בדקי את הנתונים ונסי שוב.");
			setServerError(errorMessage);
		}
	};

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
					הוספת מתנדבת חדשה
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
					</Grid>						<Grid item xs={12}>
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
						</Grid>

						<Grid item xs={12}>
						<TextField
							fullWidth
							label="טלפון"
							{...register("phone")}
							error={!!errors.phone}
							helperText={errors.phone?.message || ''}
							inputProps={{ pattern: "[0-9]*", maxLength: 10 }}
						/>
						</Grid>

						<Grid item xs={12}>
						<TextField
							fullWidth
							label="סמינר"
							{...register("school")}
								error={!!errors.school}
								helperText={errors.school?.message || ''}
								inputProps={{ maxLength: 20 }}
							/>
						</Grid>

					<Grid item xs={12}>
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

export default AddVolunteerDialog;
