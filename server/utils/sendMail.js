const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});


const sendMail = async (to, subject, text, attachments ) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments
    });
  } catch (err) {
    throw err; 
  }
};

module.exports = { sendMail };
