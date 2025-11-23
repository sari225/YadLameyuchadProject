import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Info as InfoIcon,
  Send as SendIcon,
  AccessTime as AccessTimeIcon,
  GroupWork as GroupWorkIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { 
  useGetClubsQuery, 
  useRequestJoinClubMutation 
} from "../../../api/clubApi";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { parseServerError } from "../../../utils/errorHandler";
import ClubDetailsDialog from "./ClubDetailsDialog";
import { useTemporaryMessages, useDialog } from "./useClubsHooks";
import "./styles/userClubsListStyles.css";

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
  
  const { successMessage, errorMessage, showSuccess, showError } = useTemporaryMessages();
  const { selectedItem: selectedClub, openDialog, handleOpenDialog, handleCloseDialog } = useDialog();
  const [searchQuery, setSearchQuery] = useState("");

  // סינון ומיון מועדוניות לפי שם
  const clubs = [...allClubs]
    .filter(club => 
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'he'));

  // פונקציה לבדוק את סטטוס הילד במועדונית
  const getChildStatus = useCallback((club) => {
    if (!currentUser?.id || !club) return 'not_registered';
    
    const userId = currentUser.id;
    const checkUserInList = (list) => list?.some(child => {
      const childId = typeof child === 'object' ? child._id : child;
      return childId === userId;
    });
    
    if (checkUserInList(club.registeredChildren)) return 'registered';
    if (checkUserInList(club.waitingChildren)) return 'waiting';
    if (checkUserInList(club.refusedChildren)) return 'refused';
    
    return 'not_registered';
  }, [currentUser?.id]);

  // פונקציה לקבלת צ'יפ סטטוס
  const getStatusChip = (status) => {
    switch (status) {
      case 'registered':
        return (
          <Chip
            label="רשום"
            variant="outlined"
            className="club-status-chip"
          />
        );
      case 'waiting':
        return (
          <Chip
            label="ממתין לאישור"
            variant="outlined"
            className="club-status-chip"
          />
        );
      case 'refused':
        return (
          <Chip
            label="נדחה"
            variant="outlined"
            className="club-status-chip"
          />
        );
      default:
        return null;
    }
  };



  // שליחת בקשה להצטרפות
  const handleRequestJoin = useCallback(async (clubId) => {
    if (!currentUser?.id) {
      showError("לא נמצא משתמש מחובר");
      return;
    }

    try {
      await requestJoinClub({
        clubId,
        childId: currentUser.id
      }).unwrap();
      
      showSuccess("הבקשה נשלחה בהצלחה! המתן לאישור מנהל המערכת");
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to request join:", error);
      const errorMessage = parseServerError(error, "שגיאה בשליחת הבקשה");
      showError(errorMessage);
    }
  }, [currentUser?.id, requestJoinClub, handleCloseDialog, showSuccess, showError]);

  if (isLoading) {
    return (
      <Box className="clubs-main-container">
        <Box className="loading-container">
          <CircularProgress size={60} sx={{ color: "#8A4CA3" }} />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="clubs-main-container">
        <Alert severity="error" className="clubs-alert">
          {parseServerError(error, "שגיאה בטעינת המועדוניות")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="clubs-main-container" dir="rtl">
      <Typography variant="h3" className="clubs-page-title">
        המועדוניות שלנו
      </Typography>

      <div className="clubs-description-container">
        <Typography variant="h6" className="clubs-description">
          כאן תוכל לראות את כל המועדוניות הזמינות שלנו ולהצטרף אליהן.
        </Typography>
      </div>

      {/* תיבת חיפוש */}
      <Box className="search-container">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="חפש מועדונית לפי שם..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-field"
          InputProps={{
            startAdornment: <SearchIcon className="search-icon" />
          }}
        />
      </Box>

      {successMessage && (
        <Alert severity="success" className="clubs-alert">
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" className="clubs-alert">
          {errorMessage}
        </Alert>
      )}

      {clubs.length === 0 ? (
        <Box className="no-clubs-message">
          <GroupWorkIcon className="no-clubs-icon-simple" />
          <Typography className="no-clubs-title-simple">
            {searchQuery ? "לא נמצאו מועדוניות מתאימות" : "אין מועדוניות זמינות כרגע"}
          </Typography>
          <Typography className="no-clubs-subtitle-simple">
            {searchQuery ? "נסה לחפש עם מילים אחרות או נקה את החיפוש" : "נעדכן כאן ברגע שיפתחו מועדוניות חדשות"}
          </Typography>
        </Box>
      ) : (
        <Box className="clubs-grid">
          {clubs.map((club) => {
            const status = getChildStatus(club);
            
            return (
              <Card 
                key={club._id} 
                className="club-card"
              >
                <CardContent className="club-card-content">
                  {/* כותרת ומועדונית */}
                  <Box>
                    <Typography className="club-name">
                      {club.name}
                    </Typography>
                    <Box className="status-chip-container">
                      {getStatusChip(status)}
                    </Box>
                  </Box>

                  <Divider className="club-divider" />

                  {/* פרטים */}
                  <Box sx={{ mb: 3 }}>
                    <Box className="club-detail-row">
                      <LocationIcon className="club-detail-icon" />
                      <Typography className="club-detail-text">
                        <strong>מיקום:</strong> {club.location || "לא צוין"}
                      </Typography>
                    </Box>

                    <Box className="club-detail-row">
                      <GroupIcon className="club-detail-icon" />
                      <Typography className="club-detail-text">
                        <strong>יום פעילות:</strong> {club.activityDay || "לא צוין"}
                      </Typography>
                    </Box>

                    <Box className="club-detail-row">
                      <AccessTimeIcon className="club-detail-icon" />
                      <Typography className="club-detail-text">
                        <strong>שעות:</strong> {club.startTime} - {club.endTime}
                      </Typography>
                    </Box>
                  </Box>

                  {/* כפתורים */}
                  <Box className="club-actions">
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<InfoIcon />}
                      onClick={() => handleOpenDialog(club)}
                      className="details-button"
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
                        className="join-button"
                      >
                        {isRequesting ? "שולח..." : "שלח בקשת הצטרפות"}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* דיאלוג פרטי מועדונית */}
      <ClubDetailsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        club={selectedClub}
        userStatus={selectedClub ? getChildStatus(selectedClub) : 'not_registered'}
        onRequestJoin={handleRequestJoin}
        isRequesting={isRequesting}
      />
    </Box>
  );
};

export default UserClubsList;
