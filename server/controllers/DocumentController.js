const { url } = require("inspector");
const Document = require("../models/Documents");
const fs = require('fs')

const createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const name = req.body.name || req.file.originalname;

    const normalized = req.file.path.replace(/\\/g, '/');
    const fileUrl = normalized.replace(/.*?public\//, "");
    const newDocument = await Document.create({ name, url: fileUrl });

    res.status(201).json({
      message: "Document created successfully",
      document: newDocument,
    });
  } catch (error) {
    // במקרה של שגיאה גם כאן נרצה למחוק את הקובץ שהועלה
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({
      message: "Error creating document",
      error: error.message
    });
  }
};



// שליפת כל המסמכים
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
};

// שליפת מסמך לפי ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: "Error fetching document", error: error.message });
  }
};


// מחיקת מסמך לפי ID
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Document.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Document not found" });
    }
    // מחיקת הקובץ מהשרת אם קיים
    if (deleted && deleted.url) {
      const p = deleted.url.replace(/\\/g, '/');
      const filePath = p.includes('/public/') ? p : 'public/' + p;
      try { fs.unlinkSync(filePath) } catch (e) {}
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};



module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};
