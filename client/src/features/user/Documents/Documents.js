import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  TextField,
} from "@mui/material";
import {
  Download as DownloadIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useGetAllDocumentsQuery } from "../../../api/documentApi";
import "./documentsStyles.css";

const Documents = () => {
  const { data: allDocuments = [], isLoading, isError } = useGetAllDocumentsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  // סינון מסמכים לפי שם
  const documents = allDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (url) => {
    if (!url) return <DescriptionIcon className="document-type-icon" />;
    const ext = url.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return <PdfIcon className="document-type-icon pdf-icon" />;
    } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageIcon className="document-type-icon image-icon" />;
    }
    return <DescriptionIcon className="document-type-icon" />;
  };

  const normalizePath = (path) => {
    if (!path) return "";
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
    <Box className="documents-main-container" dir="rtl">
      <Typography variant="h3" className="documents-page-title">
        מסמכים להורדה
      </Typography>

      <div className="documents-description-container">
        <Typography variant="h6" className="documents-description">
          כאן תוכלו למצוא את כל המסמכים והטפסים הרלוונטיים להורדה
        </Typography>
      </div>

      {/* תיבת חיפוש */}
      <Box className="search-container">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="חפש מסמך לפי שם..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-field"
          InputProps={{
            startAdornment: <SearchIcon className="search-icon" />
          }}
        />
      </Box>

      {isLoading ? (
        <Box className="documents-loading-container">
          <CircularProgress size={60} className="documents-loading" />
        </Box>
      ) : isError ? (
        <Alert severity="error" className="documents-alert">
          שגיאה בטעינת המסמכים
        </Alert>
      ) : documents.length === 0 ? (
        <Box className="no-documents-message-simple">
          <FolderOpenIcon className="no-documents-icon-simple" />
          <Typography className="no-documents-title-simple">
            {searchQuery ? "לא נמצאו מסמכים מתאימים" : "אין מסמכים זמינים כרגע"}
          </Typography>
        </Box>
      ) : (
        <Box className="documents-grid">
          {documents.map((doc) => (
            <Card key={doc._id} className="document-card">
              <Box className="document-card-content">
                <Box className="document-icon-container">
                  {getFileIcon(doc.url)}
                </Box>
                <Typography className="document-name">
                  {doc.name}
                </Typography>
                
                <Box className="document-actions">
                  <Button
                    variant="contained"
                    className="download-button"
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
                    <DownloadIcon />
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Documents;
