import React from "react";
import { Box, Typography, Grid, Chip, Stack } from "@mui/material";
import { formatDateHebrew } from "./childManagementHelpers";
import "./style/ChildDetails.css";

const ChildDetails = ({ child, childClubs }) => {
	if (!child) return null;

	 return (
		<Box className="child-details-box">
		 <Grid container spacing={5} className="child-details-grid">
				{/* פרטים אישיים */}
				<Grid item xs={12} sm={6} md={3}>
				 <Typography variant="subtitle1" className="child-details-section-title">
				  פרטים אישיים
				 </Typography>

				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">מספר זהות:</span> {child.childId}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">שם מלא:</span> {child.Fname} {child.Lname}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">שם הורה:</span> {child.parentName}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">תאריך לידה:</span> {formatDateHebrew(child.dateOfBirth)}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">מוסד לימודי:</span> {child.educationInstitution || "—"}
				 </Typography>
				</Grid>

				{/* פרטי תקשורת */}
				<Grid item xs={12} sm={6} md={3}>
				 <Typography variant="subtitle1" className="child-details-section-title">
				  פרטי תקשורת
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">טלפון 1:</span> {child.phone1}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">טלפון 2:</span> {child.phone2 || "—"}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">אימייל:</span> {child.email}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">הסכמה לדיוור:</span> {child.emailConsent ? "כן" : "לא"}
				 </Typography>
				</Grid>

				{/* כתובת */}
				<Grid item xs={12} sm={6} md={2}>
				 <Typography variant="subtitle1" className="child-details-section-title">
				  כתובת
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">עיר:</span> {child.address?.city || "—"}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">רחוב:</span> {child.address?.street || "—"}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">מספר בית:</span> {child.address?.building || "—"}
				 </Typography>
				</Grid>

				{/* פרטים רפואיים */}
				<Grid item xs={12} sm={6} md={2}>
				 <Typography variant="subtitle1" className="child-details-section-title">
				  פרטים רפואיים
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">הגדרה:</span> {child.definition || "אין"}
				 </Typography>
				 <Typography variant="body2" className="child-details-body">
				  <span className="child-details-label">אלרגיות:</span>
				 </Typography>
				 {child.allergies && child.allergies.length > 0 ? (
				  <ul style={{ textAlign: 'right', margin: '0 0 8px 0', paddingRight: '18px' }}>
				   {child.allergies.map((allergy, idx) => (
					<li key={idx} style={{ marginBottom: '4px', fontSize: '0.98em', color: '#333' }}>{allergy}</li>
				   ))}
				  </ul>
				 ) : (
				  <Typography variant="body2" className="child-details-empty">אין אלרגיות רשומות</Typography>
				 )}
				</Grid>

				{/* מועדוניות */}
				<Grid item xs={12} sm={6} md={2}>
				 <Typography variant="subtitle1" className="child-details-section-title">
				  מועדוניות
				 </Typography>
				 {childClubs && childClubs.length > 0 ? (
				  <Box>
				   {childClubs.map((club, idx) => (
					<Typography key={idx} variant="body2" className="child-details-body">
					 {club.name}
					</Typography>
				   ))}
				  </Box>
				 ) : (
				  <Typography variant="body2" className="child-details-empty">
				   הילד אינו רשום לאף מועדונית
				  </Typography>
				 )}
				</Grid>
			</Grid>
		</Box>
	);
};

export default ChildDetails;
