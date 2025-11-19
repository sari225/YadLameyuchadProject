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
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplyIcon from "@mui/icons-material/Reply";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import {
  useGetAllMessagesQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
  useReplyToMessageMutation,
} from "../../../api/messageApi";

export default function ContactMessages() {
  const { data: messages = [], isLoading, refetch } = useGetAllMessagesQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [replyToMessage] = useReplyToMessageMutation();

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
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
      setSnackbar({
        open: true,
        message: error?.data?.message || "שגיאה בשליחת התשובה",
        severity: "error",
      });
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק הודעה זו?")) {
      try {
        await deleteMessage(id).unwrap();
        setSnackbar({
          open: true,
          message: "ההודעה נמחקה בהצלחה",
          severity: "success",
        });
        refetch();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error?.data?.message || "שגיאה במחיקת ההודעה",
          severity: "error",
        });
      }
    }
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography>טוען הודעות...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, direction: "rtl" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        הודעות יצירת קשר
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                סטטוס
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                שם השולח
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                אימייל
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                נושא
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                תאריך
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  אין הודעות
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message._id}
                  sx={{
                    bgcolor: message.readen ? "inherit" : "#e3f2fd",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <TableCell align="right">
                    <Chip
                      label={message.readen ? "נקרא" : "חדש"}
                      color={message.readen ? "default" : "primary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{message.senderName}</TableCell>
                  <TableCell align="right">{message.senderEmail}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={message.topic}
                      color={getTopicColor(message.topic)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatDate(message.createdAt)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="צפה בהודעה">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewMessage(message)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="השב להודעה">
                      <IconButton
                        color="success"
                        onClick={() => handleOpenReplyDialog(message)}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={message.readen ? "סמן כלא נקרא" : "סמן כנקרא"}>
                      <IconButton
                        color="info"
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
                        color="error"
                        onClick={() => handleDeleteMessage(message._id)}
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
      >
        <DialogTitle>פרטי ההודעה</DialogTitle>
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
      >
        <DialogTitle>תשובה להודעה</DialogTitle>
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
    </Container>
  );
}
