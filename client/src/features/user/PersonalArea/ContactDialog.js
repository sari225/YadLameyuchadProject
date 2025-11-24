import React, { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Box,
  Typography,
  Alert
} from "@mui/material";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useCreateMessageMutation } from "../../../api/messageApi";
import "./styles/contactDialogStyles.css";

const ContactDialog = ({ open, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [createMessage, { isLoading }] = useCreateMessageMutation();
  
  // חילוץ נתונים מהטוקן
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);
  
  const [formData, setFormData] = useState({
    topic: "",
    content: ""
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const topics = [
    "שאלה",
    "תלונה", 
    "בקשה"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.topic || !formData.content) {
      setMessage("אנא מלא את כל השדות הנדרשים");
      setMessageType("error");
      return;
    }

    try {
      // שליחת הנתונים כולל שם ומייל מהטוקן
      const messageData = {
        senderName: decoded.name ,
        senderEmail: decoded.email ,
        topic: formData.topic,
        content: formData.content
      };

      await createMessage(messageData).unwrap();
      
      setMessage("ההודעה נשלחה בהצלחה!");
      setMessageType("success");
      setFormData({ topic: "", content: "" });
      
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
      
    } catch (error) {
      setMessage("שגיאה בשליחת ההודעה. אנא נסה שנית.");
      setMessageType("error");
    }
  };

  const handleClose = () => {
    setFormData({ topic: "", content: "" });
    setMessage("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "contact-dialog-paper"
      }}
    >
      <DialogTitle className="contact-dialog-title">
        יצירת קשר
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {message && (
            <Alert 
              severity={messageType} 
              className="contact-alert"
            >
              {message}
            </Alert>
          )}
          
          <Box className="contact-content-box">
            <TextField
              select
              name="topic"
              label="נושא *"
              value={formData.topic}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="contact-text-field"
            >
              {topics.map((topic) => (
                <MenuItem key={topic} value={topic}>
                  {topic}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="content"
              label="תוכן הפנייה *"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              className="contact-text-field"
            />
            
            <Typography 
              variant="caption" 
              className="contact-info-text"
            >
              השם והמייל יישלחו אוטומטית מהנתונים שלך
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions className="contact-actions">
          <Button 
            onClick={handleClose}
            className="contact-cancel-button"
          >
            ביטול
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="contact-submit-button"
          >
            {isLoading ? "שולח..." : "שלח הודעה"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactDialog;