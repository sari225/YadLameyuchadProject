/**
 * מחשב גיל לפי תאריך לידה
 * @param {string|Date} birthDate - תאריך לידה
 * @returns {number|string} גיל בשנים או "-" אם אין תאריך
 */
export const calculateAge = (birthDate) => {
	if (!birthDate) return "-";
	
	const today = new Date();
	const birth = new Date(birthDate);
	
	// בדיקה אם התאריך תקין
	if (isNaN(birth.getTime())) return "-";
	
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	
	// אם עוד לא הגיע יום ההולדת השנה, מחסירים שנה
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	
	return age;
};
