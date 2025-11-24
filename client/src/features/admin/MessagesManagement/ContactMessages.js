import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplyIcon from "@mui/icons-material/Reply";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import './styles/ContactMessages.css';
import {
  useGetAllMessagesQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
  useReplyToMessageMutation,
} from "../../../api/messageApi";
import { parseServerError } from "../../../utils/errorHandler";

export default function ContactMessages() {
  const { data: messages = [], isLoading, refetch } = useGetAllMessagesQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [replyToMessage] = useReplyToMessageMutation();

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
    
    // סימון כנקרא
    if (!message.readen) {
      try {
        await markAsRead(message._id).unwrap();
        refetch();
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedMessage(null);
  };

  const handleOpenReplyDialog = (message) => {
    setSelectedMessage(message);
    setReplyContent("");
    setReplyDialogOpen(true);
  };

  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setSelectedMessage(null);
    setReplyContent("");
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      setSnackbar({
        open: true,
        message: "תוכן התשובה לא יכול להיות ריק",
        severity: "error",
      });
      return;
    }

    try {
      await replyToMessage({
        messageId: selectedMessage._id,
        recipientEmail: selectedMessage.senderEmail,
        replyContent: replyContent,
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: "התשובה נשלחה בהצלחה",
        severity: "success",
      });
      handleCloseReplyDialog();
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה בשליחת התשובה");
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage(messageToDelete._id).unwrap();
      setSnackbar({
        open: true,
        message: "ההודעה נמחקה בהצלחה",
        severity: "success",
      });
      refetch();
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה במחיקת ההודעה");
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getTopicColor = (topic) => {
    switch (topic) {
      case "שאלה":
        return "info";
      case "תלונה":
        return "error";
      case "בקשה":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Box className="messages-management-loading">
        <Typography>טוען הודעות...</Typography>
      </Box>
    );
  }

  return (
    <div className="messages-management-container">
      <Typography className="messages-management-header-title">
        הודעות יצירת קשר
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead className="messages-management-table-header">
            <TableRow>
              <TableCell className="messages-management-table-header-cell">
                סטטוס
              </TableCell>
              <TableCell className="messages-management-table-header-cell">
                שם השולח
              </TableCell>
              <TableCell className="messages-management-table-header-cell">
                אימייל
              </TableCell>
              <TableCell className="messages-management-table-header-cell">
                נושא
              </TableCell>
              <TableCell className="messages-management-table-header-cell">
                תאריך
              </TableCell>
              <TableCell className="messages-management-table-header-cell">
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box className="messages-management-empty">
                    <Typography className="messages-management-empty-text">
                      אין הודעות להצגה
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message._id}
                  className={message.readen ? "messages-management-row-read" : "messages-management-row-unread"}
                  hover
                >
                  <TableCell className="messages-management-table-body-cell">
                    <Chip
                      label={message.readen ? "נקרא" : "חדש"}
                      color={message.readen ? "default" : "primary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="messages-management-table-body-cell">{message.senderName}</TableCell>
                  <TableCell className="messages-management-table-body-cell">{message.senderEmail}</TableCell>
                  <TableCell className="messages-management-table-body-cell">
                    <Chip
                      label={message.topic}
                      color={getTopicColor(message.topic)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="messages-management-table-body-cell">
                    {formatDate(message.createdAt)}
                  </TableCell>
                  <TableCell className="messages-management-table-body-cell">
                    <Tooltip title="צפה בהודעה">
                      <IconButton
                        className="messages-management-icon-button-view"
                        onClick={() => handleViewMessage(message)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="השב להודעה">
                      <IconButton
                        className="messages-management-icon-button-reply"
                        onClick={() => handleOpenReplyDialog(message)}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={message.readen ? "סמן כלא נקרא" : "סמן כנקרא"}>
                      <IconButton
                        className="messages-management-icon-button-mark"
                        onClick={async () => {
                          await markAsRead(message._id);
                          refetch();
                        }}
                      >
                        {message.readen ? (
                          <MarkEmailReadIcon />
                        ) : (
                          <MarkEmailUnreadIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק הודעה">
                      <IconButton
                        className="messages-management-icon-button-delete"
                        onClick={() => handleDeleteClick(message)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* דיאלוג צפייה בהודעה */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
        dir="rtl"
        PaperProps={{
          className: "admin-management-container",
          sx: {
            borderRadius: '20px',
            '@media (max-width: 768px)': {
              width: '95%',
              maxWidth: '450px',
              margin: '16px',
              borderRadius: '20px'
            }
          }
        }}
      >
        <DialogTitle className="dialog-title">
          <Typography variant="h5" className="dialog-title-text">
            פרטי ההודעה
          </Typography>
          <IconButton onClick={handleCloseViewDialog} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMessage && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                שם השולח
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMessage.senderName}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                אימייל
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMessage.senderEmail}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                נושא
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <Chip
                  label={selectedMessage.topic}
                  color={getTopicColor(selectedMessage.topic)}
                  size="small"
                />
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                תוכן ההודעה
              </Typography>
              <Paper
                elevation={0}
                sx={{ p: 2, bgcolor: "#f5f5f5", mt: 1, whiteSpace: "pre-wrap" }}
              >
                <Typography variant="body1">{selectedMessage.content}</Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                נשלח בתאריך: {formatDate(selectedMessage.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>סגור</Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג תשובה להודעה */}
      <Dialog
        open={replyDialogOpen}
        onClose={handleCloseReplyDialog}
        maxWidth="sm"
        fullWidth
        dir="rtl"
        PaperProps={{
          className: "admin-management-container",
          sx: {
            borderRadius: '20px',
            '@media (max-width: 768px)': {
              width: '95%',
              maxWidth: '450px',
              margin: '16px',
              borderRadius: '20px'
            }
          }
        }}
      >
        <DialogTitle className="dialog-title">
          <Typography variant="h5" className="dialog-title-text">
            תשובה להודעה
          </Typography>
          <IconButton onClick={handleCloseReplyDialog} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMessage && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                תשובה ל: {selectedMessage.senderName} ({selectedMessage.senderEmail})
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="תוכן התשובה"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="כתוב את תשובתך כאן..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog}>ביטול</Button>
          <Button onClick={handleSendReply} variant="contained">
            שלח תשובה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        dir="rtl"
        PaperProps={{
          className: "admin-management-container",
          sx: {
            borderRadius: '20px',
            '@media (max-width: 768px)': {
              width: '95%',
              maxWidth: '450px',
              margin: '16px',
              borderRadius: '20px'
            }
          }
        }}
      >
        <DialogTitle className="dialog-title">
          <Typography variant="h5" className="dialog-title-text">
            אישור מחיקה
          </Typography>
          <IconButton onClick={handleDeleteCancel} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>
            האם אתה בטוח שברצונך למחוק את ההודעה מ<strong>"{messageToDelete?.senderName}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleDeleteCancel}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
