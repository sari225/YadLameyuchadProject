import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";

import { useCreateMessageMutation } from "../api/messageApi";

export default function ContactPage() {
  const navigate = useNavigate();
  const [createMessage, { isLoading }] = useCreateMessageMutation();

  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    topic: "",
    content: "",
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const topics = ["שאלה", "תלונה", "בקשה"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.senderName.trim()) newErrors.senderName = "שם מלא הוא שדה חובה";

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = "מייל הוא שדה חובה";
    } else if (
      !/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/.test(
        formData.senderEmail
      )
    ) {
      newErrors.senderEmail = "כתובת מייל לא תקינה";
    }

    if (!formData.topic) newErrors.topic = "נושא הוא שדה חובה";

    if (!formData.content.trim()) newErrors.content = "תוכן הפנייה הוא שדה חובה";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createMessage(formData).unwrap();

      setSnackbar({
        open: true,
        message: "ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.",
        severity: "success",
      });

      setFormData({
        senderName: "",
        senderEmail: "",
        topic: "",
        content: "",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "שגיאה בשליחת ההודעה",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        py: 4,
        direction: "rtl",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2", mb: 4 }}
        >
          יצירת קשר
        </Typography>

        {/* ⭐ גריד יציב */}
        <Grid
          container
          spacing={4}
          alignItems="flex-start"
          sx={{ minHeight: "680px" }}
        >
          {/* טופס יצירת קשר */}
          <Grid item xs={12} sm={6} md={8} lg={8} xl={8}>
            <Paper elevation={3} sx={{ p: 4, direction: "rtl", height: "100%" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
                שלח לנו הודעה
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="שם מלא *"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  error={!!errors.senderName}
                  helperText={errors.senderName}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="כתובת מייל *"
                  name="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  error={!!errors.senderEmail}
                  helperText={errors.senderEmail}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  select
                  label="נושא *"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  error={!!errors.topic}
                  helperText={errors.topic}
                  SelectProps={{
                    MenuProps: {
                      disableScrollLock: true,
                      PaperProps: {
                        sx: { direction: "ltr" }, // מונע קפיצה ב-RTL
                      },
                    },
                  }}
                  sx={{ mb: 3 }}
                >
                  {topics.map((topic) => (
                    <MenuItem key={topic} value={topic}>
                      {topic}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="תוכן הפנייה *"
                  name="content"
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={handleChange}
                  error={!!errors.content}
                  helperText={errors.content}
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/")}
                    disabled={isLoading}
                  >
                    ביטול
                  </Button>
                  <Button variant="contained" type="submit" disabled={isLoading}>
                    {isLoading ? "שולח..." : "שלח הודעה"}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>

          {/* פרטי התקשרות */}
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                bgcolor: "#1976d2",
                color: "white",
                position: "sticky",
                top: 20,
                height: "100%",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                פרטי התקשרות
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: "flex", mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 2, fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      כתובת
                    </Typography>
                    <Typography>רח' האדמו"ר מבעלזא 15, ביתר עילית</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      טלפון
                    </Typography>
                    <Typography>02-5809999</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex" }}>
                  <EmailIcon sx={{ mr: 2, fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                      אימייל
                    </Typography>
                    <Typography>info@yadlameyuchad.org</Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  שעות פעילות
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  ימים א'-ה': 9:00–17:00
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
 