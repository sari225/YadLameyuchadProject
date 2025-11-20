import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import {
  useGetUpdatingsQuery,
  useCreateUpdatingMutation,
  useUpdateUpdatingMutation,
  useDeleteUpdatingMutation,
} from "../../../api/updateApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parseServerError } from "../../../utils/errorHandler";

// Zod schema for update validation
const updateSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  content: z.string().min(5, "תוכן חייב להכיל לפחות 5 תווים"),
  updateLocation: z.enum(["site", "site_and_email"]).default("site"),
});

const UpdateManagement = () => {
  const { data: updates = [], isLoading, refetch } = useGetUpdatingsQuery();
  const [createUpdate, { isLoading: isCreating }] = useCreateUpdatingMutation();
  const [updateUpdate, { isLoading: isUpdating }] = useUpdateUpdatingMutation();
  const [deleteUpdate, { isLoading: isDeleting }] = useDeleteUpdatingMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState(null);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      content: "",
      updateLocation: "site",
    },
  });

  // Open dialog for create or edit
  const handleOpenDialog = (update = null) => {
    setEditingUpdate(update);
    setSelectedFile(null);
    setRemoveFile(false);
    setServerError("");
    setSuccessMessage("");
    if (update) {
      reset({
        title: update.title || "",
        content: update.content || "",
        updateLocation: update.updateLocation || "site",
      });
    } else {
      reset({
        title: "",
        content: "",
        updateLocation: "site",
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUpdate(null);
    setSelectedFile(null);
    setRemoveFile(false);
    setServerError("");
    setSuccessMessage("");
    reset();
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file || null);
  };

  // Submit form (create or update)
  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("updateLocation", data.updateLocation);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    if (removeFile && editingUpdate) {
      formData.append("removeFile", "true");
    }

    try {
      if (editingUpdate) {
        await updateUpdate({ id: editingUpdate._id, formData }).unwrap();
        setSuccessMessage("העדכון עודכן בהצלחה");
      } else {
        await createUpdate(formData).unwrap();
        setSuccessMessage("העדכון נוצר בהצלחה");
      }
      refetch();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה בשמירת העדכון");
      setServerError(errorMessage);
    }
  };

  // Handle delete
  const handleDeleteClick = (update) => {
    setUpdateToDelete(update);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!updateToDelete) return;

    setServerError("");
    try {
      await deleteUpdate(updateToDelete._id).unwrap();
      setSuccessMessage("העדכון נמחק בהצלחה");
      refetch();
      setOpenDeleteDialog(false);
      setUpdateToDelete(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה במחיקת העדכון");
      setServerError(errorMessage);
      setTimeout(() => setServerError(""), 3000);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUpdateToDelete(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
          position: "relative",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ניהול עדכונים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            position: "absolute",
            left: 0,
            backgroundColor: "#03a9f4",
            "&:hover": { backgroundColor: "#0288d1" },
          }}
        >
          הוסף עדכון חדש
        </Button>
      </Box>

      {serverError && !openDialog && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      {successMessage && !openDialog && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1976d2" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>כותרת</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>תוכן</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>מיקום</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>קובץ מצורף</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>תאריך יצירה</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>
                פעולות
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    אין עדכונים להצגה
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              updates.map((update) => (
                <TableRow key={update._id} hover>
                  <TableCell sx={{ textAlign: "center" }}>{update.title}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {update.content.length > 50
                      ? `${update.content.substring(0, 50)}...`
                      : update.content}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      label={
                        update.updateLocation === "site"
                          ? "אתר בלבד"
                          : "אתר ומייל"
                      }
                      color={
                        update.updateLocation === "site" ? "default" : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {update.file?.filename ? (
                      <Chip
                        icon={<AttachFileIcon />}
                        label={update.file.filename}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {new Date(update.createdAt).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Tooltip title="עריכת עדכון" arrow>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(update)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחיקת עדכון" arrow>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(update)}
                        size="small"
                        disabled={isDeleting}
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>
          {editingUpdate ? "עריכת עדכון" : "הוספת עדכון חדש"}
        </DialogTitle>
        <DialogContent>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            <TextField
              label="כותרת"
              fullWidth
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              label="תוכן"
              fullWidth
              multiline
              rows={4}
              {...register("content")}
              error={!!errors.content}
              helperText={errors.content?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              label="מיקום עדכון"
              fullWidth
              select
              {...register("updateLocation")}
              error={!!errors.updateLocation}
              helperText={errors.updateLocation?.message}
              sx={{ mb: 2 }}
            >
              <MenuItem value="site">אתר בלבד</MenuItem>
              <MenuItem value="site_and_email">אתר ומייל</MenuItem>
            </TextField>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                >
                  {selectedFile
                    ? `קובץ נבחר: ${selectedFile.name}`
                    : (editingUpdate?.file?.filename && !removeFile)
                    ? `קובץ נוכחי: ${editingUpdate.file.filename}`
                    : "בחר קובץ (אופציונלי)"}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mpeg,.mov,.avi,.webm"
                  />
                </Button>
                {(selectedFile || (editingUpdate?.file?.filename && !removeFile)) && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                      setRemoveFile(true);
                      // Reset the file input
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) {
                        fileInput.value = '';
                      }
                    }}
                  >
                    הסר קובץ
                  </Button>
                )}
              </Box>
              {selectedFile && (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  גודל קובץ: {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{
              backgroundColor: "#03a9f4",
              "&:hover": { backgroundColor: "#0288d1" },
            }}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : editingUpdate ? (
              "עדכן"
            ) : (
              "צור"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את העדכון{" "}
            <strong>"{updateToDelete?.title}"</strong>?
          </Typography>
          <Typography sx={{ mt: 2, color: "text.secondary", fontSize: "14px" }}>
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            ביטול
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpdateManagement;
