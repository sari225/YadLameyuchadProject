import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useGetAllDocumentsQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
} from "../../../api/documentApi";
import "./styles/DocumentsManagement.css";

const DocumentsManagement = () => {
  const { data: documents = [], isLoading, refetch } = useGetAllDocumentsQuery();
  const [createDocument, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // בדיקת סוג הקובץ - רק תמונות ו-PDF
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("ניתן להעלות רק תמונות או קבצי PDF");
        e.target.value = "";
        return;
      }
      // בדיקת גודל - עד 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError("גודל הקובץ חייב להיות עד 10MB");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleAddDocument = async () => {
    if (!documentName.trim()) {
      setError("יש להזין שם למסמך");
      return;
    }
    if (!selectedFile) {
      setError("יש לבחור קובץ");
      return;
    }

    const formData = new FormData();
    formData.append("name", documentName.trim());
    formData.append("document", selectedFile);

    try {
      await createDocument(formData).unwrap();
      setSuccess("המסמך הועלה בהצלחה");
      setAddDialogOpen(false);
      setDocumentName("");
      setSelectedFile(null);
      setError("");
      refetch();
    } catch (err) {
      setError(err?.data?.message || "שגיאה בהעלאת המסמך");
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return;
    try {
      await deleteDocument(selectedDoc._id).unwrap();
      setSuccess("המסמך נמחק בהצלחה");
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
      refetch();
    } catch (err) {
      setError(err?.data?.message || "שגיאה במחיקת המסמך");
    }
  };

  const getFileIcon = (url) => {
    if (!url) return <DescriptionIcon className="documents-management-icon-default" />;
    const ext = url.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return <PdfIcon className="documents-management-icon-pdf" />;
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageIcon className="documents-management-icon-image" />;
    }
    return <DescriptionIcon className="documents-management-icon-default" />;
  };

  const normalizePath = (path) => {
    if (!path) return "";
    // הסרת נתיבים מוחלטים של Windows
    let normalized = path.replace(/^[A-Z]:\\.*?\\public\\/i, "");
    normalized = normalized.replace(/^public[\\/]/, "");
    normalized = normalized.replace(/\\/g, "/");
    return normalized;
  };

  const getPreviewUrl = (url) => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const normalized = normalizePath(url);
    return `${apiUrl}/${normalized}`;
  };

  return (
    <Box className="documents-management-container">
      <Typography variant="h4" className="documents-management-header-title">
        ניהול מסמכים
      </Typography>

      <Box className="documents-management-button-container">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          className="documents-management-add-button"
        >
          הוספת מסמך
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {isLoading ? (
        <Box className="documents-management-loading">
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Paper className="documents-management-empty">
          <Typography className="documents-management-empty-text">אין מסמכים במערכת</Typography>
          <Typography className="documents-management-empty-subtitle">התחל בהוספת מסמך חדש</Typography>
        </Paper>
      ) : (
        <Box className="documents-management-grid">
          {documents.map((doc) => (
            <Card
              key={doc._id}
              className="documents-management-card"
              onClick={() => window.open(getPreviewUrl(doc.url), "_blank")}
            >
              <Box className="documents-management-icon-container">
                {getFileIcon(doc.url)}
              </Box>
              <Typography className="documents-management-doc-name">
                {doc.name}
              </Typography>
              {doc.createdAt && (
                <Typography className="documents-management-doc-date">
                  {new Date(doc.createdAt).toLocaleDateString("he-IL")}
                </Typography>
              )}
              <Box className="documents-management-actions">
                <Tooltip title="הורדה" arrow>
                  <IconButton
                    className="documents-management-download-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // יצירת fetch להורדה ישירה
                      fetch(getPreviewUrl(doc.url))
                        .then(response => response.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = doc.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(error => {
                          console.error('שגיאה בהורדת הקובץ:', error);
                          // fallback - נסיון רגיל
                          const link = document.createElement('a');
                          link.href = getPreviewUrl(doc.url);
                          link.download = doc.name;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        });
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="מחיקה" arrow>
                  <IconButton
                    className="documents-management-delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* דיאלוג הוספת מסמך */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
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
            הוספת מסמך חדש
          </Typography>
          <IconButton onClick={() => setAddDialogOpen(false)} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="שם המסמך"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="לדוגמה: טופס הרשמה"
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2, py: 1.5 }}
            >
              {selectedFile ? selectedFile.name : "בחר קובץ (תמונה או PDF)"}
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
              גודל מקסימלי: 10MB | סוגי קבצים: תמונות, PDF
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setDocumentName("");
            setSelectedFile(null);
            setError("");
          }}>
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDocument}
            disabled={isCreating}
            sx={{
              bgcolor: "#d486b8",
              "&:hover": { bgcolor: "#a57bad" },
            }}
          >
            {isCreating ? <CircularProgress size={20} /> : "העלאה"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג מחיקת מסמך */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)} 
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
          <IconButton onClick={() => setDeleteDialogOpen(false)} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>
            האם אתה בטוח שברצונך למחוק את המסמך <strong>"{selectedDoc?.name}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setSelectedDoc(null);
          }}>
            ביטול
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteDocument}
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsManagement;
