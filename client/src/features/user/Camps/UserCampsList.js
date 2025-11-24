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
import "./userCampsListStyles.css";

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
    <div className="camps-main-container" dir="rtl">
      <Typography variant="h3" className="camps-page-title">
        קייטנות להרשמה
      </Typography>
      
      <div className="camps-description-container">
        <Typography variant="h6" className="camps-description">
          כאן תוכל להירשם לקייטנות הקרובות שלנו.
          <br />
          בחר את הקייטנה המתאימה לך ולחץ על כפתור ההרשמה
        </Typography>
      </div>

      {successMessage && (
        <Alert severity="success" className="camps-alert">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" className="camps-alert">
          {errorMessage}
        </Alert>
      )}

      {dayCamps.length === 0 ? (
        <div className="no-camps-simple-message">
          <CalendarIcon className="no-camps-icon-simple" />
          <Typography className="no-camps-simple-text">
              אין קייטנות זמינות להרשמה
          </Typography>
        </div>
      ) : (
        <div className="camps-grid">
          {dayCamps.map((camp) => (
            <Card key={camp._id} className="camp-card">
                <CardContent className="camp-card-content">
                  <Typography className="camp-name">
                    {camp.name}
                  </Typography>
                  
                  <div className="camp-details">
                    <div className="camp-detail-row">
                      <CalendarIcon className="camp-detail-icon" />
                      <Typography className="camp-detail-text">
                        {new Date(camp.startDate).toLocaleDateString("he-IL")} - {" "}
                        {new Date(camp.endDate).toLocaleDateString("he-IL")}
                      </Typography>
                    </div>
                    
                    <div className="camp-detail-row">
                      <LocationIcon className="camp-detail-icon" />
                      <Typography className="camp-detail-text">{camp.location}</Typography>
                    </div>
                  </div>

                  <Divider className="camp-divider" />

                  <div className="status-chip-container">
                    {isAlreadyRegistered(camp) ? (
                      <Chip 
                        label="נרשמת בהצלחה" 
                        variant="outlined"
                        size="small"
                        className="camp-status-chip-registered"
                      />
                    ) : (
                      <Chip 
                        label="הרשמה פתוחה" 
                        variant="outlined"
                        size="small"
                        className="camp-status-chip-open"
                      />
                    )}
                  </div>

                  {/* תצוגה מקדימה של קובץ */}
                  {camp.file?.filename && (
                    <div className="file-preview-container">
                      {/* כותרת עם שם הקובץ וכפתור פתיחה */}
                      <div className="file-header">
                        <div className="file-header-content">
                          <AttachFileIcon className="file-icon" />
                          <Typography className="file-name">
                            {camp.file.filename}
                          </Typography>
                        </div>
                      </div>
                      
                      {/* תצוגה מקדימה של התוכן */}
                      <div 
                        className="file-preview-content"
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
                            className="preview-image"
                          />
                        ) : camp.file.filename.toLowerCase().endsWith(".pdf") ? (
                          // PDF - תצוגה מקדימה ללא סרגל גלילה
                          <div className="pdf-preview-container">
                            <iframe
                              src={`${process.env.REACT_APP_API_URL}/${camp.file.path.replace(/\\/g, "/")}#view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                              className="pdf-iframe"
                              scrolling="no"
                              title={camp.file.filename}
                            />
                            {/* שכבה שקופה למניעת קליקים ומסתירה את סרגל הגלילה */}
                            <div className="pdf-overlay" />
                          </div>
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
                            className="preview-video"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          // קבצים אחרים - אייקון
                          <Box sx={{ textAlign: "center", p: 3 }}>
                            <AttachFileIcon className="file-icon-large" />
                            <Typography className="file-type-text">
                              {camp.file.filename.split(".").pop().toUpperCase()} קובץ
                            </Typography>
                          </Box>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <div className="camp-actions">
                  {isAlreadyRegistered(camp) ? (
                    <Button
                      variant="contained"
                      disabled
                      className="register-button-clubs-style registered"
                    >
                      נרשמת לקייטנה
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleRegisterClick(camp)}
                      className="register-button-clubs-style"
                    >
הרשם לקייטנה               
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Dialog אישור הרשמה */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth className="confirmation-dialog">
        <DialogTitle className="dialog-title">
          אישור הרשמה לקייטנה
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", left: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="dialog-content">
          {selectedCamp && (
            <div>
              <Typography className="dialog-camp-name">
                {selectedCamp.name}
              </Typography>
              <Typography className="dialog-camp-detail">
                <strong>תאריכים:</strong> {new Date(selectedCamp.startDate).toLocaleDateString("he-IL")} - {new Date(selectedCamp.endDate).toLocaleDateString("he-IL")}
              </Typography>
              <Typography className="dialog-camp-detail">
                <strong>מיקום:</strong> {selectedCamp.location}
              </Typography>
              <Typography className="dialog-question">
                האם אתה בטוח שברצונך להירשם לקייטנה זו?
              </Typography>
              <Typography className="dialog-note">
                לאחר האישור נשלח אליך מייל עם כל הפרטים הנדרשים.
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog} variant="outlined" className="dialog-button-cancel">
            ביטול
          </Button>
          <Button
            onClick={handleConfirmRegister}
            variant="contained"
            disabled={isRegistering}
            className="dialog-button-confirm"
          >
            {isRegistering ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "אישור הרשמה"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserCampsList;
