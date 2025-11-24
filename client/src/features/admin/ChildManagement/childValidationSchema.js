import { z } from "zod";

// =============================
//   סכמת ולידציה משותפת לילד
// =============================
export const childValidationSchema = z.object({
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
    .regex(/^[0-9]+$/, "מספר בית חייב להיות מספר")
    .refine(
      (val) => parseInt(val) >= 1 && parseInt(val) <= 300,
      "מספר בית חייב להיות בין 1 ל-300"
    ),

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

  specialNeeds: z.string().optional(),
  allergies: z.string().optional(),
  emailConsent: z.boolean().optional(),
});

// הגדרת ברירת מחדל למילוי טפסים
export const defaultChildValues = {
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
  emailConsent: false,
};