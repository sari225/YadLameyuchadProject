const Updating = require("../models/Updating");
const fs = require("fs");
const Child = require("../models/Child");
const { sendMail } = require("../utils/sendMail");
const updateNotificationEmailTemplate = require('../templates/emails/updateNotificationEmail');
const updateFullEmailTemplate = require('../templates/emails/updateFullEmail');

// helper to send emails for an updating
const sendEmailsForUpdate = async (updating) => {
  try {
    // אם זה רק באתר, שולחים התראה רק למי שאישר דיוור
    const query = updating.updateLocation === "site" 
      ? { emailConsent: true }  // רק מי שאישר דיוור
      : {};  // כולם - אם זה site_and_email
    
    const children = await Child.find(query).select("email Fname").lean();
    if (!children || children.length === 0) return;

    const promises = children
      .filter((c) => c.email)
      .map((c) => {
        if (updating.updateLocation === "site") {
          // short notification for site updates
          const emailContent = updateNotificationEmailTemplate(c.Fname);
          return sendMail(c.email, "עדכון חדש באתר", emailContent);
        }
        // for site_and_email send the full update to everyone
        const subject = updating.title ? updating.title : "עדכון חדש";
        
        // אם יש קובץ מצורף ומדובר בעדכון למייל ולאתר, מצרפים את הקובץ למייל
        let attachments = null;
        let hasFile = false;
        let filename = '';
        if (updating.updateLocation === "site_and_email" && updating.file && updating.file.path) {
          hasFile = true;
          filename = updating.file.filename;
          attachments = [{
            filename: updating.file.filename,
            path: `public/${updating.file.path}`
          }];
        }
        
        const emailContent = updateFullEmailTemplate(c.Fname, updating.title, updating.content, hasFile, filename);
        return sendMail(c.email, subject, emailContent, attachments);
      });

    await Promise.allSettled(promises);
  } catch (err) {
    console.error("Error sending update emails:", err);
  }
};

// יצירת עדכון חדש עם אפשרות להעלות קובץ
const createUpdating = async (req, res) => {
  try {
    if (req.file) {
      // Normalize to relative path under public/ (handles absolute Windows paths)
      const normalized = req.file.path.replace(/\\/g, "/");
      const filePath = normalized.replace(/.*?public\//, "");
      req.body.file = {
        filename: req.file.originalname,
        path: filePath,
      };
    }

    const newUpdating = await Updating.create(req.body);

    // send notifications according to updateLocation
    try { sendEmailsForUpdate(newUpdating); } catch (e) { console.error(e); }

    res.status(201).json({ message: "Updating created successfully" });
  } catch (error) {
    // במקרה של שגיאה מוחקים את הקובץ שהועלה
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: "Error creating updating", error: error.message });
  }
};

// שליפת כל העדכונים
const getUpdatings = async (req, res) => {
  try {
    const updatings = await Updating.find();
    res.status(200).json(updatings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching updatings", error: error.message });
  }
};

// שליפת עדכון לפי ID
const getUpdatingById = async (req, res) => {
  try {
    const updating = await Updating.findById(req.params.id);
    if (!updating) return res.status(404).json({ message: "Updating not found" });
    res.status(200).json(updating);
  } catch (error) {
    res.status(500).json({ message: "Error fetching updating", error: error.message });
  }
};

// עדכון עדכון קיים
const updateUpdating = async (req, res) => {
  try {
    const updating = await Updating.findById(req.params.id);
    if (!updating) return res.status(404).json({ message: "Updating not found" });

    if (req.body.title) updating.title = req.body.title;
    if (req.body.content) updating.content = req.body.content;
    
    // אם המשתמש ביקש להסיר את הקובץ
    if (req.body.removeFile === "true") {
      if (updating.file && updating.file.path) {
        const oldFilePath = updating.file.path.startsWith('public/') 
          ? updating.file.path 
          : `public/${updating.file.path}`;
        try { 
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (e) {
          console.error('Error deleting old file:', e);
        }
      }
      updating.file = undefined;
    } else if (req.file) {
      // מחיקת הקובץ הקודם אם קיים
      if (updating.file && updating.file.path) {
        const oldFilePath = updating.file.path.startsWith('public/') 
          ? updating.file.path 
          : `public/${updating.file.path}`;
        try { 
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (e) {
          console.error('Error deleting old file:', e);
        }
      }
      // Normalize to relative path under public/
      const normalized = req.file.path.replace(/\\/g, "/");
      const filePath = normalized.replace(/.*?public\//, "");
      updating.file = {
        filename: req.file.originalname,
        path: filePath,
      };
    }

    await updating.save();
    res.status(200).json({ message: "Updating updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating updating", error: error.message });
  }
};

// מחיקת עדכון
const deleteUpdating = async (req, res) => {
  try {
    const updating = await Updating.findByIdAndDelete(req.params.id);
    if (!updating) return res.status(404).json({ message: "Updating not found" });

    // מחיקת הקובץ מהשרת אם קיים
    if (updating.file && updating.file.path) {
      const p = updating.file.path.replace(/\\/g, '/');
      const filePath = p.includes('/public/') ? p : `public/${p}`;
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    res.status(200).json({ message: "Updating deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting updating", error: error.message });
  }
};

module.exports = { 
  createUpdating, 
  getUpdatings, 
  getUpdatingById, 
  updateUpdating, 
  deleteUpdating 
};
