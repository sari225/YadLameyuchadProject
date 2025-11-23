import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import "./styles/clubDetailsDialogStyles.css";

const ClubDetailsDialog = ({ 
  open, 
  onClose, 
  club, 
  userStatus, 
  onRequestJoin, 
  isRequesting 
}) => {
  if (!club) return null;

  // פונקציה לקבלת צ'יפ סטטוס
  const getStatusChip = (status) => {
    switch (status) {
      case 'registered':
        return (
          <Chip
            label="רשום"
            variant="outlined"
            className="status-chip-registered"
          />
        );
      case 'waiting':
        return (
          <Chip
            label="ממתין לאישור"
            variant="outlined"
            className="status-chip-waiting"
          />
        );
      case 'refused':
        return (
          <Chip
            label="נדחה"
            variant="outlined"
            className="status-chip-refused"
          />
        );
      default:
        return (
          <Chip
            label="לא רשום"
            variant="outlined"
            className="status-chip-not-registered"
          />
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      dir="rtl"
      className="club-details-dialog"
    >
      <DialogTitle className="dialog-title">
        <Typography variant="h5" className="dialog-title-text">
          {club.name}
        </Typography>
        <IconButton onClick={onClose} className="dialog-close-button">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="dialog-content">
        <Box>
          {/* סטטוס ההרשמה */}
          <Box className="status-section">
            <Typography variant="subtitle1" className="status-section-title">
              סטטוס ההרשמה:
            </Typography>
            {getStatusChip(userStatus)}
          </Box>

          <Divider className="dialog-divider" />

          {/* פרטי המועדונית */}
          <Box className="details-section">
            <Typography variant="subtitle1" className="section-title">
              פרטי המועדונית:
            </Typography>
            
            <Box className="details-grid">
              <Box className="detail-row">
                <LocationIcon className="detail-icon" />
                <Typography className="detail-text">
                  <strong>מיקום:</strong> {club.location || "לא צוין"}
                </Typography>
              </Box>
              
              <Box className="detail-row">
                <GroupIcon className="detail-icon" />
                <Typography className="detail-text">
                  <strong>יום פעילות:</strong> {club.activityDay || "לא צוין"}
                </Typography>
              </Box>
              
              <Box className="detail-row">
                <AccessTimeIcon className="detail-icon" />
                <Typography className="detail-text">
                  <strong>שעות פעילות:</strong> {club.startTime} - {club.endTime}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* מנהלי המועדונית */}
          {club.clubManagers && club.clubManagers.length > 0 && (
            <Box className="managers-section">
              <Typography variant="subtitle1" className="section-title">
                מנהלי המועדונית:
              </Typography>
              {club.clubManagers.map((manager, index) => (
                <Box key={index} className="manager-card">
                  <Box className="manager-name-row">
                    <PersonIcon className="manager-name-icon" />
                    <Typography className="manager-name-text">
                      {manager.name}
                    </Typography>
                  </Box>
                  
                  <Box className="manager-phone-row">
                    <PhoneIcon className="manager-phone-icon" />
                    <Typography className="manager-phone-text">
                      {manager.phone}
                    </Typography>
                  </Box>
                  
                  {manager.email && (
                    <Box className="manager-email-row">
                      <EmailIcon className="manager-email-icon" />
                      <Typography className="manager-email-text">
                        {manager.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="dialog-actions">
        <Button onClick={onClose} className="dialog-close-btn">
          סגור
        </Button>
        
        {userStatus === 'not_registered' && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => onRequestJoin(club._id)}
            disabled={isRequesting}
            className="dialog-join-btn"
          >
            {isRequesting ? "שולח..." : "שלח בקשת הצטרפות"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClubDetailsDialog;