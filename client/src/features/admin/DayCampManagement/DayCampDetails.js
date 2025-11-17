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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
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
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType, AlignmentType, TextRun, BorderStyle, ShadingType, TableLayoutType } from "docx";
import { saveAs } from "file-saver";

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
      setServerError(error?.data?.message || "שגיאה בהוספת ילד");
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
      setServerError(error?.data?.message || "שגיאה בהסרת ילד");
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
    (child) => !dayCamp?.registeredChildren?.some((rc) => rc._id === child._id)
  );

  const childrenWithAllergies = dayCamp?.registeredChildren?.filter(
    (child) => child.allergies && child.allergies.length > 0
  ) || [];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dayCamp) {
    return (
      <Box sx={{ p: 3 }} dir="rtl">
        <Alert severity="error">קייטנה לא נמצאה</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate("/admin/daycampsManagement")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
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

      {/* Info Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" color="primary">
            {dayCamp.subscribersNumber || 0}
          </Typography>
          <Typography variant="body2">מספר נרשמים</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1">
            {new Date(dayCamp.startDate).toLocaleDateString("he-IL")}
          </Typography>
          <Typography variant="body2">תאריך התחלה</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1">
            {new Date(dayCamp.endDate).toLocaleDateString("he-IL")}
          </Typography>
          <Typography variant="body2">תאריך סיום</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1">{dayCamp.location}</Typography>
          <Typography variant="body2">מיקום</Typography>
        </Paper>
        {dayCamp.file?.filename && (
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={() => {
                const fileURL = `${process.env.REACT_APP_API_URL}/${dayCamp.file.path}`;
                window.open(fileURL, "_blank");
              }}
              size="small"
            >
              {dayCamp.file.filename}
            </Button>
            <Typography variant="body2" sx={{ mt: 1 }}>קובץ מצורף</Typography>
          </Paper>
        )}
      </Box>

      {/* Register Status Toggle */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={registerStatus}
              onChange={handleToggleRegisterStatus}
              color="primary"
            />
          }
          label={
            <Typography>
              סטטוס רישום: <strong>{registerStatus ? "פתוח" : "סגור"}</strong>
            </Typography>
          }
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered>
          <Tab label="רשימת ילדים" />
          <Tab label="טבלת אלרגיות" />
          <Tab label="ייצוא נתונים" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ backgroundColor: "#03a9f4", "&:hover": { backgroundColor: "#0288d1" } }}
            >
              הוסף ילד
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1976d2" }}>
                  {/* סדר עמודות נכון RTL: ת.ז, שם פרטי, שם משפחה, טלפון, אלרגיות, פעולות */}
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>ת.ז</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>שם פרטי</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>שם משפחה</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>טלפון</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>אלרגיות</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayCamp.registeredChildren && dayCamp.registeredChildren.length > 0 ? (
                  dayCamp.registeredChildren.map((child) => (
                    <TableRow key={child._id} hover>
                      {/* ת.ז */}
                      <TableCell sx={{ textAlign: "center" }}>{child.childId}</TableCell>
                      {/* שם פרטי */}
                      <TableCell sx={{ textAlign: "center" }}>{child.Fname}</TableCell>
                      {/* שם משפחה */}
                      <TableCell sx={{ textAlign: "center" }}>{child.Lname}</TableCell>
                      {/* טלפון */}
                      <TableCell sx={{ textAlign: "center" }}>{child.phone1}</TableCell>
                      {/* אלרגיות */}
                      <TableCell sx={{ textAlign: "center" }}>
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
                      {/* פעולות */}
                      <TableCell sx={{ textAlign: "center" }}>
                        <IconButton color="error" onClick={() => handleRemoveChildClick(child)} title="הסר">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
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
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1976d2" }}>
                  {/* סדר עמודות נכון RTL: ת.ז, שם פרטי, שם משפחה, אלרגיות */}
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>ת.ז</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>שם פרטי</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>שם משפחה</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>אלרגיות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {childrenWithAllergies.length > 0 ? (
                  childrenWithAllergies.map((child) => (
                    <TableRow key={child._id} hover>
                      {/* ת.ז */}
                      <TableCell sx={{ textAlign: "center" }}>{child.childId}</TableCell>
                      {/* שם פרטי */}
                      <TableCell sx={{ textAlign: "center" }}>{child.Fname}</TableCell>
                      {/* שם משפחה */}
                      <TableCell sx={{ textAlign: "center" }}>{child.Lname}</TableCell>
                      {/* אלרגיות */}
                      <TableCell sx={{ textAlign: "center" }}>{child.allergies.join(", ")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
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
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportAssignmentTable}
              sx={{ backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#45a049" } }}
            >
              ייצא טבלת שיבוץ יומי (Excel)
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportAllergiesTable}
              sx={{ backgroundColor: "#ff9800", "&:hover": { backgroundColor: "#fb8c00" } }}
            >
              ייצא טבלת אלרגיות (Excel)
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportAssignmentTableDocx}
            >
              ייצא טבלת שיבוץ יומי (Word)
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportAllergiesTableDocx}
            >
              ייצא טבלת אלרגיות (Word)
            </Button>
          </Box>
        </Paper>
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
      <Dialog open={openDeleteDialog} onClose={handleRemoveChildCancel} dir="rtl">
        <DialogTitle>אישור הסרה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך להסיר את הילד {childToDelete?.Fname} {childToDelete?.Lname} מהקייטנה?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            פעולה זו אינה ניתנת לביטול!
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
