import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Lock as LockIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  useGetChildByIdQuery,
  useUpdateChildMutation,
  useUpdatePasswordMutation,
} from "../../../api/childApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for password dialog
const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .regex(/[a-z]/, "הסיסמה חייבת להכיל לפחות אות קטנה אחת")
    .regex(/[A-Z]/, "הסיסמה חייבת להכיל לפחות אות גדולה אחת")
    .regex(/[!@#$%^&*]/, "הסיסמה חייבת להכיל לפחות תו מיוחד אחד (!@#$%^&*)"),
  confirmPassword: z.string().min(1, "חובה לאשר את הסיסמה"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
});

// Zod schema for profile form
const profileSchema = z.object({
  parentName: z.string().min(2, "שם ההורה חייב להכיל לפחות 2 תווים"),
  Fname: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
  Lname: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
  dateOfBirth: z
    .string()
    .min(1, "תאריך לידה הוא שדה חובה")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate < today;
    }, "תאריך לידה לא יכול להיות בעתיד"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone1: z
    .string()
    .regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
    .min(9, "טלפון חייב להיות לפחות 9 ספרות")
    .max(10, "טלפון יכול להיות עד 10 ספרות"),
  phone2: z
    .string()
    .regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
    .min(9, "טלפון חייב להיות לפחות 9 ספרות")
    .max(10, "טלפון יכול להיות עד 10 ספרות")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "שם העיר חייב להכיל לפחות 2 תווים"),
  street: z.string().min(2, "שם הרחוב חייב להכיל לפחות 2 תווים"),
  building: z.string().min(1, "מספר בית הוא שדה חובה"),
  educationInstitution: z.string().optional(),
  specialNeeds: z.string().optional(),
  allergies: z.string().optional(),
});

const PasswordDialog = ({ open, onClose }) => {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (open) reset({ newPassword: "", confirmPassword: "" });
  }, [open, reset]);

  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const onSubmit = async ({ newPassword }) => {
    setServerError("");
    setServerSuccess("");
    try {
      await updatePassword({ newPassword }).unwrap();
      setServerSuccess("הסיסמה עודכנה בהצלחה");
      reset();
    } catch (e) {
      const msg = e?.data?.message || "שגיאה בעדכון הסיסמה";
      setServerError(msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} dir="rtl">
      <DialogTitle>עדכון סיסמה</DialogTitle>
      <DialogContent>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        {serverSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {serverSuccess}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <TextField
            type="password"
            label="סיסמה חדשה"
            fullWidth
            margin="normal"
            {...register("newPassword", { required: "חובה להקליד סיסמה" })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            type="password"
            label="אימות סיסמה"
            fullWidth
            margin="normal"
            {...register("confirmPassword", { required: "חובה לאשר סיסמה" })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <DialogActions sx={{ px: 0, mt: 1 }}>
            <Button onClick={onClose}>סגור</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : "עדכון"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Profile = () => {
  const { token } = useSelector((s) => s.auth);
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);
  const id = decoded?.id;

  const {
    data: child,
    isFetching,
    refetch,
    isError,
    error,
  } = useGetChildByIdQuery(id, { skip: !id });
  const [updateChild, { isLoading: isSaving }] = useUpdateChildMutation();

  const [editMode, setEditMode] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [serverErr, setServerErr] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      parentName: "",
      Fname: "",
      Lname: "",
      dateOfBirth: "",
      email: "",
      phone1: "",
      phone2: "",
      city: "",
      street: "",
      building: "",
      educationInstitution: "",
      specialNeeds: "",
      allergies: "",
    },
  });

  useEffect(() => {
    if (child) {
      reset({
        parentName: child.parentName || "",
        Fname: child.Fname || "",
        Lname: child.Lname || "",
        dateOfBirth: child.dateOfBirth ? child.dateOfBirth.substring(0, 10) : "",
        email: child.email || "",
        phone1: child.phone1 || "",
        phone2: child.phone2 || "",
        city: child.address?.city || "",
        street: child.address?.street || "",
        building: child.address?.building || "",
        educationInstitution: child.educationInstitution || "",
        specialNeeds: child.definition || "",
        allergies: Array.isArray(child.allergies)
          ? child.allergies.join(", ")
          : "",
      });
    }
  }, [child, reset]);

  const onSubmit = async (data) => {
    if (!id) return;
    setServerMsg("");
    setServerErr("");
    const childData = {
      parentName: data.parentName,
      Fname: data.Fname,
      Lname: data.Lname,
      dateOfBirth: data.dateOfBirth,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      educationInstitution: data.educationInstitution,
      address: { city: data.city, street: data.street, building: data.building },
      definition: data.specialNeeds,
      allergies: data.allergies
        ? data.allergies.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      await updateChild({ id, childData }).unwrap();
      setServerMsg("הפרטים עודכנו בהצלחה");
      setEditMode(false);
      refetch();
    } catch (e) {
      const msg = (e?.data?.message || "").toString();
      const errorDetail =
        typeof e?.data?.error === "string"
          ? e.data.error
          : JSON.stringify(e?.data?.error || "");
      const raw = `${msg} ${errorDetail}`;
      const lower = raw.toLowerCase();

      if (
        lower.includes("email already exists") ||
        (lower.includes("email") && lower.includes("exists")) ||
        lower.includes("email_1")
      ) {
        setServerErr(
          "❌ כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת."
        );
      } else if (
        lower.includes("childid already exists") ||
        (lower.includes("childid") && lower.includes("exists")) ||
        lower.includes("childid_1")
      ) {
        setServerErr(
          "❌ מספר תעודת הזהות כבר רשום במערכת. אם זה הילד שלך, פנה לתמיכה."
        );
      } else if (raw.includes("תאריך לידה לא יכול להיות עתידי")) {
        setServerErr("❌ תאריך הלידה לא יכול להיות עתידי. אנא בחר תאריך תקין.");
      } else if (e?.status === 409) {
        setServerErr("המייל או מספר הילד כבר קיימים במערכת");
      } else if (e?.status === 400) {
        setServerErr("נתונים לא תקינים, אנא בדוק את השדות");
      } else if (e?.status === 500) {
        setServerErr("שגיאת שרת, נסה שוב מאוחר יותר");
      } else {
        setServerErr("שגיאה בעדכון הפרופיל");
      }
    }
  };

  if (!id) {
    return <Alert severity="error">לא נמצאה זהות משתמש</Alert>;
  }

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        p: 3,
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
      dir="rtl"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "600", color: "#333" }}>
          הפרופיל שלי
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {!editMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{
                  borderColor: "#03a9f4",
                  color: "#03a9f4",
                  fontSize: "15px",
                  borderRadius: "8px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(3, 169, 244, 0.04)",
                    borderColor: "#0288d1",
                  },
                }}
              >
                עריכת פרטים
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setPwdOpen(true)}
                sx={{
                  borderColor: "#ff9800",
                  color: "#ff9800",
                  fontSize: "15px",
                  borderRadius: "8px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 152, 0, 0.04)",
                    borderColor: "#f57c00",
                  },
                }}
              >
                שינוי סיסמה
              </Button>
            </>
          )}
        </Box>
      </Box>

      {isFetching && <CircularProgress />}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.data?.message || "שגיאה בטעינת הנתונים"}
        </Alert>
      )}
      {serverErr && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverErr}
        </Alert>
      )}
      {serverMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {serverMsg}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          backgroundColor: "white",
          borderRadius: 1,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "600", color: "#333", fontSize: "18px" }}
        >
          פרטים אישיים
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* אימייל */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                כתובת מייל
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="example@example.com"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* שם הורה */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                שם הורה
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("parentName")}
                error={!!errors.parentName}
                helperText={errors.parentName?.message}
                placeholder="שם הורה"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* טלפון ראשי */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                טלפון ראשי
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("phone1")}
                error={!!errors.phone1}
                helperText={errors.phone1?.message}
                placeholder="05xxxxxxxx"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* טלפון משני */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                טלפון משני
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("phone2")}
                error={!!errors.phone2}
                helperText={errors.phone2?.message}
                placeholder="05xxxxxxxx"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{ mt: 4, mb: 3, fontWeight: "600", color: "#333", fontSize: "18px" }}
          >
            שם פרטי של הילד/ה
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* שם פרטי */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                שם פרטי
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("Fname")}
                error={!!errors.Fname}
                helperText={errors.Fname?.message}
                placeholder="שם פרטי"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* שם משפחה */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                שם משפחה של הילד/ה
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("Lname")}
                error={!!errors.Lname}
                helperText={errors.Lname?.message}
                placeholder="שם משפחה"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* תאריך לידה */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                תאריך לידה
              </Typography>
              <TextField
                type="date"
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* גיל */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                גיל
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled
                value={
                  child?.dateOfBirth
                    ? Math.floor(
                        (new Date() - new Date(child.dateOfBirth)) /
                          31557600000
                      )
                    : ""
                }
                placeholder="גיל מחושב אוטומטית"
                InputProps={{
                  sx: {
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e0e0e0",
                    },
                  },
                }}
              />
            </Box>

            {/* עיר */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                עיר
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("city")}
                error={!!errors.city}
                helperText={errors.city?.message}
                placeholder="עיר"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* רחוב */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                רחוב
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("street")}
                error={!!errors.street}
                helperText={errors.street?.message}
                placeholder="רחוב"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* מספר בית */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                מספר בית
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("building")}
                error={!!errors.building}
                helperText={errors.building?.message}
                placeholder="מספר בית"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* מוסד לימודי */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                מוסד לימודי
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("educationInstitution")}
                placeholder="שם המוסד החינוכי"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* פירוט הגדרה */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                פירוט הגדרה של הילד
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("specialNeeds")}
                placeholder="הערות או הגדרות מיוחדות"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>

            {/* אלרגיות */}
            <Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                  mb: 0.5,
                  textAlign: "right",
                }}
              >
                אלרגיות (מופרד בפסיקים)
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("allergies")}
                placeholder="לדוגמה: בוטנים, חלב, ביצים"
                InputProps={{
                  sx: {
                    backgroundColor: editMode ? "white" : "#f5f5f5",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#bdbdbd" : "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: editMode ? "#757575" : "#e0e0e0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#03a9f4",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {editMode && (
            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSaving}
                sx={{
                  backgroundColor: "#03a9f4",
                  color: "white",
                  py: 1.2,
                  fontSize: "15px",
                  fontWeight: "500",
                  textTransform: "none",
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#0288d1",
                    boxShadow: "0 2px 8px rgba(3,169,244,0.3)",
                  },
                }}
              >
                {isSaving ? <CircularProgress size={20} /> : "עדכון פרטים"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setEditMode(false);
                  if (child) {
                    reset({
                      parentName: child.parentName || "",
                      Fname: child.Fname || "",
                      Lname: child.Lname || "",
                      dateOfBirth: child.dateOfBirth
                        ? child.dateOfBirth.substring(0, 10)
                        : "",
                      email: child.email || "",
                      phone1: child.phone1 || "",
                      phone2: child.phone2 || "",
                      city: child.address?.city || "",
                      street: child.address?.street || "",
                      building: child.address?.building || "",
                      educationInstitution: child.educationInstitution || "",
                      specialNeeds: child.definition || "",
                      allergies: Array.isArray(child.allergies)
                        ? child.allergies.join(", ")
                        : "",
                    });
                  }
                }}
                sx={{
                  borderColor: "#bdbdbd",
                  color: "#666",
                  py: 1.2,
                  fontSize: "15px",
                  fontWeight: "500",
                  textTransform: "none",
                  borderRadius: "6px",
                  "&:hover": {
                    borderColor: "#757575",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                ביטול
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      <PasswordDialog open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </Box>
  );
};

export default Profile;
