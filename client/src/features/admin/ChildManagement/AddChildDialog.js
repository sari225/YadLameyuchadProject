import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateChildMutation } from "../../../api/childApi";
import { parseServerError } from "../../../utils/errorHandler";
import { childValidationSchema, defaultChildValues } from "./childValidationSchema";
import { processAllergies } from "./childManagementHelpers";
import "./style/AddChildDialog.css";

// ------ COMPONENT ------
const AddChildDialog = ({ open, onClose, onSuccess }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(childValidationSchema),
    defaultValues: defaultChildValues,
  });

  const [createChild, { isLoading: isSaving }] = useCreateChildMutation();

  // ------ SUBMIT ------
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
      email: data.email || "",
      educationInstitution: data.educationInstitution,

      address: {
        city: data.city,
        street: data.street,
        building: data.building,
      },

      allergies: processAllergies(data.allergies),

      definition: data.specialNeeds || "",
      emailConsent: false,
      isApproved: true,
      isVerified: true,
    };

    try {
      await createChild(childData).unwrap();

      if (onSuccess) onSuccess();

      reset();
      onClose();
    } catch (error) {
      const errorMessage = parseServerError(
        error,
        "❌ שגיאה ביצירת ילד. אנא בדקי את הנתונים ונסי שוב."
      );
      setServerError(errorMessage);
    }
  };

  // ------ CLOSE ------
  const handleClose = () => {
    setServerError("");
    reset();
    onClose();
  };

  // ------ UI ------
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
      className="add-child-dialog"
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgb(243, 230, 240) 0%, rgb(237, 247, 250) 100%)",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle> הוספת ילד חדש </DialogTitle>

      <DialogContent>
        <Typography className="dialog-subtitle">
          מלאי את פרטי הילד. שדות עם * הם שדות חובה.
        </Typography>

        {serverError && <Alert severity="error">{serverError}</Alert>}

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

          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="שם הורה *"
                {...register("parentName")}
                error={!!errors.parentName}
                helperText={errors.parentName?.message}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                type="date"
                label="תאריך לידה *"
                {...register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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

          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="אימייל *"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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

          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="עיר *"
                {...register("city")}
                error={!!errors.city}
                helperText={errors.city?.message}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
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

          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="פירוט הגדרה של הילד"
                {...register("specialNeeds")}
                error={!!errors.specialNeeds}
                helperText={errors.specialNeeds?.message}
                multiline
                rows={2}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="standard"
                label="פירוט אלרגיות"
                {...register("allergies")}
                error={!!errors.allergies}
                helperText={errors.allergies?.message}
                multiline
                rows={2}
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: { right: 0, left: "auto", transformOrigin: "top right" },
                }}
              />
            </Grid>
          </Grid>

          {/* ------- כפתורים ------- */}
          <DialogActions>
            <Button type="submit" className="submit-button" disabled={isSaving}>
              {isSaving ? <CircularProgress size={22} /> : "הוספת ילד"}
            </Button>

            <Button onClick={handleClose} className="cancel-button">
              ביטול
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;
