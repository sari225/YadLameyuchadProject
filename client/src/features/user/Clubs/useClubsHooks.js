import { useState, useCallback } from 'react';

// Hook מותאם להודעות זמניות
export const useTemporaryMessages = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccess = useCallback((message, duration = 3000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), duration);
  }, []);

  const showError = useCallback((message, duration = 3000) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), duration);
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, []);

  return {
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    clearMessages
  };
};

// Hook לניהול דיאלוג
export const useDialog = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = useCallback((item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    openDialog,
    handleOpenDialog,
    handleCloseDialog
  };
};