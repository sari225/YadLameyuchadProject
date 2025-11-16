import React from "react";
import { Box, Typography, Grid, Chip, Stack } from "@mui/material";

const ChildDetails = ({ child, childClubs }) => {
	if (!child) return null;

	return (
		<Box sx={{ margin: 2.5, p: 3, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'right' }}>
			<Grid container spacing={5}>
				{/* פרטים אישיים */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
						פרטים אישיים
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>מספר זהות:</strong> {child.childId}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>שם מלא:</strong> {child.Fname} {child.Lname}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>שם הורה:</strong> {child.parentName}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>תאריך לידה:</strong> {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('he-IL') : "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>מוסד לימודי:</strong> {child.educationInstitution || "—"}
					</Typography>
				</Grid>

				{/* פרטי תקשורת */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
						פרטי תקשורת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>טלפון 1:</strong> {child.phone1}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>טלפון 2:</strong> {child.phone2 || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>אימייל:</strong> {child.email}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>הסכמה לדיוור:</strong> {child.emailConsent ? "כן" : "לא"}
					</Typography>
				</Grid>

				{/* כתובת */}
				<Grid item xs={12} sm={6} md={2} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
						כתובת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>עיר:</strong> {child.address?.city || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>רחוב:</strong> {child.address?.street || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>מספר בית:</strong> {child.address?.building || "—"}
					</Typography>
				</Grid>

				{/* פרטים רפואיים */}
				<Grid item xs={12} sm={6} md={2} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
						פרטים רפואיים
					</Typography>

					<Typography variant="body2" sx={{ mb: 1 }}>
						<strong>הגדרה:</strong> {child.definition || "אין"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 1 }}>
						<strong>אלרגיות:</strong>
					</Typography>

					{child.allergies && child.allergies.length > 0 ? (
						<Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
							{child.allergies.map((allergy, idx) => (
								<Chip key={idx} label={allergy} size="small" color="warning" sx={{ mb: 0.5 }} />
							))}
						</Stack>
					) : (
						<Typography variant="body2" color="text.secondary">אין אלרגיות רשומות</Typography>
					)}
				</Grid>

				{/* מועדוניות */}
				<Grid item xs={12} sm={6} md={2} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
						מועדוניות
					</Typography>

					{childClubs && childClubs.length > 0 ? (
						<Box>
							{childClubs.map((club, idx) => (
								<Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
									{club.name}
								</Typography>
							))}
						</Box>
					) : (
						<Typography variant="body2" color="text.secondary">
							הילד אינו רשום לאף מועדונית
						</Typography>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default ChildDetails;
