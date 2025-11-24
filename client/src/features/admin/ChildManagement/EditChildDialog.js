import React, { useEffect, useState } from "react";
import "./style/EditChildDialog.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useUpdateChildMutation,
  useGetChildByIdQuery,
} from "../../../api/childApi";
import { parseServerError } from "../../../utils/errorHandler";
import { childValidationSchema } from "./childValidationSchema";
import { processAllergies } from "./childManagementHelpers";

// =============================
//      קומפוננטת עריכה מלאה
// =============================
const EditChildDialog = ({ open, onClose, child, onSuccess }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(childValidationSchema),
    defaultValues: {},
  });

  // טעינת נתוני הילד מהשרת
  const {
    data: childDataFromDB,
    isLoading: isChildLoading,
    isError: isChildError,
    error: childLoadError,
    isSuccess,
    refetch,
  } = useGetChildByIdQuery(child?._id, {
    skip: !open || !child?._id,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [updateChild, { isLoading: isSaving }] = useUpdateChildMutation();

  const toFormValues = (data) => ({
    childId: data?.childId || "",
    parentName: data?.parentName || "",
    Fname: data?.Fname || "",
    Lname: data?.Lname || "",
    dateOfBirth: data?.dateOfBirth
      ? data.dateOfBirth.substring(0, 10)
      : "",
    city: data?.address?.city || "",
    street: data?.address?.street || "",
    building: data?.address?.building?.toString() || "",
    educationInstitution: data?.educationInstitution || "",
    phone1: data?.phone1 || "",
    phone2: data?.phone2 || "",
    email: data?.email || "",
    specialNeeds: data?.definition || "",
    allergies: Array.isArray(data?.allergies)
      ? data.allergies.join(", ")
      : data?.allergies || "",
    emailConsent: data?.emailConsent || false,
  });

  useEffect(() => {
    if (open && child?._id) refetch();
  }, [open, child?._id, refetch]);

  useEffect(() => {
    if (open && isSuccess && childDataFromDB) {
      reset(toFormValues(childDataFromDB));
    }
  }, [open, isSuccess, childDataFromDB, reset]);

  const handleClose = () => {
    setServerError("");
    if (childDataFromDB) reset(toFormValues(childDataFromDB));
    onClose();
  };

  if (open && isChildLoading) {
    return (
      <Dialog open={open} fullWidth maxWidth="md" dir="rtl">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>טוען נתונים...</Typography>
        </Box>
      </Dialog>
    );
  }

  if (open && isChildError) {
    return (
      <Dialog open={open} fullWidth maxWidth="md" dir="rtl">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Alert severity="error">
            {parseServerError(
              childLoadError,
              "שגיאה בטעינת פרטי הילד מהשרת."
            )}
          </Alert>
          <Button variant="outlined" onClick={onClose}>
            סגירה
          </Button>
        </Box>
      </Dialog>
    );
  }

  // שליחת עדכון לשרת
  const onSubmit = async (data) => {
    setServerError("");

    const childData = {
      childId: data.childId,
      parentName: data.parentName,
      Fname: data.Fname,
      Lname: data.Lname,
      dateOfBirth: data.dateOfBirth,
      phone1: data.phone1,
      phone2: data.phone2,
      email: data.email,
      educationInstitution: data.educationInstitution,
      address: {
        city: data.city,
        street: data.street,
        building: data.building,
      },
      allergies: processAllergies(data.allergies),
      definition: data.specialNeeds || "",
      emailConsent: data.emailConsent || false,
    };

    try {
      await updateChild({ id: child._id, childData }).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setServerError(
        parseServerError(error, "❌ שגיאה בעדכון. אנא בדקי שוב.")
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
      className="edit-child-dialog"
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgb(243, 230, 240) 0%, rgb(237, 247, 250) 100%)",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle> עריכת פרטי ילד </DialogTitle>

      <DialogContent>
        <Typography className="dialog-subtitle">
          ניתן לערוך ולעדכן את פרטי הילד.
        </Typography>

        {serverError && (
          <Alert severity="error" className="server-error-alert">
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* ------- פרטים אישיים ------- */}
          <Typography
            variant="h5"
            sx={{
              color: "#2C5282",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: "3px solid #2C5282",
              paddingBottom: "12px",
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
            }}
          >
            פרטים אישיים
          </Typography>

          <Grid container spacing={3} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="שם הורה *"
                {...register("parentName")}
                error={!!errors.parentName}
                helperText={errors.parentName?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="שם פרטי *"
                {...register("Fname")}
                error={!!errors.Fname}
                helperText={errors.Fname?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="שם משפחה *"
                {...register("Lname")}
                error={!!errors.Lname}
                helperText={errors.Lname?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="מספר זהות *"
                {...register("childId")}
                error={!!errors.childId}
                helperText={errors.childId?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                type="date"
                variant="standard"
                label="תאריך לידה *"
                {...register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  inputProps: {
                    max: new Date().toISOString().split("T")[0],
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="מוסד לימודי *"
                {...register("educationInstitution")}
                error={!!errors.educationInstitution}
                helperText={errors.educationInstitution?.message}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* ------- פרטי תקשורת ------- */}
          <Typography
            variant="h5"
            sx={{
              color: "#2C5282",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: "3px solid #2C5282",
              paddingBottom: "12px",
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
            }}
          >
            פרטי תקשורת
          </Typography>

          <Grid container spacing={3} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="אימייל *"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="טלפון אבא *"
                {...register("phone1")}
                error={!!errors.phone1}
                helperText={errors.phone1?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="טלפון אמא *"
                {...register("phone2")}
                error={!!errors.phone2}
                helperText={errors.phone2?.message}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* ------- כתובת ------- */}
          <Typography
            variant="h5"
            sx={{
              color: "#2C5282",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: "3px solid #2C5282",
              paddingBottom: "12px",
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
            }}
          >
            כתובת
          </Typography>

          <Grid container spacing={3} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="עיר *"
                {...register("city")}
                error={!!errors.city}
                helperText={errors.city?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="רחוב *"
                {...register("street")}
                error={!!errors.street}
                helperText={errors.street?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="מספר בית *"
                {...register("building")}
                error={!!errors.building}
                helperText={errors.building?.message}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* ------- מידע רפואי ------- */}
          <Typography
            variant="h5"
            sx={{
              color: "#2C5282",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: "3px solid #2C5282",
              paddingBottom: "12px",
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
            }}
          >
            מידע רפואי
          </Typography>

          <Grid container spacing={3} className="mobile-full-width">
            <Grid item xs={4} className="medical-field-align">
              <TextField
                variant="standard"
                label="פירוט אלרגיות"
                {...register("allergies")}
                error={!!errors.allergies}
                helperText={errors.allergies?.message}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>

            <Grid item xs={4} className="medical-field-align">
              <TextField
                variant="standard"
                label="פירוט הגדרה של הילד"
                {...register("specialNeeds")}
                error={!!errors.specialNeeds}
                helperText={errors.specialNeeds?.message}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          className="cancel-button"
          disabled={isSaving}
        >
          ביטול
        </Button>

        <Button
          onClick={handleSubmit(onSubmit)}
          className="submit-button"
          disabled={isSaving}
        >
          {isSaving ? "מעדכן..." : "עדכן"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditChildDialog;
