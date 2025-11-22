import React from "react";
import { Box, Typography, Paper, IconButton, CircularProgress, Alert, Button } from "@mui/material";
import { GetApp as DownloadIcon, AttachFile as AttachFileIcon, InfoOutlined as InfoIcon } from "@mui/icons-material";
import { useGetUpdatingsQuery } from "../../../api/updateApi";
import { useNavigate } from "react-router-dom";
import "./styles/updatesSectionStyles.css";

const UpdatesSection = () => {
  const navigate = useNavigate();
  const { data: updates = [], isLoading, isError } = useGetUpdatingsQuery();

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
    <Box className="updates-main-container">
      <Typography variant="h4" className="updates-title">
        עדכונים אחרונים
      </Typography>

      {isLoading && (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" className="error-alert">
          שגיאה בטעינת העדכונים
        </Alert>
      )}
      {!isLoading && !isError && visibleUpdates.length === 0 && (
        <Paper className="no-updates-container">
          <InfoIcon className="no-updates-icon" />
          <Typography className="no-updates-title">
            אין עדכונים חדשים
          </Typography>
          <Typography className="no-updates-subtitle">
            כל העדכונים וההודעות החדשות יופיעו כאן
          </Typography>
        </Paper>
      )}

      <Box className="updates-list">
        {visibleUpdates.slice(0, 4).map((update) => (
          <Paper key={update._id} className="update-card-horizontal">
            {/* תצוגה מקדימה של קובץ יחיד אם קיים */}
            {((update.files && update.files[0]) || update.file) && (
              <Box
                onClick={() => window.open(getFileURL((update.files && update.files[0] ? update.files[0].path : update.file.path)), "_blank", "noopener")}
                className="update-media-container"
              >
                {isImageFile((update.files && update.files[0] ? update.files[0].filename : update.file.filename)) ? (
                  <Box 
                    component="img" 
                    src={getFileURL((update.files && update.files[0] ? update.files[0].path : update.file.path))}
                    alt={update.title} 
                    className="update-image"
                  />
                ) : isPdfFile((update.files && update.files[0] ? update.files[0].filename : update.file.filename)) ? (
                  <Box className="update-pdf-container">
                    <iframe
                      title={update.title}
                      src={`${getFileURL((update.files && update.files[0] ? update.files[0].path : update.file.path))}#view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                      className="update-pdf-iframe"
                      scrolling="no"
                    />
                    <Box className="pdf-overlay" />
                  </Box>
                ) : isVideoFile((update.files && update.files[0] ? update.files[0].filename : update.file.filename)) ? (
                  <Box
                    component="video"
                    src={getFileURL((update.files && update.files[0] ? update.files[0].path : update.file.path))}
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
                    handleDownloadFile((update.files && update.files[0] ? update.files[0] : update.file));
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

      {visibleUpdates.length > 4 && (
        <Box className="show-all-container">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/user/all-updates")}
            className="show-all-button"
          >
            הצג את כל העדכונים
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UpdatesSection;