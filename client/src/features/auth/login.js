import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation, useForgotPasswordMutation } from "./authApi";
import { setToken } from "./authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./style/login.css";

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
} from "@mui/material";

const loginSchema = z.object({
  email: z.string().nonempty("יש להזין מייל"),
  password: z.string().nonempty("יש להזין סיסמה"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [serverError, setServerError] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await login(data).unwrap();
      dispatch(setToken({ token: res.token }));
      
      // פענוח הטוקן לבדיקת ה-role
      const decodedToken = jwtDecode(res.token);
      const userRole = decodedToken.role;
      
      // הפניה בהתאם לסוג המשתמש
      if (userRole === "admin") {
        navigate("/admin");
      } else  {navigate("/user");}
    } catch {
      setServerError("מייל או סיסמה שגויים");
    }
  };

  const handleToggle = (event, value) => {
    if (value === 1) navigate("/register");
  };

  const handleForgotPassword = async () => {
    const emailField = document.querySelector('input[name="email"]');
    const email = emailField?.value;

    if (!email) {
      setServerError("אנא הזן כתובת מייל תחילה");
      return;
    }

    setServerError("");
    setForgotPasswordMessage("");
    
    try {
      await forgotPassword({ email }).unwrap();
      setForgotPasswordMessage("סיסמה חדשה נשלחה למייל שלך");
      setShowForgotPassword(false);
    } catch (error) {
      setServerError("שגיאה בשליחת סיסמה חדשה. אנא בדוק את כתובת המייל");
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-form-box">
        <Tabs
          value={0}
          onChange={handleToggle}
          centered
          className="login-tabs"
          sx={{ mb: 3 }}
        >
          <Tab label="התחברות" />
          <Tab label="הרשמה" />
        </Tabs>

        <Typography variant="h5" className="login-title">
          התחברות
        </Typography>

        {serverError && (
          <Alert severity="error" className="login-alert">
            {serverError}
          </Alert>
        )}

        {forgotPasswordMessage && (
          <Alert severity="success" className="login-alert">
            {forgotPasswordMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} className="login-form">
          <TextField
            variant="standard"
            label="אימייל"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            className="login-textfield"
            InputLabelProps={{
              shrink: true,
              sx: {
                right: 0,
                left: 'auto',
                transformOrigin: 'top right',
              }
            }}
          />

          <TextField
            variant="standard"
            label="סיסמה"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            className="login-textfield"
            InputLabelProps={{
              shrink: true,
              sx: {
                right: 0,
                left: 'auto',
                transformOrigin: 'top right',
              }
            }}
          />

          <Box className="forgot-password-container">
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={isForgotLoading}
              className="forgot-password-link"
            >
              {isForgotLoading ? "שולח..." : "שכחתי סיסמה"}
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "התחבר"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
