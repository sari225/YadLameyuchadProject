const Message = require("../models/Message");
const { sendMail } = require("../utils/sendMail");
// יצירת הודעה חדשה
const createMessage = async (req, res) => {
  try {
    let senderName, senderEmail;

    // משתמש רשום (יש req.user מהטוקן)
    if (req.user) {
      senderName = req.user.name;
      senderEmail = req.user.email;
    } 
    // משתמש אורח
    else {
      senderName = req.body.senderName;
      senderEmail = req.body.senderEmail;

      if (!senderName || !senderEmail)
        return res.status(400).json({ message: "Guest must provide name and email" });
    }

    const { topic, content } = req.body;
    if (!topic || !content)
      return res.status(400).json({ message: "Topic and content are required" });

    const newMessage = await Message.create({
      senderName,
      senderEmail,
      topic,
      content,
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating message", error: error.message });
  }
};

// שליפת כל ההודעות
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// שליפת הודעה לפי מזהה
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Error fetching message", error: error.message });
  }
};

// עדכון סטטוס "נקרא"
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.readen = true;
    await message.save();
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating message", error: error.message });
  }
};

// מחיקת הודעה
const deleteMessage = async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
};

// שליחת תשובה למייל של השולח
const replyToMessage = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await sendMail(to, subject, body);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  markAsRead,
  deleteMessage,
  replyToMessage,
};
