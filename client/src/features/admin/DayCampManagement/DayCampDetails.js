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
  MenuItem,
  Tabs,
  Tab,
  Autocomplete,
  Grid,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useGetDayCampByIdQuery,
  useUpdateDayCampMutation,
  useAddChildToDayCampMutation,
  useRemoveChildFromDayCampMutation,
} from "../../../api/dayCampApi";
import { useGetChildrenQuery } from "../../../api/childApi";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { parseServerError } from "../../../utils/errorHandler";
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType, AlignmentType, TextRun, BorderStyle, ShadingType, TableLayoutType } from "docx";
import { saveAs } from "file-saver";
import "./styles/DayCampDetails.css";

const DayCampDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dayCamp, isLoading, refetch } = useGetDayCampByIdQuery(id);
  const { data: allChildren = [] } = useGetChildrenQuery();
  const [updateDayCamp] = useUpdateDayCampMutation();
  const [addChild] = useAddChildToDayCampMutation();
  const [removeChild] = useRemoveChildFromDayCampMutation();

  const [tabValue, setTabValue] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registerStatus, setRegisterStatus] = useState(true);

  // רענן נתונים כשהקומפוננט נטען
  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (dayCamp) {
      setRegisterStatus(dayCamp.registerStatus ?? true);
    }
  }, [dayCamp]);

  const handleToggleRegisterStatus = async () => {
    try {
      const formData = new FormData();
      formData.append("registerStatus", !registerStatus);
      await updateDayCamp({ id, formData }).unwrap();
      setRegisterStatus(!registerStatus);
      setSuccessMessage("סטטוס הרישום עודכן בהצלחה");
      refetch();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setServerError("שגיאה בעדכון סטטוס הרישום");
      setTimeout(() => setServerError(""), 3000);
    }
  };

  const handleAddChild = async () => {
    if (!selectedChild) {
      setServerError("יש לבחור ילד");
      return;
    }

    try {
      await addChild({ DayCampId: id, id: selectedChild._id }).unwrap();
      setSuccessMessage("הילד נוסף בהצלחה");
      refetch();
      setOpenAddDialog(false);
      setSelectedChild(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה בהוספת ילד");
      setServerError(errorMessage);
      setTimeout(() => setServerError(""), 3000);
    }
  };

  const handleRemoveChildClick = (child) => {
    setChildToDelete(child);
    setOpenDeleteDialog(true);
  };

  const handleRemoveChildConfirm = async () => {
    if (!childToDelete) return;

    try {
      await removeChild({ DayCampId: id, id: childToDelete._id }).unwrap();
      setSuccessMessage("הילד הוסר בהצלחה");
      refetch();
      setOpenDeleteDialog(false);
      setChildToDelete(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה בהסרת ילד");
      setServerError(errorMessage);
      setOpenDeleteDialog(false);
      setChildToDelete(null);
      setTimeout(() => setServerError(""), 3000);
    }
  };

  const handleRemoveChildCancel = () => {
    setOpenDeleteDialog(false);
    setChildToDelete(null);
  };

  const exportAssignmentTable = () => {
    if (!dayCamp || !dayCamp.registeredChildren || dayCamp.registeredChildren.length === 0) {
      alert("אין ילדים רשומים לייצוא");
      return;
    }

    const startDate = new Date(dayCamp.startDate);
    const endDate = new Date(dayCamp.endDate);
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toLocaleDateString("he-IL"));
    }

    const rows = dayCamp.registeredChildren.map((child) => {
      const row = {
        "שם פרטי": child.Fname,
        "שם משפחה": child.Lname,
      };
      dates.forEach((date) => {
        row[date] = ""; // Empty cells for daily assignment
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "שיבוץ יומי");
    XLSX.writeFile(wb, `שיבוץ_קייטנה_${dayCamp.name}.xlsx`);
  };

  const exportAllergiesTable = () => {
    if (!dayCamp || !dayCamp.registeredChildren || dayCamp.registeredChildren.length === 0) {
      alert("אין ילדים רשומים לייצוא");
      return;
    }

    const childrenWithAllergies = dayCamp.registeredChildren.filter(
      (child) => child.allergies && child.allergies.length > 0
    );

    if (childrenWithAllergies.length === 0) {
      alert("אין ילדים עם אלרגיות לייצוא");
      return;
    }

    // Desired RTL visual order (rightmost to leftmost): ת.ז, שם פרטי, שם משפחה, אלרגיות.
    // Excel stores columns left-to-right as insertion order; consumers viewing RTL will see first key on left.
    // So we insert in reverse sequence so that ת.ז appears rightmost when sheet is interpreted RTL.
    const rows = childrenWithAllergies.map((child) => ({
      "אלרגיות": child.allergies.join(", "),
      "שם משפחה": child.Lname,
      "שם פרטי": child.Fname,
      "ת.ז": child.childId,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "אלרגיות");
    XLSX.writeFile(wb, `אלרגיות_קייטנה_${dayCamp.name}.xlsx`);
  };

  const exportAssignmentTableDocx = async () => {
    if (!dayCamp || !dayCamp.registeredChildren || dayCamp.registeredChildren.length === 0) {
      alert("אין ילדים רשומים לייצוא");
      return;
    }

    const startDate = new Date(dayCamp.startDate);
    const endDate = new Date(dayCamp.endDate);
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toLocaleDateString("he-IL"));
    }

    const headerCells = [
      ...dates.map((d) => `"${d}"` ? d : d).map((text) =>
        new DocxTableCell({
          shading: { type: ShadingType.CLEAR, fill: "1976D2", color: "auto" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              children: [new TextRun({ text, bold: true, font: "Arial", color: "FFFFFF" })],
            }),
          ],
        })
      ),
      new DocxTableCell({
        shading: { type: ShadingType.CLEAR, fill: "1976D2", color: "auto" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [new TextRun({ text: "משפחה", bold: true, font: "Arial", color: "FFFFFF" })],
          }),
        ],
      }),
      new DocxTableCell({
        shading: { type: ShadingType.CLEAR, fill: "1976D2", color: "auto" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [new TextRun({ text: "שם הילד", bold: true, font: "Arial", color: "FFFFFF" })],
          }),
        ],
      }),
    ];

    const rows = [
      new DocxTableRow({ children: headerCells }),
      ...dayCamp.registeredChildren.map((child) =>
        new DocxTableRow({
          children: [
            ...dates.map(() =>
              new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: "", font: "Arial" })] })] })
            ),
            new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: child.Lname || "", font: "Arial" })] })] }),
            new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: child.Fname || "", font: "Arial" })] })] }),
          ],
        })
      ),
    ];

    const totalWidth = 10400; // approx page width minus margins in twips
    const nameWidth = 2500;
    const familyWidth = 2000;
    const dateWidth = Math.max(1100, Math.floor((totalWidth - nameWidth - familyWidth) / (dates.length || 1)));
    const columnWidths = [
      ...new Array(dates.length).fill(dateWidth),
      familyWidth,
      nameWidth,
    ];

    const table = new DocxTable({
      width: { size: totalWidth, type: WidthType.DXA },
      alignment: AlignmentType.RIGHT,
      layout: TableLayoutType.FIXED,
      columnWidths,
      rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      },
    });

    const title = new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [new TextRun({ text: `שיבוץ יומי - ${dayCamp.name}` , font: "Arial", bold: true, size: 28 })],
    });
    const subTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [
        new TextRun({
          text: `תאריכים: ${new Date(dayCamp.startDate).toLocaleDateString("he-IL")} - ${new Date(dayCamp.endDate).toLocaleDateString("he-IL")}`,
          font: "Arial",
        }),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [title, subTitle, new Paragraph(""), table],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `שיבוץ_קייטנה_${dayCamp.name}.docx`);
  };

  const exportAllergiesTableDocx = async () => {
    if (!dayCamp || !dayCamp.registeredChildren || dayCamp.registeredChildren.length === 0) {
      alert("אין ילדים רשומים לייצוא");
      return;
    }

    const childrenWithAllergies = dayCamp.registeredChildren.filter(
      (child) => child.allergies && child.allergies.length > 0
    );

    if (childrenWithAllergies.length === 0) {
      alert("אין ילדים עם אלרגיות לייצוא");
      return;
    }

    // Order for RTL visual: rightmost should be ת.ז then שם פרטי then שם משפחה then אלרגיות (leftmost)
    const header = ["אלרגיות", "שם משפחה", "שם פרטי", "ת.ז"].map((text) =>
      new DocxTableCell({
        shading: { type: ShadingType.CLEAR, fill: "1976D2", color: "auto" },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text, bold: true, font: "Arial", color: "FFFFFF" })] })],
      })
    );

    const rows = [
      new DocxTableRow({ children: header }),
      ...childrenWithAllergies.map((child) =>
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: (child.allergies || []).join(", "), font: "Arial" })] })] }),
            new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: child.Lname || "", font: "Arial" })] })] }),
            new DocxTableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: child.Fname || "", font: "Arial" })] })],
            }),
            new DocxTableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [new TextRun({ text: child.childId || "", font: "Arial" })] })] }),
          ],
        })
      ),
    ];

    const aTotalWidth = 10400; // approx page width minus margins in twips
    const aNameWidth = 2500;
    const aFamilyWidth = 2000;
    const aIdWidth = 2000;
    const aAllergyWidth = Math.max(2000, aTotalWidth - aNameWidth - aFamilyWidth - aIdWidth);

    const table = new DocxTable({
      width: { size: aTotalWidth, type: WidthType.DXA },
      alignment: AlignmentType.RIGHT,
      layout: TableLayoutType.FIXED,
      // Column widths correspond to header order: אלרגיות, שם משפחה, שם פרטי, ת.ז
      columnWidths: [aAllergyWidth, aFamilyWidth, aNameWidth, aIdWidth],
      rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      },
    });

    const title = new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [new TextRun({ text: `טבלת אלרגיות - ${dayCamp.name}`, font: "Arial", bold: true, size: 28 })],
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [title, new Paragraph(""), table],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `אלרגיות_קייטנה_${dayCamp.name}.docx`);
  };

  const availableChildren = allChildren.filter(
    (child) => 
      child.isApproved && 
      child.isVerified && 
      !dayCamp?.registeredChildren?.some((rc) => rc._id === child._id)
  );

  const childrenWithAllergies = dayCamp?.registeredChildren?.filter(
    (child) => child.allergies && child.allergies.length > 0
  ) || [];

  if (isLoading) {
    return (
      <Box className="daycamp-details-loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (!dayCamp) {
    return (
      <Box className="daycamp-details-error-container">
        <Alert severity="error">קייטנה לא נמצאה</Alert>
      </Box>
    );
  }

  return (
    <Box className="daycamp-details-container">
      <Box className="daycamp-details-header">
        <IconButton onClick={() => navigate("/admin/daycampsManagement")}>
          <ArrowForwardIcon />
        </IconButton>
        <Typography variant="h4" className="daycamp-details-title">
          {dayCamp.name}
        </Typography>
      </Box>

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

      {/* Info Summary - Single Line */}
      <Box className="daycamp-details-info-summary">
        <Grid container spacing={1.5} alignItems="center">
          <Grid item>
            <Chip 
              label={`נרשמים: ${dayCamp.registeredChildren?.length || 0}`}
              className="daycamp-details-info-chip"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={`התחלה: ${new Date(dayCamp.startDate).toLocaleDateString("he-IL")}`}
              className="daycamp-details-info-chip"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={`סיום: ${new Date(dayCamp.endDate).toLocaleDateString("he-IL")}`}
              className="daycamp-details-info-chip"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={`מיקום: ${dayCamp.location}`}
              className="daycamp-details-info-chip"
              size="small"
            />
          </Grid>
          <Grid item>
            <Chip 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>רישום:</Typography>
                  <Switch
                    checked={registerStatus}
                    onChange={handleToggleRegisterStatus}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'white',
                        opacity: 0.5,
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {registerStatus ? 'פתוח' : 'סגור'}
                  </Typography>
                </Box>
              }
              className="daycamp-details-info-chip"
              size="small"
            />
          </Grid>
          {dayCamp.file?.filename && (
            <Grid item>
              <Chip
                label={dayCamp.file.filename}
                icon={<AttachFileIcon />}
                className="daycamp-details-info-chip"
                size="small"
                onClick={() => {
                  const fileURL = `${process.env.REACT_APP_API_URL}/${dayCamp.file.path}`;
                  window.open(fileURL, "_blank");
                }}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Tabs */}
      <Box className="daycamp-details-tabs-paper">
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
          <Tab label="רשימת ילדים" />
          <Tab label="טבלת אלרגיות" />
          <Tab label="ייצוא נתונים" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          <div className="daycamp-details-controls-section">
            <div className="daycamp-details-controls-flex">
              <div className="daycamp-details-autocomplete-wrapper">
                <Autocomplete
                  fullWidth
                  options={availableChildren}
                  getOptionLabel={(option) => `${option.Fname} ${option.Lname} - ${option.childId}`}
                  value={selectedChild}
                  onChange={(event, newValue) => setSelectedChild(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="חפש ובחר ילד"
                      placeholder="הקלד שם או ת.ז"
                      size="medium"
                      fullWidth
                    />
                  )}
                  noOptionsText="לא נמצאו ילדים זמינים"
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
              </div>
              <Button
                variant="contained"
                onClick={handleAddChild}
                disabled={!selectedChild}
                className="daycamp-details-add-button"
              >
                <AddIcon />
              </Button>
            </div>
          </div>
          <Paper>
            <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="daycamp-details-table-header">
                  <TableCell className="daycamp-details-table-header-cell">ת.ז</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">שם פרטי</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">שם משפחה</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">טלפון</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">אלרגיות</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayCamp.registeredChildren && dayCamp.registeredChildren.length > 0 ? (
                  [...dayCamp.registeredChildren]
                    .sort((a, b) => a.Fname.localeCompare(b.Fname, 'he'))
                    .map((child) => (
                    <TableRow key={child._id} hover>
                      <TableCell className="daycamp-details-table-body-cell">{child.childId}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.Fname}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.Lname}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.phone1}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">
                        {child.allergies && child.allergies.length > 0 ? (
                          child.allergies.map((allergy, idx) => (
                            <Chip key={idx} label={allergy} size="small" sx={{ m: 0.5 }} color="warning" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            אין
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell className="daycamp-details-table-body-cell">
                        <IconButton className="daycamp-details-delete-icon-button" onClick={() => handleRemoveChildClick(child)} title="הסר">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="daycamp-details-empty-message">
                      <Typography variant="body1" color="text.secondary">
                        אין ילדים רשומים
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        </>
      )}

      {tabValue === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="daycamp-details-table-header">
                  <TableCell className="daycamp-details-table-header-cell">ת.ז</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">שם פרטי</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">שם משפחה</TableCell>
                  <TableCell className="daycamp-details-table-header-cell">אלרגיות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {childrenWithAllergies.length > 0 ? (
                  [...childrenWithAllergies]
                    .sort((a, b) => a.Fname.localeCompare(b.Fname, 'he'))
                    .map((child) => (
                    <TableRow key={child._id} hover>
                      <TableCell className="daycamp-details-table-body-cell">{child.childId}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.Fname}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.Lname}</TableCell>
                      <TableCell className="daycamp-details-table-body-cell">{child.allergies.join(", ")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="daycamp-details-empty-message">
                      <Typography variant="body1" color="text.secondary">
                        אין ילדים עם אלרגיות מדווחות
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 600, margin: '0 auto', p: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportAssignmentTable}
            className="daycamp-details-export-button"
            sx={{
              background: 'linear-gradient(135deg, #87c8d2 0%, #b5e2ec 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(135, 200, 210, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(135, 200, 210, 0.5)',
              },
            }}
          >
            ייצא טבלת שיבוץ יומי (Excel)
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportAllergiesTable}
            className="daycamp-details-export-button"
            sx={{
              background: 'linear-gradient(135deg, #d687b9 0%, #9e63a9 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(158, 99, 169, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(158, 99, 169, 0.5)',
              },
            }}
          >
            ייצא טבלת אלרגיות (Excel)
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportAssignmentTableDocx}
            className="daycamp-details-export-button-outlined"
            sx={{
              borderColor: '#87c8d2',
              color: '#87c8d2',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              borderWidth: '2px',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderWidth: '2px',
                borderColor: '#6fb8c2',
                backgroundColor: 'rgba(135, 200, 210, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            ייצא טבלת שיבוץ יומי (Word)
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportAllergiesTableDocx}
            className="daycamp-details-export-button-outlined"
            sx={{
              borderColor: '#9e63a9',
              color: '#9e63a9',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '12px',
              borderWidth: '2px',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderWidth: '2px',
                borderColor: '#8d5298',
                backgroundColor: 'rgba(158, 99, 169, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            ייצא טבלת אלרגיות (Word)
          </Button>
        </Box>
      )}

      {/* Add Child Dialog */}
      <Dialog open={openAddDialog} onClose={() => { setOpenAddDialog(false); setSelectedChild(null); }} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>הוספת ילד לקייטנה</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableChildren}
            getOptionLabel={(option) => `${option.Fname} ${option.Lname} - ${option.childId}`}
            value={selectedChild}
            onChange={(event, newValue) => setSelectedChild(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="חפש ובחר ילד"
                placeholder="הקלד שם או ת.ז"
                sx={{ mt: 2 }}
              />
            )}
            noOptionsText="לא נמצאו תוצאות"
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>ביטול</Button>
          <Button onClick={handleAddChild} variant="contained" color="primary">
            הוסף
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Child Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleRemoveChildCancel} 
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
            אישור הסרה
          </Typography>
          <IconButton onClick={handleRemoveChildCancel} className="dialog-close-button">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך להסיר את <strong>{childToDelete?.Fname} {childToDelete?.Lname}</strong> מהקייטנה?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveChildCancel}>ביטול</Button>
          <Button onClick={handleRemoveChildConfirm} variant="contained" color="error">
            הסר
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DayCampDetails;
