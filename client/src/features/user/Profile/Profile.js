import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
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
  IconButton,
  Tooltip,
} from "@mui/material";
import "./profileStyles.css";
import { Edit as EditIcon, Lock as LockIcon, MarkEmailRead as MarkEmailReadIcon, Close as CloseIcon, Unsubscribe as UnsubscribeIcon } from "@mui/icons-material";
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
import { parseServerError } from "../../../utils/errorHandler";

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
  building: z.string()
    .min(1, "מספר בית הוא שדה חובה")
    .regex(/^[0-9]+$/, "מספר בית חייב להכיל רק ספרות")
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 1 && num <= 500;
    }, "מספר בית חייב להיות בין 1 ל-500"),
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

  const [message, setMessage] = useState({ type: "", text: "" });

  const onSubmit = async ({ newPassword }) => {
    setMessage({ type: "", text: "" });
    try {
      await updatePassword({ newPassword }).unwrap();
      setMessage({ type: "success", text: "הסיסמה עודכנה בהצלחה" });
      reset();
      setTimeout(() => {
        setMessage({ type: "", text: "" });
        onClose();
      }, 2000);
    } catch (e) {
      const msg = e?.data?.message || "שגיאה בעדכון הסיסמה";
      setMessage({ type: "error", text: msg });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className="confirmation-dialog">
      <DialogTitle className="dialog-title">
        שינוי סיסמה
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", left: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="dialog-content">
        {message.text && (
          <Alert severity={message.type} className="profile-alert">
            {message.text}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            type="password"
            label="סיסמה חדשה"
            fullWidth
            margin="normal"
            className="profile-text-field"
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            type="password"
            label="אימות סיסמה"
            fullWidth
            margin="normal"
            className="profile-text-field"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </Box>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} variant="outlined" className="dialog-button-cancel">
          ביטול
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isLoading} 
          className="dialog-button-confirm"
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "עדכן סיסמה"}
        </Button>
      </DialogActions>
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
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isTogglingEmail, setIsTogglingEmail] = useState(false);

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
        building: String(child.address?.building || ""),
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
    setMessage({ type: "", text: "" });
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
      setMessage({ type: "success", text: "הפרטים עודכנו בהצלחה" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      setEditMode(false);
      refetch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const errorMessage = parseServerError(e, "שגיאה בעדכון הפרופיל");
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleEmailConsent = async () => {
    if (!id || !child) return;
    setIsTogglingEmail(true);
    setMessage({ type: "", text: "" });
    try {
      await updateChild({
        id,
        childData: { emailConsent: !child.emailConsent },
      }).unwrap();
      const text = child.emailConsent
        ? "בוטלה הסכמה לקבלת דיוור במייל"
        : "ניתנה הסכמה לקבלת דיוור במייל";
      setMessage({ type: "success", text });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (e) {
      setMessage({ type: "error", text: "שגיאה בעדכון הגדרות דיוור" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } finally {
      setIsTogglingEmail(false);
    }
  };

  if (!id) {
    return <Alert severity="error">לא נמצאה זהות משתמש</Alert>;
  }

  return (
    <Box className="profile-main-container" dir="rtl">
      <Typography variant="h3" className="profile-page-title">
        הפרופיל שלי
      </Typography>

      <div className="profile-description-container">
        <Typography variant="h6" className="profile-description">
          כאן תוכל לעדכן את הפרטים האישיים שלך ולשנות את הסיסמה
        </Typography>
      </div>

      {isFetching && !child && (
        <Box className="profile-loading-container">
          <CircularProgress size={60} className="profile-loading" />
        </Box>
      )}
      {isError && (
        <Alert severity="error" className="profile-alert">
          {parseServerError(error, "שגיאה בטעינת הנתונים")}
        </Alert>
      )}

      <Paper className="profile-card">
        <Box className="profile-alert-container">
          {message.text && (
            <Alert severity={message.type} className="profile-alert-inside">
              {message.text}
            </Alert>
          )}
        </Box>
        
        <Box className="profile-card-header">
          <Typography className="profile-card-title">
            פרטים אישיים
          </Typography>
          {!editMode && (
            <Box className="profile-card-actions">
              <Tooltip title="עריכת פרטים" arrow placement="top">
                <IconButton
                  onClick={() => setEditMode(true)}
                  className="profile-icon-button"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="שינוי סיסמה" arrow placement="top">
                <IconButton
                  onClick={() => setPwdOpen(true)}
                  className="profile-icon-button"
                >
                  <LockIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={child?.emailConsent ? "ביטול דיוור" : "קבלת דיוור"} arrow placement="top">
                <span>
                  <IconButton
                    onClick={handleToggleEmailConsent}
                    disabled={isTogglingEmail}
                    className="profile-icon-button"
                  >
                    {isTogglingEmail ? (
                      <CircularProgress size={24} />
                    ) : (
                      child?.emailConsent ? <UnsubscribeIcon /> : <MarkEmailReadIcon />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box className="profile-form-group">
            <Box className="profile-field">
              <Typography className="profile-field-label">כתובת מייל</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="example@example.com"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">שם הורה</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("parentName")}
                error={!!errors.parentName}
                helperText={errors.parentName?.message}
                placeholder="שם הורה"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">טלפון אבא</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("phone1")}
                error={!!errors.phone1}
                helperText={errors.phone1?.message}
                placeholder="05xxxxxxxx"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">טלפון אמא</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("phone2")}
                error={!!errors.phone2}
                helperText={errors.phone2?.message}
                placeholder="05xxxxxxxx"
                className="profile-text-field"
              />
            </Box>
          </Box>
          <Box className="profile-form-group">
            <Box className="profile-field">
              <Typography className="profile-field-label">שם פרטי</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("Fname")}
                error={!!errors.Fname}
                helperText={errors.Fname?.message}
                placeholder="שם פרטי"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">שם משפחה</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("Lname")}
                error={!!errors.Lname}
                helperText={errors.Lname?.message}
                placeholder="שם משפחה"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">תאריך לידה</Typography>
              <TextField
                type="date"
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                className="profile-text-field"
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">גיל</Typography>
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
                className="profile-text-field profile-text-field-disabled"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">עיר</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("city")}
                error={!!errors.city}
                helperText={errors.city?.message}
                placeholder="עיר"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">רחוב</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("street")}
                error={!!errors.street}
                helperText={errors.street?.message}
                placeholder="רחוב"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">מספר בית</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("building")}
                error={!!errors.building}
                helperText={errors.building?.message}
                placeholder="מספר בית"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">מוסד לימודים</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("educationInstitution")}
                placeholder="שם המוסד החינוכי"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">פירוט הגדרה של הילד</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("specialNeeds")}
                placeholder="הערות או הגדרות מיוחדות"
                className="profile-text-field"
              />
            </Box>

            <Box className="profile-field">
              <Typography className="profile-field-label">אלרגיות</Typography>
              <TextField
                variant="outlined"
                fullWidth
                disabled={!editMode}
                {...register("allergies")}
                placeholder="לדוגמה: בוטנים, חלב, ביצים"
                className="profile-text-field"
              />
            </Box>
          </Box>

          {editMode && (
            <Box className="profile-buttons-container">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSaving}
                className="profile-save-button"
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
                      building: String(child.address?.building || ""),
                      educationInstitution: child.educationInstitution || "",
                      specialNeeds: child.definition || "",
                      allergies: Array.isArray(child.allergies)
                        ? child.allergies.join(", ")
                        : "",
                    });
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="profile-cancel-button"
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
