import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { parseServerError } from "../../utils/errorHandler";
import "./style/register.css";

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";

const registerSchema = z.object({
  childId: z.string()
    .nonempty("יש להזין מספר ילד")
    .regex(/^[0-9]+$/, "מספר ילד חייב להכיל רק ספרות")
    .min(5, "מספר ילד חייב להכיל לפחות 5 ספרות")
    .max(9, "מספר ילד יכול להכיל עד 9 ספרות"),

  parentName: z.string().nonempty("יש להזין שם הורה"),
  Fname: z.string().nonempty("יש להזין שם פרטי"),
  Lname: z.string().nonempty("יש להזין שם משפחה"),

  dateOfBirth: z.string()
    .nonempty("יש להזין תאריך לידה")
    .refine((val) => !isNaN(Date.parse(val)), "תאריך לידה לא תקין"),

  city: z.string().nonempty("יש להזין עיר"),
  street: z.string().nonempty("יש להזין רחוב"),
  building: z.string()
    .nonempty("יש להזין מספר בית")
    .regex(/^[0-9]+$/, "מספר בית חייב להיות מספר"),

  educationInstitution: z.string()
    .nonempty("יש להזין שם מוסד לימודי")
    .max(100, "שם המוסד יכול להכיל עד 100 תווים"),

  phone1: z.string()
    .nonempty("יש להזין מספר טלפון")
    .regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
    .min(9, "טלפון חייב להיות לפחות 9 ספרות")
    .max(10, "טלפון יכול להיות עד 10 ספרות"),

  phone2: z.string()
    .nonempty("יש להזין מספר טלפון נוסף")
    .regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
    .min(9, "טלפון חייב להיות לפחות 9 ספרות")
    .max(10, "טלפון יכול להיות עד 10 ספרות"),

  email: z.string()
    .nonempty("יש להזין אימייל")
    .email("כתובת אימייל לא תקינה"),

  specialNeeds: z.string().optional(),
  allergies: z.string().optional(),
  emailConsent: z.boolean().optional(),
});

const Register = () => {
  const navigate = useNavigate();
  const [registerChild, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState:{ errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // עיצוב אחיד לכל הפקדים
  const textFieldStyle = {
    '& .MuiInputBase-input': {
      color: '#000',
      fontFamily: "'M PLUS Rounded 1c', sans-serif"
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: '#000'
    },
    '& .MuiInput-underline:hover:before': {
      borderBottomColor: '#000'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#000'
    },
    '& .MuiFormHelperText-root': {
      fontFamily: "'M PLUS Rounded 1c', sans-serif",
      color: '#000'
    }
  };

  const labelStyle = {
    right: 0,
    left: 'auto',
    transformOrigin: 'top right',
    color: '#000 !important',
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    '&.Mui-focused': {
      color: '#000 !important'
    }
  };

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const userData = {
        ...data,
        phone2: data.phone2,
        specialNeeds: data.specialNeeds && data.specialNeeds.trim() !== '' ? data.specialNeeds : undefined,
        allergies: data.allergies && data.allergies.trim() !== '' ? data.allergies : undefined,
        address: {
          city: data.city,
          street: data.street,
          building: data.building,
        },
        educationInstitution: data.educationInstitution,
        dateOfBirth: data.dateOfBirth,
      };
      
      await registerChild(userData).unwrap();

      // שולחים למסך אימות OTP עם המייל ונתוני המשתמש
      navigate("/verify-otp", { 
        state: { 
          email: data.email,
          userData: userData
        } 
      });

    } catch (error) {
      console.log('Registration error:', error);
      console.log('Error data:', error?.data);
      
      // שימוש בפונקציית טיפול השגיאות המרכזית
      const errorMessage = parseServerError(error, "❌ שגיאה בהרשמה. אנא בדוק את הפרטים ונסה שוב.");
      setServerError(errorMessage);
    }
  };

  const handleToggle = (event, value) => {
    if (value === 0) navigate("/login");
  };

  return (
    <Box className="register-container">
      <Box className="register-form-box">

        <Tabs
          value={1}
          onChange={handleToggle}
          centered
          className="register-tabs"
          sx={{ 
            mb: 4,
            '& .MuiTab-root': {
              color: '#000 !important',
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontWeight: 'bold'
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#000 !important',
              fontFamily: "'M PLUS Rounded 1c', sans-serif",
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#000'
            }
          }}
        >
          <Tab label="התחברות" />
          <Tab label="הרשמה" />
        </Tabs>

        <Typography variant="h5" className="register-title" sx={{ 
          mb: 2,
          color: '#000',
          fontFamily: "'M PLUS Rounded 1c', sans-serif"
        }}>
          יש למלא את פרטי הילד
        </Typography>
        {serverError && (
          <Alert severity="error" className="register-alert">
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          
          {/* פרטים אישיים */}
          <Typography variant="h5" sx={{ 
            color: '#2C5282', 
            fontWeight: 'bold', 
            textAlign: 'right',
            borderBottom: '3px solid #2C5282',
            paddingBottom: '12px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: "'M PLUS Rounded 1c', sans-serif"
          }}>
            פרטים אישיים
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
              <TextField 
                variant="standard"
                label="תאריך לידה *" 
                type="date"
                {...register("dateOfBirth")} 
                error={!!errors.dateOfBirth} 
                helperText={errors.dateOfBirth?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: labelStyle
                }}
                InputProps={{
                  inputProps: {
                    max: new Date().toISOString().split('T')[0]
                  }
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>

          {/* פרטי תקשורת */}
          <Typography variant="h5" sx={{ 
            color: '#2C5282', 
            fontWeight: 'bold', 
            textAlign: 'right',
            borderBottom: '3px solid #2C5282',
            paddingBottom: '12px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: "'M PLUS Rounded 1c', sans-serif"
          }}>
            פרטי תקשורת
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>

          {/* כתובת */}
          <Typography variant="h5" sx={{ 
            color: '#2C5282', 
            fontWeight: 'bold', 
            textAlign: 'right',
            borderBottom: '3px solid #2C5282',
            paddingBottom: '12px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: "'M PLUS Rounded 1c', sans-serif"
          }}>
            כתובת
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
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
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>

          {/* מידע רפואי */}
          <Typography variant="h5" sx={{ 
            color: '#2C5282', 
            fontWeight: 'bold', 
            textAlign: 'right',
            borderBottom: '3px solid #2C5282',
            paddingBottom: '12px',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: "'M PLUS Rounded 1c', sans-serif"
          }}>
            מידע רפואי
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 5 }} className="mobile-full-width">
            <Grid item xs={12} className="mobile-field">
              <TextField 
                variant="standard"
                label="פירוט הגדרה של הילד" 
                {...register("specialNeeds")} 
                error={!!errors.specialNeeds} 
                helperText={errors.specialNeeds?.message} 
                fullWidth 
                multiline
                rows={2}
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} className="mobile-field">
              <TextField 
                variant="standard"
                label="פירוט אלרגיות" 
                {...register("allergies")} 
                error={!!errors.allergies} 
                helperText={errors.allergies?.message} 
                fullWidth 
                multiline
                rows={2}
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: labelStyle
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>

          {/* כפתורי הגשה */}
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  {...register("emailConsent")}
                  className="register-checkbox"
                  sx={{
                    color: '#000',
                    '&.Mui-checked': {
                      color: '#2C5282'
                    }
                  }}
                />
              }
              label="אני מאשר/ת קבלת דיוור אלקטרוני"
              className="register-checkbox-label"
              sx={{ 
                alignSelf: 'flex-start',
                direction: 'rtl',
                marginLeft: 0,
                color: '#000',
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                '& .MuiFormControlLabel-label': {
                  color: '#000',
                  fontFamily: "'M PLUS Rounded 1c', sans-serif"
                }
              }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={isLoading}
              className="register-button"
              sx={{ 
                mt: 2,
                backgroundColor: '#c887c9',
                '&:hover': {
                  backgroundColor: '#b575b7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(200, 135, 201, 0.4)'
                },
                '&:disabled': {
                  backgroundColor: '#CCCCCC'
                },
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(200, 135, 201, 0.3)',
                transition: 'all 0.3s ease',
                color: '#000'
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "הרשם"}
            </Button>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default Register;
