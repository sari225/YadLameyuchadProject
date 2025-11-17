const DayCamp=require("../models/DayCamp")
const Child = require("../models/Child")
const fs = require('fs')

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

    dayCamp.registeredChildren.push(childId);
    dayCamp.subscribersNumber = dayCamp.subscribersNumber+1
    await dayCamp.save();

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
