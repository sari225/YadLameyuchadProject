const DayCamp=require("../models/DayCamp")
const Child = require("../models/Child")
const fs = require('fs')
const path = require('path')
const { sendMail } = require('../utils/sendMail')

const createDayCamp = async (req, res) => {
  try {
    if (req.file) {
      const normalized = req.file.path.replace(/\\/g, '/');
      req.body.file = {
        filename: req.file.originalname,
        path: normalized.replace(/.*?public\//, ''),
      }
    }

    const newDayCamp = await DayCamp.create(req.body);
    res.status(201).json({ message: "New day camp created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating day camp", error: error.message });
  }
};

const getDayCamps = async (req, res) => {
  try {
    const dayCamps = await DayCamp.find().populate('registeredChildren', 'Fname Lname childId allergies');
    res.json(dayCamps);
  } catch (error) {  
    res.status(500).json({ message: "Error fetching day camps", error: error.message });
  }
};

const getDayCampById = async (req, res) => {
  try {
    const dayCamp = await DayCamp.findById(req.params.id).populate('registeredChildren', 'Fname Lname childId allergies dateOfBirth phone1 phone2 email parentName');
    if (!dayCamp) {
      return res.status(404).json({ message: "Day camp not found" });
    }
    res.json(dayCamp);
  } catch (error) {
    res.status(500).json({ message: "Error fetching day camp", error: error.message });
  }
};

const updateDayCamp = async (req, res) => {
  try {
    const dayCamp = await DayCamp.findById(req.params.id);
    if (!dayCamp) {
      return res.status(404).json({ message: "Day camp not found" });
    }

    if (req.body.name) dayCamp.name = req.body.name;
    if (req.body.startDate) dayCamp.startDate = req.body.startDate;
    if (req.body.endDate) dayCamp.endDate = req.body.endDate;
    if (req.body.location) dayCamp.location = req.body.location;
    if (req.body.registerStatus !== undefined) dayCamp.registerStatus = req.body.registerStatus;

    // Handle file removal
    if (req.body.removeFile === "true") {
      if (dayCamp.file && dayCamp.file.path) {
        const prev = dayCamp.file.path.replace(/\\/g, '/');
        const oldFilePath = prev.includes('/public/') ? prev : 'public/' + prev;
        try { fs.unlinkSync(oldFilePath) } catch (e) {}
      }
      dayCamp.file = undefined;
    } else if (req.file) {
      // remove old file if present
      if (dayCamp.file && dayCamp.file.path) {
        const prev = dayCamp.file.path.replace(/\\/g, '/');
        const oldFilePath = prev.includes('/public/') ? prev : 'public/' + prev;
        try { fs.unlinkSync(oldFilePath) } catch (e) {}
      }
      const normalized = req.file.path.replace(/\\/g, '/');
      dayCamp.file = {
        filename: req.file.originalname,
        path: normalized.replace(/.*?public\//, ''),
      }
    }

    await dayCamp.save();
    res.json({ message: "Day camp updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating day camp", error: error.message });
  }
};

const deleteDayCamp = async (req, res) => {
  try {
    const dayCamp = await DayCamp.findByIdAndDelete(req.params.id);
    if (!dayCamp) {
      return res.status(404).json({ message: "Day camp not found" });
    }
    // remove file from disk if exists
    if (dayCamp.file && dayCamp.file.path) {
      const p = dayCamp.file.path.replace(/\\/g, '/');
      const filePath = p.includes('/public/') ? p : 'public/' + p;
      try { fs.unlinkSync(filePath) } catch (e) {}
    }
    res.json({ message: "Day camp deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting day camp", error: error.message });
  }
};
const addChildToDayCamp = async (req, res) => {
  try {
    const { DayCampId} = req.body;
    let childId;
 
    // אם המשתמש המחובר הוא ילד - ניקח את ה־id מהטוקן
    if (req.user.role === "child") {
      childId = req.user.id;
    } 
    // אם המשתמש הוא מנהל או מדריך - ניקח מהבקשה
    else if (req.user.role === "admin" ) {
      childId = req.body.id;
    } 
    // המשך הקוד הרגיל שלך
    const dayCamp = await DayCamp.findById(DayCampId);
    if (!dayCamp) return res.status(404).json({ message: "dayCamp not found" });

    if (dayCamp.registeredChildren.includes(childId)) {
      return res.status(400).json({ message: "Child already registered" });
    }

    // שליפת פרטי הילד כולל כתובת המייל
    const child = await Child.findById(childId);
    if (!child || !child.email) {
      return res.status(400).json({ message: "Child email not found" });
    }

    dayCamp.registeredChildren.push(childId);
    dayCamp.subscribersNumber = dayCamp.subscribersNumber+1
    await dayCamp.save();

    // שליחת מייל עם כל הפרטים של הקייטנה
    const emailSubject = `אישור הרשמה לקייטנה ${dayCamp.name}`;
    const emailBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">שלום ${child.Fname} ${child.Lname},</h2>
        <p>נרשמת בהצלחה לקייטנה!</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2196F3; margin-top: 0;">פרטי הקייטנה:</h3>
          
          <p><strong>שם הקייטנה:</strong> ${dayCamp.name}</p>
          <p><strong>תאריך התחלה:</strong> ${new Date(dayCamp.startDate).toLocaleDateString('he-IL')}</p>
          <p><strong>תאריך סיום:</strong> ${new Date(dayCamp.endDate).toLocaleDateString('he-IL')}</p>
          <p><strong>מיקום:</strong> ${dayCamp.location}</p>
          <p><strong>מספר משתתפים נוכחי:</strong> ${dayCamp.subscribersNumber}</p>
        </div>
        
        
        <p style="margin-top: 20px;">בברכה,<br/>צוות הניהול</p>
      </div>
    `;

    // הכנת attachments אם יש קובץ - בדיוק כמו ב-UpdateController
    let attachments = undefined;
    if (dayCamp.file?.path) {
      attachments = {
        filename: dayCamp.file.filename,
        path: `public/${dayCamp.file.path}`
      };
    }

    try {
      await sendMail(child.email, emailSubject, emailBody, attachments);
      console.log('Email sent successfully to:', child.email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // ממשיכים גם אם המייל נכשל - הרישום בוצע בהצלחה
    }

    res.status(200).json({ message: "Child added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const removeChildFromDayCamp = async (req, res) => {
  try {
    const { DayCampId } = req.body;
    let childId;

    // אם המשתמש המחובר הוא ילד - ניקח את ה־id מהטוקן
    if (req.user.role === "child") {
      childId = req.user.id;
    } 
    // אם המשתמש הוא מנהל - ניקח מהבקשה
    else if (req.user.role === "admin") {
      childId = req.body.id;
    } 
    // מציאת הקייטנה לפי ID
    const dayCamp = await DayCamp.findById(DayCampId);
    if (!dayCamp) return res.status(404).json({ message: "DayCamp not found" });
    // בדיקה אם הילד רשום בכלל
    if (!dayCamp.registeredChildren.includes(childId)) {
      return res.status(400).json({ message: "Child not registered in this camp" });
    }

    // הסרת הילד מהרשימה
    dayCamp.registeredChildren = dayCamp.registeredChildren.filter(
      id => id.toString() !== childId.toString()
    )

    // עדכון מונה הנרשמים
    if (dayCamp.subscribersNumber > 0) {
      dayCamp.subscribersNumber -= 1;
    }

    await dayCamp.save();

    res.status(200).json({ message: "Child removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing child", error: error.message }); 
  }
};


module.exports = { createDayCamp, getDayCamps, getDayCampById, updateDayCamp, deleteDayCamp, addChildToDayCamp ,removeChildFromDayCamp};
