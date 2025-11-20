import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { 
  useGetDayCampsQuery, 
  useAddChildToDayCampMutation 
} from "../../../api/dayCampApi";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { parseServerError } from "../../../utils/errorHandler";

const UserCampsList = () => {
  const { data: allDayCamps = [], isLoading, isError, error, refetch } = useGetDayCampsQuery();
  const [addChildToDayCamp, { isLoading: isRegistering }] = useAddChildToDayCampMutation();
  
  const token = useSelector((state) => state.auth.token);
  const currentUser = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, [token]);
  
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // רענן נתונים כשהקומפוננט נטען
  useEffect(() => {
    refetch();
  }, [refetch]);

  // סינון קייטנות לפי סטטוס רישום בלבד
  const dayCamps = allDayCamps.filter(camp => {
    return camp.registerStatus === true;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // פונקציה לבדיקה אם הילד כבר רשום לקייטנה
  const isAlreadyRegistered = (camp) => {
    if (!currentUser?.id || !camp.registeredChildren) {
      console.log('Check failed - currentUser:', currentUser, 'registeredChildren:', camp.registeredChildren);
      return false;
    }
    
    const isRegistered = camp.registeredChildren.some(child => {
      // הילד יכול להיות אובייקט או רק ID
      const childId = typeof child === 'object' ? child._id : child;
      const match = childId === currentUser.id;
      console.log('Comparing:', childId, '===', currentUser.id, '?', match);
      return match;
    });
    
    console.log('Camp:', camp.name, 'Is registered:', isRegistered);
    return isRegistered;
  };

  console.log('Current user from token:', currentUser);
  console.log('Day camps:', dayCamps);

  const handleRegisterClick = (camp) => {
    setSelectedCamp(camp);
    setOpenDialog(true);
  };

  const handleConfirmRegister = async () => {
    if (!selectedCamp) return;

    try {
      await addChildToDayCamp({ DayCampId: selectedCamp._id }).unwrap();
      setSuccessMessage("נרשמת בהצלחה לקייטנה! נשלח אליך מייל עם פרטי הקייטנה.");
      setOpenDialog(false);
      setSelectedCamp(null);
      refetch(); // רענון הנתונים
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = parseServerError(error, "שגיאה בהרשמה לקייטנה");
      setErrorMessage(errorMessage);
      setOpenDialog(false);
      setSelectedCamp(null);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCamp(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }} dir="rtl">
        <Alert severity="error">
          {parseServerError(error, "שגיאה בטעינת הקייטנות")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        קייטנות להרשמה
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {dayCamps.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            אין קייטנות זמינות כרגע
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            בדוק שוב בהמשך או פנה למנהל המערכת
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 3
        }}>
          {dayCamps.map((camp) => (
            <Card 
              key={camp._id}
              sx={{ 
                height: 600,
                display: "flex", 
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: "bold", minHeight: "32px" }}>
                    {camp.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarIcon sx={{ ml: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        {new Date(camp.startDate).toLocaleDateString("he-IL")} - {" "}
                        {new Date(camp.endDate).toLocaleDateString("he-IL")}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationIcon sx={{ ml: 1, color: "primary.main" }} />
                      <Typography variant="body2">{camp.location}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    {isAlreadyRegistered(camp) ? (
                      <Chip 
                        label="נרשמת לקייטנה בהצלחה" 
                        color="info" 
                        size="small"
                      />
                    ) : (
                      <Chip 
                        label="הרשמה פתוחה" 
                        color="success" 
                        size="small"
                      />
                    )}
                  </Box>

                  {/* תצוגה מקדימה של קובץ */}
                  {camp.file?.filename && (
                    <Box sx={{ mt: 2, border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", bgcolor: "#fafafa" }}>
                      {/* כותרת עם שם הקובץ וכפתור פתיחה */}
                      <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0" }}>
                        <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                          <AttachFileIcon sx={{ ml: 1, color: "primary.main", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {camp.file.filename}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            const fileURL = `${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}`;
                            window.open(fileURL, "_blank");
                          }}
                          sx={{ minWidth: "auto", px: 1, fontSize: "0.75rem" }}
                        >
                          פתח
                        </Button>
                      </Box>
                      
                      {/* תצוגה מקדימה של התוכן */}
                      <Box 
                        sx={{ 
                          height: 200, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          bgcolor: "white",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden"
                        }}
                        onClick={() => {
                          const fileURL = `${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}`;
                          window.open(fileURL, "_blank");
                        }}
                      >
                        {camp.file.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                          // תמונה
                          <Box
                            component="img"
                            src={`${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}`}
                            alt={camp.file.filename}
                            sx={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain"
                            }}
                          />
                        ) : camp.file.filename.toLowerCase().endsWith(".pdf") ? (
                          // PDF - תצוגה מקדימה ללא סרגל גלילה
                          <Box sx={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                            <iframe
                              src={`${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}#view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                              style={{
                                width: "120%",
                                height: "120%",
                                border: "none",
                                pointerEvents: "none",
                                overflow: "hidden",
                                position: "absolute",
                                top: "-10%",
                                left: "-10%"
                              }}
                              scrolling="no"
                              title={camp.file.filename}
                            />
                            {/* שכבה שקופה למניעת קליקים ומסתירה את סרגל הגלילה */}
                            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "transparent" }} />
                          </Box>
                        ) : camp.file.filename.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mpeg)$/i) ? (
                          // סרטון - תצוגה מקדימה
                          <Box
                            component="video"
                            src={`${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}`}
                            autoPlay
                            muted
                            loop
                            controls
                            playsInline
                            sx={{ 
                              width: "100%", 
                              height: "100%", 
                              objectFit: "contain",
                              display: "block",
                              backgroundColor: "#000"
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          // קבצים אחרים - אייקון
                          <Box sx={{ textAlign: "center", p: 3 }}>
                            <AttachFileIcon sx={{ fontSize: 60, color: "#bdbdbd", mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {camp.file.filename.split(".").pop().toUpperCase()} קובץ
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0, mt: "auto" }}>
                  {isAlreadyRegistered(camp) ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled
                      sx={{
                        fontWeight: "bold",
                        py: 1.5,
                      }}
                    >
                      הירשם לקייטנה
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleRegisterClick(camp)}
                      sx={{
                        backgroundColor: "#4caf50",
                        "&:hover": { backgroundColor: "#45a049" },
                        fontWeight: "bold",
                        py: 1.5,
                      }}
                    >
                      הירשם לקייטנה
                    </Button>
                  )}
                </Box>
              </Card>
            ))}
        </Box>
      )}

      {/* Dialog אישור הרשמה */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "right", fontWeight: "bold" }}>
          אישור הרשמה לקייטנה
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", left: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCamp && (
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedCamp.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>תאריכים:</strong> {new Date(selectedCamp.startDate).toLocaleDateString("he-IL")} - {new Date(selectedCamp.endDate).toLocaleDateString("he-IL")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>מיקום:</strong> {selectedCamp.location}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                האם אתה בטוח שברצונך להירשם לקייטנה זו?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                לאחר האישור נשלח אליך מייל עם כל הפרטים הנדרשים.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-start", p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            ביטול
          </Button>
          <Button
            onClick={handleConfirmRegister}
            variant="contained"
            disabled={isRegistering}
            sx={{ 
              backgroundColor: "#4caf50", 
              "&:hover": { backgroundColor: "#45a049" },
              ml: 1 
            }}
          >
            {isRegistering ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "אישור הרשמה"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserCampsList;
