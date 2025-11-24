// =============================
//  פונקציות עזר לניהול ילדים
// =============================

// חישוב גיל מתאריך לידה
export const calcAge = (dob) => {
	if (!dob) return null;
	const birth = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
	return age;
};

// עיצוב תאריך לחודש ולטקסט עברי
export const formatDateHebrew = (dateString) => {
	if (!dateString) return "—";
	return new Date(dateString).toLocaleDateString('he-IL');
};

// עיבוד רשימת אלרגיות מטקסט למערך
export const processAllergies = (allergiesText) => {
	if (!allergiesText) return [];
	return allergiesText.split(",").map((x) => x.trim()).filter(x => x.length > 0);
};

// סינון ילדים מאושרים
export const filterApprovedChildren = (children) => {
	if (!children) return [];
	return children.filter((c) => c.isApproved === true);
};

// סינון ילדים ממתינים
export const filterPendingChildren = (children) => {
	if (!children) return [];
	return children.filter((c) => c.isApproved === false && c.isVerified === true);
};

// יצירת מילון מועדוניות
export const createClubsDict = (clubs) => {
	if (!clubs) return {};
	const dict = {};
	clubs.forEach((club) => {
		dict[club._id] = { name: club.name, children: club.registeredChildren };
	});
	return dict;
};

// החזרת מועדוניות של ילד
export const getChildClubs = (child, clubsDict) => {
	if (!child || !child.clubs || child.clubs.length === 0) return [];
	return child.clubs.map((clubId) => clubsDict[clubId]).filter(Boolean);
};

// סינון ומיון ילדים לפי חיפוש
export const filterAndSortChildren = (approvedChildren, searchQuery, searchField, clubsDict) => {
	let filtered = approvedChildren;

	if (searchQuery) {
		const query = searchQuery.toLowerCase();

		filtered = approvedChildren.filter((child) => {
			switch (searchField) {
				case "name":
					return (child.Fname + " " + child.Lname).toLowerCase().includes(query);
				case "educationInstitution":
					return (child.educationInstitution || "").toLowerCase().includes(query);
				case "age":
					if (!child.dateOfBirth) return false;
					const age = calcAge(child.dateOfBirth);
					return age !== null && age.toString() === query;
				case "dateOfBirth": {
					if (!child.dateOfBirth) return false;
					// תמיכה בפורמטים שונים של תאריך
					const dobIso = child.dateOfBirth; // YYYY-MM-DD
					const dobLocal = formatDateHebrew(child.dateOfBirth); // dd/mm/yyyy  
					const dobLocalEn = new Date(child.dateOfBirth).toLocaleDateString('en-GB'); // dd/mm/yyyy
					return dobIso.includes(searchQuery) || 
					       dobLocal.includes(searchQuery) || 
					       dobLocalEn.includes(searchQuery);
				}
				case "clubs": {
					const childClubs = getChildClubs(child, clubsDict);
					return childClubs.some((club) => club.name.toLowerCase().includes(query));
				}
				default: {
					// חיפוש חופשי על כל השדות
					const contains = (v) => (v ?? "").toString().toLowerCase().includes(query);
					const fullName = `${child.Fname || ""} ${child.Lname || ""}`;
					const age = calcAge(child.dateOfBirth);
					const dobIso = child.dateOfBirth || "";
					const dobLocal = formatDateHebrew(child.dateOfBirth);
					const clubs = getChildClubs(child, clubsDict);
					const clubsJoined = clubs.map((c) => c.name).join(", ");
					const allergiesJoined = Array.isArray(child.allergies)
						? child.allergies.join(", ")
						: child.allergies || "";
					const emailConsentLabel = child.emailConsent ? "כן" : "לא";

					const matches = [
						contains(fullName),
						contains(child.childId),
						contains(child.parentName),
						contains(child.educationInstitution),
						contains(child.phone1),
						contains(child.phone2),
						contains(child.email),
						contains(child.address?.city),
						contains(child.address?.street),
						contains(child.address?.building),
						contains(child.definition),
						contains(allergiesJoined),
						contains(dobIso),
						contains(dobLocal),
						contains(clubsJoined),
						contains(emailConsentLabel),
						age !== null ? age.toString() === query : false,
					];

					return matches.some(Boolean);
				}
			}
		});
	}

	// מיון לפי שם פרטי (א' ב')
	return filtered.sort((a, b) => {
		return (a.Fname || "").localeCompare(b.Fname || "", "he");
	});
};
