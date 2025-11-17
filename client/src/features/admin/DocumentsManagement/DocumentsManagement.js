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
} from "@mui/icons-material";
import {
  useGetAllDocumentsQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
} from "../../../api/documentApi";

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
    if (!url) return <DescriptionIcon sx={{ fontSize: 60, color: "#9e9e9e" }} />;
    const ext = url.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return <PdfIcon sx={{ fontSize: 60, color: "#d32f2f" }} />;
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageIcon sx={{ fontSize: 60, color: "#4caf50" }} />;
    }
    return <DescriptionIcon sx={{ fontSize: 60, color: "#9e9e9e" }} />;
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
    <Box sx={{ p: 3, direction: "rtl" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", flex: 1 }}>
          ניהול מסמכים
        </Typography>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              bgcolor: "#d486b8",
              "&:hover": { bgcolor: "#a57bad" },
              fontWeight: "bold",
            }}
          >
            הוספת מסמך
          </Button>
        </Box>
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
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">אין מסמכים במערכת</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 2.5,
            width: "100%",
            alignItems: "start",
          }}
        >
          {documents.map((doc) => (
            <Card
              key={doc._id}
              sx={{
                display: "flex",
                flexDirection: "column",
                p: 1.5,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                minHeight: "180px",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
              onClick={() => window.open(getPreviewUrl(doc.url), "_blank")}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  color: "#a57bad",
                  "& svg": { fontSize: 40 },
                }}
              >
                {getFileIcon(doc.url)}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  mb: 1,
                  wordBreak: "break-word",
                  fontSize: "0.875rem",
                  lineHeight: 1.8,
                  maxHeight: "3.6em",
                  overflow: "hidden",
                }}
              >
                {doc.name}
              </Typography>
              {doc.createdAt && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ 
                    textAlign: "center", 
                    mb: 1.5, 
                    fontSize: "0.7rem",
                    display: "block",
                  }}
                >
                  {new Date(doc.createdAt).toLocaleDateString("he-IL")}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                  mt: "auto",
                  pt: 1,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Tooltip title="הורדה" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#d486b8",
                      p: 0.5,
                      "&:hover": { bgcolor: "rgba(212, 134, 184, 0.1)" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement("a");
                      link.href = getPreviewUrl(doc.url);
                      link.download = doc.name;
                      link.click();
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="מחיקה" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#f44336",
                      p: 0.5,
                      "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" },
                    }}
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
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          הוספת מסמך חדש
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} dir="rtl">
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          אישור מחיקה
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: "center" }}>
            האם אתה בטוח שברצונך למחוק את המסמך "{selectedDoc?.name}"?
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
