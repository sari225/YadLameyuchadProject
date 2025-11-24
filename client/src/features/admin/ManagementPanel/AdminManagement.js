import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from "../../../api/adminApi";
import { parseServerError } from "../../../utils/errorHandler";
import "./styles/AdminManagement.css";

// Zod schema for admin creation
const adminCreateSchema = z.object({
  name: z
    .string()
    .min(1, "שם המנהל הוא שדה חובה")
    .max(15, "שם המנהל לא יכול להכיל יותר מ-15 תווים")
    .refine((val) => val.trim().length > 0, "שם המנהל לא יכול להיות ריק"),
  email: z
    .string()
    .min(1, "אימייל הוא שדה חובה")
    .email("כתובת המייל אינה תקינה")
    .regex(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/, "כתובת המייל אינה תקינה"),
  password: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .regex(/[a-z]/, "הסיסמה חייבת להכיל לפחות אות קטנה אחת")
    .regex(/[A-Z]/, "הסיסמה חייבת להכיל לפחות אות גדולה אחת")
    .regex(/[!@#$%^&*]/, "הסיסמה חייבת להכיל לפחות תו מיוחד אחד (!@#$%^&*)"),
});

// Zod schema for admin update
const adminUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "שם המנהל הוא שדה חובה")
    .max(15, "שם המנהל לא יכול להכיל יותר מ-15 תווים")
    .refine((val) => val.trim().length > 0, "שם המנהל לא יכול להיות ריק"),
  email: z
    .string()
    .min(1, "אימייל הוא שדה חובה")
    .email("כתובת המייל אינה תקינה")
    .regex(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/, "כתובת המייל אינה תקינה"),
  password: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return val.length >= 8;
    }, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[a-z]/.test(val);
    }, "הסיסמה חייבת להכיל לפחות אות קטנה אחת")
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[A-Z]/.test(val);
    }, "הסיסמה חייבת להכיל לפחות אות גדולה אחת")
    .refine((val) => {
      if (!val || val.length === 0) return true;
      return /[!@#$%^&*]/.test(val);
    }, "הסיסמה חייבת להכיל לפחות תו מיוחד אחד (!@#$%^&*)"),
});

const AdminManagement = () => {
  const { data: admins = [], isLoading, isError } = useGetAdminsQuery();
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentSchema = selectedAdmin ? adminUpdateSchema : adminCreateSchema;
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: "onChange",
  });

  const nameValue = watch("name") || "";

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (openDialog) {
      reset(selectedAdmin 
        ? { name: selectedAdmin.name, email: selectedAdmin.email, password: "" }
        : { name: "", email: "", password: "" }
      );
    }
  }, [openDialog, selectedAdmin, reset]);

  const handleOpenDialog = (admin = null) => {
    setSelectedAdmin(admin);
    setOpenDialog(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAdmin(null);
    setError("");
    reset();
  };

  const handleOpenDeleteDialog = (admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAdmin(null);
  };

  const onSubmit = async (formData) => {
    setError("");

    // Check for duplicate email (only on create)
    if (!selectedAdmin) {
      const emailExists = admins.some(
        (admin) => admin.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        setError("❌ כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת.");
        return;
      }
    }

    try {
      const adminData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.password && formData.password.length > 0) {
        adminData.password = formData.password;
      }

      if (selectedAdmin) {
        await updateAdmin({ id: selectedAdmin._id, adminData }).unwrap();
        setSuccess("✅ המנהל עודכן בהצלחה!");
      } else {
        await createAdmin(adminData).unwrap();
        setSuccess("✅ המנהל נוסף בהצלחה!");
      }

      handleCloseDialog();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = parseServerError(err, "אירעה שגיאה בשמירת המנהל");
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAdmin(selectedAdmin._id).unwrap();
      setSuccess("✅ המנהל נמחק בהצלחה!");
      handleCloseDeleteDialog();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = parseServerError(err, "אירעה שגיאה במחיקת המנהל");
      setError(errorMessage);
      handleCloseDeleteDialog();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Box className="admin-management-container" dir="rtl">
      <Box className="admin-management-header">
        <Box className="admin-management-title-section">
          <AdminIcon className="admin-management-icon" />
          <Typography variant="h5" className="admin-management-title">
            ניהול מנהלי האתר
          </Typography>
          <IconButton
            onClick={() => handleOpenDialog()}
            className="add-admin-button"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" className="admin-management-alert">
          {success}
        </Alert>
      )}

      {error && !openDialog && (
        <Alert severity="error" className="admin-management-alert" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" className="admin-management-alert">
          שגיאה בטעינת רשימת המנהלים
        </Alert>
      )}

      {isLoading ? (
        <Box className="admin-management-loading">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer className="admin-management-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">שם מנהל</TableCell>
                <TableCell align="center">אימייל</TableCell>
                <TableCell align="center">תאריך הצטרפות</TableCell>
                <TableCell align="center">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      אין מנהלים במערכת
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell align="center">{admin.name}</TableCell>
                    <TableCell align="center">{admin.email}</TableCell>
                    <TableCell align="center">{formatDate(admin.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="ערוך מנהל">
                        <IconButton
                          onClick={() => handleOpenDialog(admin)}
                          size="small"
                          className="edit-icon-button"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק מנהל">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(admin)}
                          size="small"
                          className="delete-icon-button"
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
      )}

      {/* Dialog להוספה/עריכה */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
            {selectedAdmin ? "עריכת מנהל" : "הוספת מנהל חדש"}
          </Typography>
          <IconButton onClick={handleCloseDialog} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="שם מנהל"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message || `${nameValue.length}/15 תווים`}
              margin="normal"
              inputProps={{ maxLength: 15 }}
            />
            <TextField
              fullWidth
              label="אימייל"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
              disabled={!!selectedAdmin}
            />
            <TextField
              fullWidth
              label={selectedAdmin ? "סיסמה חדשה (אופציונלי)" : "סיסמה"}
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message || "לפחות 8 תווים, אות גדולה, אות קטנה ותו מיוחד"}
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? <CircularProgress size={24} /> : "שמור"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog למחיקה */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog} 
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
          <IconButton onClick={handleCloseDeleteDialog} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המנהל{" "}
            <strong>{selectedAdmin?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>ביטול</Button>
          <Button
            onClick={handleDelete}
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

export default AdminManagement;
