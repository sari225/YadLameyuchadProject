import React, { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import {
  useGetDayCampsQuery,
  useCreateDayCampMutation,
  useUpdateDayCampMutation,
  useDeleteDayCampMutation,
} from "../../../api/dayCampApi";
import { useNavigate } from "react-router-dom";

const DayCampManagement = () => {
  const navigate = useNavigate();
  const { data: dayCamps = [], isLoading, refetch } = useGetDayCampsQuery();
  const [createDayCamp, { isLoading: isCreating }] = useCreateDayCampMutation();
  const [updateDayCamp, { isLoading: isUpdating }] = useUpdateDayCampMutation();
  const [deleteDayCamp, { isLoading: isDeleting }] = useDeleteDayCampMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dayCampToDelete, setDayCampToDelete] = useState(null);
  const [editingDayCamp, setEditingDayCamp] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    registerStatus: true,
  });

  // רענן נתונים כשהקומפוננט נטען
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Open dialog for create or edit
  const handleOpenDialog = (dayCamp = null) => {
    setEditingDayCamp(dayCamp);
    setSelectedFile(null);
    setRemoveFile(false);
    setServerError("");
    setSuccessMessage("");
    if (dayCamp) {
      setFormData({
        name: dayCamp.name || "",
        startDate: dayCamp.startDate ? dayCamp.startDate.split("T")[0] : "",
        endDate: dayCamp.endDate ? dayCamp.endDate.split("T")[0] : "",
        location: dayCamp.location || "",
        registerStatus: dayCamp.registerStatus ?? true,
      });
    } else {
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        location: "",
        registerStatus: true,
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDayCamp(null);
    setSelectedFile(null);
    setRemoveFile(false);
    setServerError("");
    setSuccessMessage("");
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      location: "",
      registerStatus: true,
    });
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file || null);
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    setServerError("");
    setSuccessMessage("");

    // Validation
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.location) {
      setServerError("יש למלא את כל השדות החובה");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setServerError("תאריך סיום חייב להיות אחרי תאריך התחלה");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("startDate", formData.startDate);
    dataToSend.append("endDate", formData.endDate);
    dataToSend.append("location", formData.location);
    dataToSend.append("registerStatus", formData.registerStatus);
    
    if (selectedFile) {
      dataToSend.append("file", selectedFile);
    }
    
    if (removeFile && editingDayCamp) {
      dataToSend.append("removeFile", "true");
    }

    try {
      if (editingDayCamp) {
        await updateDayCamp({ id: editingDayCamp._id, formData: dataToSend }).unwrap();
        setSuccessMessage("הקייטנה עודכנה בהצלחה");
      } else {
        await createDayCamp(dataToSend).unwrap();
        setSuccessMessage("הקייטנה נוצרה בהצלחה");
      }
      await refetch();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      const msg = error?.data?.message || "שגיאה בשמירת הקייטנה";
      setServerError(msg);
    }
  };

  // Handle delete
  const handleDeleteClick = (dayCamp) => {
    setDayCampToDelete(dayCamp);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dayCampToDelete) return;

    setServerError("");
    try {
      await deleteDayCamp(dayCampToDelete._id).unwrap();
      setSuccessMessage("הקייטנה נמחקה בהצלחה");
      refetch();
      setOpenDeleteDialog(false);
      setDayCampToDelete(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const msg = error?.data?.message || "שגיאה במחיקת הקייטנה";
      setServerError(msg);
      setTimeout(() => setServerError(""), 3000);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setDayCampToDelete(null);
  };

  const handleViewDayCamp = (id) => {
    navigate(`/admin/daycampsManagement/${id}`);
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
          ניהול קייטנות
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
          הוסף קייטנה חדשה
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
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>שם הקייטנה</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>תאריך התחלה</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>תאריך סיום</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>מיקום</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>מספר נרשמים</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>סטטוס רישום</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...dayCamps].sort((a, b) => new Date(b.endDate) - new Date(a.endDate)).map((dayCamp) => (
              <TableRow
                key={dayCamp._id}
                hover
                onClick={() => handleViewDayCamp(dayCamp._id)}
                sx={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
              >
                <TableCell sx={{ textAlign: "center" }}>{dayCamp.name}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {new Date(dayCamp.startDate).toLocaleDateString("he-IL")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {new Date(dayCamp.endDate).toLocaleDateString("he-IL")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{dayCamp.location}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{dayCamp.subscribersNumber || 0}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Chip
                    label={dayCamp.registerStatus ? "פתוח" : "סגור"}
                    color={dayCamp.registerStatus ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    color="primary"
                    onClick={(e) => { e.stopPropagation(); handleViewDayCamp(dayCamp._id); }}
                    title="צפה בפרטים"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={(e) => { e.stopPropagation(); handleOpenDialog(dayCamp); }}
                    title="ערוך"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(dayCamp); }}
                    title="מחק"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {dayCamps.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    אין קייטנות במערכת
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
          {editingDayCamp ? "עריכת קייטנה" : "הוספת קייטנה חדשה"}
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

          <TextField
            label="שם הקייטנה"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            required
          />

          <TextField
            label="תאריך התחלה"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="תאריך סיום"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="מיקום"
            name="location"
            value={formData.location}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.registerStatus}
                onChange={handleChange}
                name="registerStatus"
                color="primary"
              />
            }
            label="אפשר רישום ילדים"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ flex: 1 }}
              >
                {selectedFile
                  ? `קובץ נבחר: ${selectedFile.name}`
                  : (editingDayCamp?.file?.filename && !removeFile)
                  ? `קובץ נוכחי: ${editingDayCamp.file.filename}`
                  : "בחר קובץ (אופציונלי)"}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mpeg,.mov,.avi,.webm"
                />
              </Button>
              {(selectedFile || (editingDayCamp?.file?.filename && !removeFile)) && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => {
                    setSelectedFile(null);
                    setRemoveFile(true);
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{
              backgroundColor: "#03a9f4",
              "&:hover": { backgroundColor: "#0288d1" },
            }}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : editingDayCamp ? (
              "עדכן"
            ) : (
              "הוסף"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel} dir="rtl">
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הקייטנה "{dayCampToDelete?.name}"?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            פעולה זו אינה ניתנת לביטול!
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

export default DayCampManagement;
