import React, { useMemo } from "react";
import { Box, Typography, Paper, IconButton, CircularProgress, Alert } from "@mui/material";
import { GetApp as DownloadIcon, AttachFile as AttachFileIcon, Description as DescriptionIcon, Image as ImageIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useGetUpdatingsQuery } from "../../../api/updateApi";
import { useGetChildByIdQuery } from "../../../api/childApi";

const PersonalArea = () => {
  const { token } = useSelector((s) => s.auth);
  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const userId = decoded?.id;
  const { data: childData } = useGetChildByIdQuery(userId, { skip: !userId });
  const userName = childData?.Fname || "משתמש";
  const { data: updates = [], isLoading, isError } = useGetUpdatingsQuery();

  const normalizePath = (p) => {
    if (!p) return "";
    const posix = p.replace(/\\/g, "/");
    return posix.includes("/public/") ? posix.substring(posix.indexOf("/public/") + 8) : posix;
  };

  const getFileURL = (path) => {
    const base = process.env.REACT_APP_API_URL || "http://localhost:3030";
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

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #e3f2fd 0%, #fff 100%)", p: 4 }} dir="rtl">
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
          ברוך הבא, {userName} !
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.95 }}>
          שמחים לראות אותך באזור האישי שלך
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: "#333", textAlign: "center" }}>
          עדכונים אחרונים מהעמותה
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
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              אין עדכונים חדשים כרגע
            </Typography>
          </Paper>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleUpdates.map((update) => (
            <Paper key={update._id} elevation={3} sx={{ display: "flex", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }, borderRadius: 2, borderRight: "4px solid #667eea" }}>
              {update.file?.filename && (
                <Box
                  onClick={() => window.open(getFileURL(update.file.path), "_blank", "noopener")}
                  sx={{ width: 200, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", position: "relative", cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                >
                  {isImageFile(update.file.filename) ? (
                    <Box component="img" src={getFileURL(update.file.path)} alt={update.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : isPdfFile(update.file.filename) ? (
                    <Box sx={{ width: "100%", height: "100%", position: "relative", pointerEvents: "none" }}>
                      <iframe title={update.title} src={`${getFileURL(update.file.path)}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }} />
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <AttachFileIcon sx={{ fontSize: 60, color: "#666" }} />
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        קובץ
                      </Typography>
                    </Box>
                  )}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(update.file);
                    }}
                    sx={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", "&:hover": { backgroundColor: "rgba(255,255,255,1)" } }}
                    size="small"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              )}

              <Box sx={{ flex: 1, p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(update.createdAt).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" })}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#333" }}>
                  {update.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#666", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {update.content}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PersonalArea;