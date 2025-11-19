import React from "react";
import {
	Box,
	Typography,
	Grid,
	Stack,
} from "@mui/material";

const VolunteerDetails = ({ volunteer }) => {
	if (!volunteer) return null;

	return (
		<Box sx={{ margin: 2.5, p: 3, bgcolor: "#f5f5f5", borderRadius: 1, textAlign: "right" }}>
			<Grid container spacing={5}>
				{/* פרטים אישיים */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						פרטים אישיים
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>תעודת זהות:</strong> {volunteer.id}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>שם מלא:</strong> {volunteer.fname} {volunteer.lname}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>תאריך לידה:</strong>{" "}
						{volunteer.dateBorn ? new Date(volunteer.dateBorn).toLocaleDateString("he-IL") : "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>בית ספר:</strong> {volunteer.school || "—"}
					</Typography>
				</Grid>

				{/* פרטי תקשורת */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						פרטי תקשורת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>טלפון:</strong> {volunteer.phone}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>אימייל:</strong> {volunteer.email || "—"}
					</Typography>
				</Grid>

				{/* כתובת */}
				<Grid item xs={12} sm={6} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						כתובת
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>עיר:</strong> {volunteer.address?.city || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>רחוב:</strong> {volunteer.address?.street || "—"}
					</Typography>

					<Typography variant="body2" sx={{ mb: 0.5 }}>
						<strong>מספר בית:</strong> {volunteer.address?.building || "—"}
					</Typography>
				</Grid>

				{/* מועדוניות */}
				<Grid item xs={12} md={3} sx={{ pr: 2 }}>
					<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
						מועדוניות ({volunteer.clubs?.length || 0})
					</Typography>

					{volunteer.clubs && volunteer.clubs.length > 0 ? (
						<Stack spacing={1}>
							{volunteer.clubs.map((club, idx) => {
								const childName = club.child
									? `${club.child.Fname || ""} ${club.child.Lname || ""}`.trim()
									: "ללא ילד";
								const childId = club.child ? ` (${club.child.childId || "ללא ת.ז"})` : "";
								
								return (
									<Box
										key={club._id || idx}
										sx={{
											bgcolor: "white",
											p: 2,
											borderRadius: 1,
											border: "1px solid #e0e0e0",
											boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
										}}
									>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: "bold", color: "#1976d2", mb: 0.5 }}>
												📍 {club.clubName}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												👶 שומרת על: {childName}{childId}
											</Typography>
										</Box>
									</Box>
								);
							})}
						</Stack>
					) : (
						<Typography variant="body2" color="text.secondary">
							אין מועדוניות רשומות
						</Typography>
					)}

					{/* הודעה אינפורמטיבית */}
					<Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
						<Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
							💡 לניהול מועדוניות ועדכון ילדים, יש לעבור לדף "ניהול מועדוניות"
						</Typography>
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default VolunteerDetails;
