import React from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useGetAllDocumentsQuery } from "../../../api/documentApi";

const Documents = () => {
  const { data: documents = [], isLoading, isError } = useGetAllDocumentsQuery();

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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e3f2fd 0%, #fff 100%)",
        p: 4,
        direction: "rtl",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #d486b8 0%, #a57bad 100%)",
          color: "white",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          מסמכים להורדה
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.95 }}>
          כאן תוכלו למצוא את כל המסמכים והטפסים הרלוונטיים
        </Typography>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress sx={{ color: "#d486b8" }} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת המסמכים
        </Alert>
      ) : documents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">אין מסמכים זמינים כרגע</Typography>
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
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Documents;
