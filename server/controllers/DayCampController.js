const DayCamp=require("../models/DayCamp")
const fs = require('fs')

const createDayCamp = async (req, res) => {
  try {
    if (req.file) {
      req.body.file = {
        filename: req.file.originalname,
        path: req.file.path.replace(/\\/g, '/'),
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
    const dayCamps = await DayCamp.find();
    res.json(dayCamps);
  } catch (error) {  
    res.status(500).json({ message: "Error fetching day camps", error: error.message });
  }
};

const getDayCampById = async (req, res) => {
  try {
    const dayCamp = await DayCamp.findById(req.params.id);
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
    if (req.body.clubManagers) dayCamp.clubManagers = req.body.clubManagers;
    if (req.body.activityDay) dayCamp.activityDay = req.body.activityDay;
    if (req.body.startTime) dayCamp.startTime = req.body.startTime;
    if (req.body.endTime) dayCamp.endTime = req.body.endTime;
    if (req.body.location) dayCamp.location = req.body.location;

    if (req.file) {
      // remove old file if present
      if (dayCamp.file && dayCamp.file.path) {
        try { fs.unlinkSync(dayCamp.file.path) } catch (e) {}
      }
      dayCamp.file = {
        filename: req.file.originalname,
        path: req.file.path.replace(/\\/g, '/'),
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
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
      try { fs.unlinkSync(dayCamp.file.path) } catch (e) {}
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
