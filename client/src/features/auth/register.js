import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "./authApi";
import { useNavigate } from "react-router-dom";
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

  age: z.string()
    .nonempty("יש להזין גיל")
    .regex(/^[0-9]+$/, "הגיל חייב להיות מספר"),

  city: z.string().nonempty("יש להזין עיר"),
  street: z.string().nonempty("יש להזין רחוב"),
  building: z.string()
    .nonempty("יש להזין מספר בית")
    .regex(/^[0-9]+$/, "מספר בית חייב להיות מספר"),

  phone1: z.string()
    .nonempty("יש להזין מספר טלפון")
    .regex(/^[0-9]+$/, "טלפון חייב להכיל רק ספרות")
    .min(9, "טלפון חייב להיות לפחות 9 ספרות")
    .max(10, "טלפון יכול להיות עד 10 ספרות"),

  phone2: z.string()
    .optional()
    .refine((val) => !val || /^[0-9]+$/.test(val), "טלפון חייב להכיל רק ספרות")
    .refine((val) => !val || (val.length >= 9 && val.length <= 10), "טלפון חייב להיות 9-10 ספרות"),

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

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const userData = {
        ...data,
        // המרת מחרוזת ריקה ל-undefined עבור phone2
        phone2: data.phone2 && data.phone2.trim() !== '' ? data.phone2 : undefined,
        specialNeeds: data.specialNeeds && data.specialNeeds.trim() !== '' ? data.specialNeeds : undefined,
        allergies: data.allergies && data.allergies.trim() !== '' ? data.allergies : undefined,
        address: {
          city: data.city,
          street: data.street,
          building: data.building,
        },
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
      
      // בדיקה מפורטת של שגיאות
      const errorMessage = error?.data?.message || error?.message || '';
      
      // בדיקה אם השגיאה קשורה לערך כפול
      if (errorMessage.includes("duplicate") || 
          errorMessage.includes("unique") ||
          errorMessage.includes("E11000") ||
          errorMessage.includes("already exists")) {
        
        // בדיקה ספציפית לאימייל
        if (errorMessage.includes("email") || errorMessage.includes("Email")) {
          setServerError("❌ כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אימייל אחרת או נסה להתחבר.");
        } 
        // בדיקה ספציפית למספר ת"ז
        else if (errorMessage.includes("childId") || errorMessage.includes("ת\"ז") || errorMessage.includes("זהות")) {
          setServerError("❌ מספר תעודת הזהות כבר רשום במערכת. אם זה הילד שלך, נסה להתחבר או פנה לתמיכה.");
        } 
        else {
          setServerError("❌ הפרטים שהזנת כבר קיימים במערכת. אנא בדוק את האימייל ומספר הזהות.");
        }
      } else {
        setServerError("❌ שגיאה בהרשמה. אנא בדוק את הפרטים ונסה שוב.");
      }
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
          sx={{ mb: 4 }}
        >
          <Tab label="התחברות" />
          <Tab label="הרשמה" />
        </Tabs>

        <Typography variant="h5" className="register-title">
          הרשמה
        </Typography>

        {serverError && (
          <Alert severity="error" className="register-alert">
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} className="register-grid-container">
            
            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="מספר זהות" 
                {...register("childId")} 
                error={!!errors.childId} 
                helperText={errors.childId?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="שם הורה" 
                {...register("parentName")} 
                error={!!errors.parentName} 
                helperText={errors.parentName?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="שם פרטי"
                {...register("Fname")} 
                error={!!errors.Fname} 
                helperText={errors.Fname?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="שם משפחה" 
                {...register("Lname")} 
                error={!!errors.Lname} 
                helperText={errors.Lname?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="גיל" 
                {...register("age")} 
                error={!!errors.age} 
                helperText={errors.age?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="אימייל" 
                {...register("email")} 
                error={!!errors.email} 
                helperText={errors.email?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="עיר" 
                {...register("city")} 
                error={!!errors.city} 
                helperText={errors.city?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="רחוב" 
                {...register("street")} 
                error={!!errors.street} 
                helperText={errors.street?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="מספר בית" 
                {...register("building")} 
                error={!!errors.building} 
                helperText={errors.building?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="טלפון" 
                {...register("phone1")} 
                error={!!errors.phone1} 
                helperText={errors.phone1?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="טלפון נוסף (אופציונלי)" 
                {...register("phone2")} 
                error={!!errors.phone2} 
                helperText={errors.phone2?.message} 
                fullWidth
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="פירוט הגדרה של הילד (אופציונלי)" 
                {...register("specialNeeds")} 
                error={!!errors.specialNeeds} 
                helperText={errors.specialNeeds?.message} 
                fullWidth 
                multiline
                rows={2}
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                variant="standard"
                label="פירוט אלרגיות (אופציונלי)" 
                {...register("allergies")} 
                error={!!errors.allergies} 
                helperText={errors.allergies?.message} 
                fullWidth 
                multiline
                rows={2}
                className="register-textfield"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    right: 0,
                    left: 'auto',
                    transformOrigin: 'top right',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} className="register-checkbox-container">
              <FormControlLabel
                control={
                  <Checkbox 
                    {...register("emailConsent")}
                    className="register-checkbox"
                  />
                }
                label="אני מאשר/ת קבלת דיוור אלקטרוני"
                className="register-checkbox-label"
              />
            </Grid>

            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={isLoading}
                className="register-button"
              >
                {isLoading ? <CircularProgress size={24} /> : "הרשם"}
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
