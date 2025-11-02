const Updating = require("../models/Updating");
const fs = require("fs");

// יצירת עדכון חדש עם אפשרות להעלות קובץ
const createUpdating = async (req, res) => {
  try {
    if (req.file) {
      req.body.file = {
        filename: req.file.originalname,
        path: req.file.path.replace(/\\/g, "/"),
      };
    }

    const newUpdating = await Updating.create(req.body);
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

    if (req.file) {
      // מחיקת הקובץ הקודם אם קיים
      if (updating.file && updating.file.path) {
        try { fs.unlinkSync(updating.file.path); } catch (e) {}
      }
      updating.file = {
        filename: req.file.originalname,
        path: req.file.path.replace(/\\/g, "/"),

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
      try { fs.unlinkSync(updating.file.path); } catch (e) {}
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
