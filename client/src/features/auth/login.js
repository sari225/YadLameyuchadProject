import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "./authApi";
import { setToken } from "./authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const [serverError, setServerError] = useState("");

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
      // navigate("/dashboard")  // אם תרצי
    } catch {
      setServerError("מייל או סיסמה שגויים");
    }
  };

  const handleToggle = (event, value) => {
    if (value === 1) navigate("/register");
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
