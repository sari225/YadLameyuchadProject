import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Info as InfoIcon,
  Send as SendIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { 
  useGetClubsQuery, 
  useRequestJoinClubMutation 
} from "../../../api/clubApi";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { parseServerError } from "../../../utils/errorHandler";

const UserClubsList = () => {
  const { data: allClubs = [], isLoading, isError, error, refetch } = useGetClubsQuery();
  const [requestJoinClub, { isLoading: isRequesting }] = useRequestJoinClubMutation();
  
  const token = useSelector((state) => state.auth.token);
  const currentUser = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, [token]);
  
  const [selectedClub, setSelectedClub] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // רענן נתונים כשהקומפוננט נטען
  useEffect(() => {
    refetch();
  }, [refetch]);

  // מיון מועדוניות לפי שם
  const clubs = [...allClubs].sort((a, b) => a.name.localeCompare(b.name, 'he'));

  // פונקציה לבדוק את סטטוס הילד במועדונית
  const getChildStatus = (club) => {
    if (!currentUser?.id || !club) {
      return 'not_registered';
    }
    
    // בדוק אם רשום
    if (club.registeredChildren && club.registeredChildren.some(child => {
      const childId = typeof child === 'object' ? child._id : child;
      return childId === currentUser.id;
    })) {
      return 'registered';
    }
    
    // בדוק אם ברשימת המתנה
    if (club.waitingChildren && club.waitingChildren.some(child => {
      const childId = typeof child === 'object' ? child._id : child;
      return childId === currentUser.id;
    })) {
      return 'waiting';
    }
    
    // בדוק אם נדחה
    if (club.refusedChildren && club.refusedChildren.some(child => {
      const childId = typeof child === 'object' ? child._id : child;
      return childId === currentUser.id;
    })) {
      return 'refused';
    }
    
    return 'not_registered';
  };

  // פונקציה לקבלת צ'יפ סטטוס
  const getStatusChip = (status) => {
    switch (status) {
      case 'registered':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="רשום"
            color="success"
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
        );
      case 'waiting':
        return (
          <Chip
            icon={<HourglassEmptyIcon />}
            label="ממתין לאישור"
            color="warning"
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
        );
      case 'refused':
        return (
          <Chip
            icon={<CancelIcon />}
            label="נדחה"
            color="error"
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
        );
      default:
        return null;
    }
  };

  // פתיחת דיאלוג פרטי מועדונית
  const handleOpenDialog = (club) => {
    setSelectedClub(club);
    setOpenDialog(true);
  };

  // סגירת דיאלוג
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClub(null);
  };

  // שליחת בקשה להצטרפות
  const handleRequestJoin = async (clubId) => {
    if (!currentUser?.id) {
      setErrorMessage("לא נמצא משתמש מחובר");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      await requestJoinClub({
        clubId,
        childId: currentUser.id
      }).unwrap();
      
      setSuccessMessage("הבקשה נשלחה בהצלחה! המתן לאישור מנהל המערכת");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error("Failed to request join:", error);
      const errorMessage = parseServerError(error, "שגיאה בשליחת הבקשה");
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {parseServerError(error, "שגיאה בטעינת המועדוניות")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, direction: "rtl" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        המועדוניות שלנו
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

      {clubs.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: "center" }}>
          אין מועדוניות זמינות כרגע
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {clubs.map((club) => {
            const status = getChildStatus(club);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={club._id} sx={{ display: "flex", minWidth: 0 }}>
                <Card 
                  sx={{ 
                    width: "100%",
                    height: "450px",
                    display: "flex", 
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3, height: "100%" }}>
                    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ 
                            fontWeight: "bold", 
                            color: "#1976d2", 
                            mb: 1.5,
                            height: "60px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {club.name}
                        </Typography>
                        {getStatusChip(status)}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ flexGrow: 1, minHeight: "140px", maxHeight: "140px", overflow: "hidden" }}>
                        {club.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {club.description}
                          </Typography>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <LocationIcon sx={{ mr: 1, color: "#1976d2", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <strong>מיקום:</strong> {club.location || "לא צוין"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <GroupIcon sx={{ mr: 1, color: "#1976d2", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <strong>יום פעילות:</strong> {club.activityDay || "לא צוין"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <AccessTimeIcon sx={{ mr: 1, color: "#1976d2", fontSize: 20 }} />
                          <Typography variant="body2">
                            <strong>שעות:</strong> {club.startTime} - {club.endTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5, flexDirection: "column" }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<InfoIcon />}
                        onClick={() => handleOpenDialog(club)}
                        sx={{
                          borderWidth: 2,
                          borderColor: "#1976d2",
                          color: "#1976d2",
                          fontWeight: "bold",
                          py: 1.3,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "1rem",
                          "&:hover": {
                            borderWidth: 2,
                            borderColor: "#1565c0",
                            backgroundColor: "#e3f2fd",
                            transform: "scale(1.02)",
                          },
                          transition: "all 0.2s"
                        }}
                      >
                        פרטים נוספים
                      </Button>
                      
                      {status === 'not_registered' && (
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<SendIcon />}
                          onClick={() => handleRequestJoin(club._id)}
                          disabled={isRequesting}
                          sx={{ 
                            backgroundColor: "#4caf50",
                            color: "white",
                            fontWeight: "bold",
                            py: 1.3,
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: "1rem",
                            boxShadow: 2,
                            "&:hover": { 
                              backgroundColor: "#45a049",
                              boxShadow: 4,
                              transform: "scale(1.02)",
                            },
                            "&:disabled": {
                              backgroundColor: "#cccccc"
                            },
                            transition: "all 0.2s"
                          }}
                        >
                          {isRequesting ? "שולח..." : "שלח בקשת הצטרפות"}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* דיאלוג פרטי מועדונית */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        dir="rtl"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {selectedClub?.name}
          </Typography>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedClub && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  סטטוס ההרשמה:
                </Typography>
                {getStatusChip(getChildStatus(selectedClub))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {selectedClub.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    תיאור:
                  </Typography>
                  <Typography variant="body1">
                    {selectedClub.description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  מיקום:
                </Typography>
                <Typography variant="body1">
                  {selectedClub.location || "לא צוין"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  יום פעילות:
                </Typography>
                <Typography variant="body1">
                  {selectedClub.activityDay || "לא צוין"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  שעות פעילות:
                </Typography>
                <Typography variant="body1">
                  {selectedClub.startTime} - {selectedClub.endTime}
                </Typography>
              </Box>

              {selectedClub.clubManagers && selectedClub.clubManagers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    מנהלי המועדונית:
                  </Typography>
                  {selectedClub.clubManagers.map((manager, index) => (
                    <Box key={index} sx={{ mb: 1, pl: 2 }}>
                      <Typography variant="body1">
                        <strong>שם:</strong> {manager.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>טלפון:</strong> {manager.phone}
                      </Typography>
                      {manager.email && (
                        <Typography variant="body2">
                          <strong>אימייל:</strong> {manager.email}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>
            סגור
          </Button>
          {selectedClub && getChildStatus(selectedClub) === 'not_registered' && (
            <Button
              variant="contained"
              onClick={() => handleRequestJoin(selectedClub._id)}
              disabled={isRequesting}
              sx={{ 
                backgroundColor: "#03a9f4", 
                "&:hover": { backgroundColor: "#0288d1" } 
              }}
            >
              {isRequesting ? "שולח..." : "שלח בקשת הצטרפות"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserClubsList;
