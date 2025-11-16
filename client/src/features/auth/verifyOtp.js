import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyOTPMutation, useRegisterMutation } from '../../api/authApi';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Link
} from '@mui/material';
import './style/verifyOtp.css';

const otpSchema = z.object({
  otp: z.string()
    .min(6, 'הקוד חייב להיות בן 6 ספרות')
    .max(6, 'הקוד חייב להיות בן 6 ספרות')
    .regex(/^\d+$/, 'הקוד חייב להכיל ספרות בלבד'),
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const userData = location.state?.userData;
  
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useRegisterMutation();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess(false);
    setResendSuccess('');
    
    try {
      const response = await verifyOTP({ 
        email: email, 
        otp: data.otp 
      }).unwrap();
      
      setSuccess(true);
    } catch (err) {
      console.log('Verify OTP error:', err);
      const errorMessage = err?.data?.message || err?.message || '';
      
      // בדיקה אם תוקף הקוד פג
      if (errorMessage.includes('expired') || errorMessage.includes('has expired')) {
        setError('❌ תוקף הקוד פג. אנא לחץ על "שלח שוב" כדי לקבל קוד חדש.');
      } 
      // בדיקה אם הקוד לא תקין
      else if (errorMessage.includes('Invalid') || errorMessage.includes('Invalid OTP')) {
        setError('❌ הקוד שהוזן אינו תקין. אנא בדוק את הקוד ונסה שוב.');
      }
      // שגיאה כללית
      else {
        setError('❌ אימות נכשל. אנא בדוק את הקוד ונסה שוב.');
      }
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess(false);
    setResendSuccess('');
    
    if (!email || !userData) {
      setError('לא נמצאו נתוני משתמש. אנא חזור לדף ההרשמה.');
      return;
    }
    
    try {
      await resendOTP(userData).unwrap();
      setResendSuccess('הקוד נשלח מחדש לכתובת המייל שלך בהצלחה!');
    } catch (err) {
      setError(err.data?.message || 'שליחת הקוד נכשלה. אנא נסה שוב.');
    }
  };

  if (!email) {
    return (
      <Box className="verify-otp-container">
        <Box className="verify-otp-form-box">
          <Typography className="verify-otp-title">
            שגיאה
          </Typography>
          <Alert severity="error" className="verify-otp-alert">
            לא נמצאה כתובת מייל. אנא חזור לדף ההרשמה.
          </Alert>
        </Box>
      </Box>
    );
  }

  // תצוגת הצלחה
  if (success) {
    return (
      <Box className="verify-otp-container">
        <Box className="verify-otp-form-box verify-otp-success-box">
          <i className="fas fa-check-circle verify-otp-success-icon"></i>
          <Typography className="verify-otp-success-title">
            ההרשמה הושלמה בהצלחה!
          </Typography>
          <Typography className="verify-otp-success-message">
            כעת יש להמתין לאישור ההרשמה על ידי מנהל האתר
          </Typography>
          <Typography className="verify-otp-success-submessage">
            תקבל הודעה למייל ברגע שההרשמה תאושר
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="verify-otp-container">
      <Box className="verify-otp-form-box">
        <Typography className="verify-otp-title">
          אימות כתובת מייל
        </Typography>
        
        <Typography className="verify-otp-subtitle">
          קוד אימות נשלח לכתובת: {email}
        </Typography>

        {error && (
          <Alert severity="error" className="verify-otp-alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="verify-otp-alert">
            {success}
          </Alert>
        )}

        {resendSuccess && (
          <Alert severity="info" className="verify-otp-alert">
            {resendSuccess}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="verify-otp-form">
          <TextField
            {...register('otp')}
            label="הכנס קוד אימות בן 6 ספרות"
            variant="standard"
            fullWidth
            error={!!errors.otp}
            helperText={errors.otp?.message}
            className="verify-otp-textfield"
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
            }}
            InputLabelProps={{
              style: {
                right: 0,
                left: 'auto',
                transformOrigin: 'top right',
                color: 'rgba(255,255,255,0.9)',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isVerifying}
            className="verify-otp-button verify-otp-submit-button"
            sx={{
              color: 'white !important',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {isVerifying ? (
              <CircularProgress size={24} style={{ color: 'white' }} />
            ) : (
              'אימות קוד'
            )}
          </Button>

          <Box className="verify-otp-resend-container">
            <Typography className="verify-otp-resend-text">
              לא קיבלת קוד?{' '}
              <Link
                component="button"
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="verify-otp-resend-link"
              >
                {isResending ? 'שולח...' : 'שלח שוב'}
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default VerifyOtp;