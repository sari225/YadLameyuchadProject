import { z } from "zod";

/**
 * סכמת Zod משותפת למתנדבת (הוספה ועריכה)
 */
export const volunteerSchema = z.object({
	id: z
		.string()
		.nonempty("יש להזין תעודת זהות")
		.regex(/^[0-9]+$/, "תעודת זהות חייבת להכיל רק ספרות")
		.min(5, "תעודת זהות חייבת להכיל לפחות 5 ספרות")
		.max(9, "תעודת זהות יכולה להכיל עד 9 ספרות"),

	fname: z
		.string()
		.nonempty("יש להזין שם פרטי")
		.max(20, "שם פרטי יכול להכיל עד 20 תווים"),

	lname: z
		.string()
		.nonempty("יש להזין שם משפחה")
		.max(20, "שם משפחה יכול להכיל עד 20 תווים"),

	school: z
		.string()
		.nonempty("יש להזין סמינר")
		.max(20, "שם סמינר יכול להכיל עד 20 תווים"),

	phone: z
		.string()
		.nonempty("יש להזין מספר טלפון")
		.regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
		.min(9, "טלפון חייב להיות לפחות 9 ספרות")
		.max(10, "טלפון יכול להיות עד 10 ספרות"),

	email: z
		.string()
		.email("כתובת אימייל לא תקינה")
		.optional()
		.or(z.literal("")),

	dateBorn: z
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
		.regex(/^[0-9]+$/, "מספר בית חייב להיות מספר")
		.refine((val) => parseInt(val) >= 1 && parseInt(val) <= 300, "מספר בית חייב להיות בין 1 ל-300"),
});
