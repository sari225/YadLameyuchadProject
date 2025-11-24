import React, { useEffect } from "react";
import { Box, Typography, Paper, IconButton, CircularProgress, Alert, Button } from "@mui/material";
import { GetApp as DownloadIcon, AttachFile as AttachFileIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { useGetUpdatingsQuery } from "../../../api/updateApi";
import { useNavigate } from "react-router-dom";
import "./allUpdatesStyles.css";

const AllUpdates = () => {
  const navigate = useNavigate();
  const { data: updates = [], isLoading, isError } = useGetUpdatingsQuery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const normalizePath = (p) => {
    if (!p) return "";
    const posix = p.replace(/\\/g, "/");
    return posix.includes("/public/") ? posix.substring(posix.indexOf("/public/") + 8) : posix;
  };

  const getFileURL = (path) => {
    const base = process.env.REACT_APP_API_URL;
    return `${base}/${normalizePath(path)}`;
  };

  const visibleUpdates = updates
    .filter((u) => u.updateLocation === "site" || u.updateLocation === "site_and_email")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleDownloadFile = (file) => {
    if (!file?.path) return;
    const fileURL = getFileURL(file.path);
    fetch(fileURL)
      .then((r) => r.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("שגיאה בהורדת הקובץ"));
  };

  const isImageFile = (name) => {
    if (!name) return false;
    const ext = name.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  };
  const isPdfFile = (name) => !!name && name.toLowerCase().endsWith(".pdf");
  const isVideoFile = (name) => {
    if (!name) return false;
    const ext = name.toLowerCase().split(".").pop();
    return ["mp4", "webm", "ogg", "mov"].includes(ext);
  };

  return (
    <Box className="all-updates-main-container" sx={{ minHeight: "100vh", p: 4 }} dir="rtl">
      <Typography variant="h3" className="updates-title" sx={{ fontWeight: 700, textShadow: "2px 2px 4px rgba(0,0,0,0.2)", mb: 4 }}>
        כל העדכונים
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת העדכונים
        </Alert>
      )}
      {!isLoading && !isError && visibleUpdates.length === 0 && (
        <Paper className="no-updates-container">
          <Typography className="no-updates-title">אין עדכונים כרגע</Typography>
          <Typography className="no-updates-subtext">נעדכן כשתפורסמו הודעות חדשות</Typography>
        </Paper>
      )}

      <Box className="updates-list" sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {visibleUpdates.map((update) => (
          <Paper key={update._id} className="update-card-horizontal" elevation={3}>
            {update.file?.filename && (
              <Box
                onClick={() => window.open(getFileURL(update.file.path), "_blank", "noopener")}
                className="update-media-container"
                sx={{ "&:hover": { opacity: 0.8 } }}
              >
                {isImageFile(update.file.filename) ? (
                  <Box component="img" src={getFileURL(update.file.path)} alt={update.title} className="update-image" sx={{ display: "block" }} />
                ) : isPdfFile(update.file.filename) ? (
                  <Box className="update-pdf-container">
                    <iframe title={update.title} src={`${getFileURL(update.file.path)}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} className="update-pdf-iframe" scrolling="no" />
                    <Box className="pdf-overlay" />
                  </Box>
                ) : isVideoFile(update.file.filename) ? (
                  <Box
                    component="video"
                    src={getFileURL(update.file.path)}
                    autoPlay
                    muted
                    loop
                    controls
                    playsInline
                    className="update-video"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Box className="update-file-icon">
                    <AttachFileIcon className="file-icon" />
                    <Typography variant="caption" className="file-caption">
                      קובץ
                    </Typography>
                  </Box>
                )}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFile(update.file);
                  }}
                  className="download-button-overlay"
                  size="small"
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
            )}

            <Box className="update-content-container">
              <Box className="update-date-badge">
                <Typography className="date-text">
                  {new Date(update.createdAt).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}
                </Typography>
              </Box>
              <Box className="update-text-content">
                <Typography variant="h6" className="update-title-text">
                  {update.title}
                </Typography>
                <Typography variant="body2" className="update-description">
                  {update.content}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default AllUpdates;
