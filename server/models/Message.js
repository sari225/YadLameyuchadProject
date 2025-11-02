const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/,
  },
  topic: {
    type: String,
    enum: ["שאלה", "תלונה", "בקשה"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  readen: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
