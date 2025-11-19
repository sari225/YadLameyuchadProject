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

    // שינוי מצב - אם נקרא הפוך ללא נקרא ולהפך
    message.readen = !message.readen;
    await message.save();
    res.json({ message: message.readen ? "Message marked as read" : "Message marked as unread" });
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
    const { messageId, recipientEmail, replyContent } = req.body;

    if (!messageId || !recipientEmail || !replyContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // שליפת ההודעה המקורית
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }

    const subject = `תשובה לפנייתך - ${originalMessage.topic}`;
    const body = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #78D2F5 0%, #5CABE0 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">יד למיוחד</h2>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h3 style="color: #333;">שלום ${originalMessage.senderName},</h3>
          <p style="color: #555; line-height: 1.6;">תודה שפנית אלינו בנושא: <strong style="color: #1976d2;">${originalMessage.topic}</strong></p>
          <p style="color: #555; line-height: 1.6;">להלן תשובתנו:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-right: 4px solid #78D2F5; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; line-height: 1.8; margin: 0; white-space: pre-wrap;">${replyContent}</p>
          </div>
          <p style="color: #555; line-height: 1.6;">נשמח לעמוד לרשותך בכל שאלה נוספת.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #555; margin: 5px 0;"><strong>בברכה,</strong></p>
            <p style="color: #555; margin: 5px 0;">צוות יד למיוחד</p>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">רח' האדמו"ר מבעלזא 15, ביתר עילית | טלפון: 02-5809999</p>
          </div>
        </div>
      </div>
    `;

    await sendMail(recipientEmail, subject, body);

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
