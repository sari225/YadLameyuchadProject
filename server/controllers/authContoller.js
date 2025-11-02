const Child = require("../models/Child");
const Admin =require("../models/Admin")
const jwt = require("jsonwebtoken");
const  bcrypt = require("bcrypt");
const { sendMail } = require("../utils/sendMail");
const {generatePassword}=require("../utils/generatePassword")


// 1. רישום ילד חדש + שליחת OTP במייל
const registerChild = async (req, res) => {
  try {
    const { email, ...rest } = req.body;
    const child = await Child.findOne({ email }); 
    if (child && !child.isVerified) {
      await Child.findByIdAndDelete(child._id);
    }

    // יצירת הילד בבסיס הנתונים
    const newChild = await Child.create({
      ...rest,
      email,
      password: undefined,
      isVerified: false,
      isApproved: false
    });

    // יצירת OTP ידני ושליחתו במייל
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 ספרות
    newChild.otp = otp;
    newChild.otpExpires = Date.now() + 10 * 60 * 1000; // 10 דקות
    await newChild.save();

    await sendMail(
      email,
      "Email Verification - YadLemeyuchad",
      `Your verification code is: ${otp}`
    );

    res.status(201).json({ 
      message: "Child registered. OTP sent to email. Please verify.", 
    });
  } catch (err) {
    console.error("Error in registerChild:", err);
    res.status(500).json({ message: "Error registering child", error: err.message });
  }
};

// 2. אימות OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const child = await Child.findOne({ email });

    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.otp !== otp || Date.now() > child.otpExpires)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    child.isVerified = true;
    child.otp = undefined;
    child.otpExpires = undefined;
    await child.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};

// 3. אישור מנהל + שליחת סיסמה ראשונית
const approveChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findById(id);

    if (!child) return res.status(404).json({ message: "Child not found" });
    if (!child.isVerified) return res.status(400).json({ message: "Child not verified" });

    const plainPassword =generatePassword()
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    child.password = hashedPassword;
    child.isApproved = true;
    await child.save();

    await sendMail(child.email, "Your Initial Password", `Your password is: ${plainPassword}`);

    res.json({ message: "Child approved and password sent" });
  } catch (err) {
    res.status(500).json({ message: "Error approving child", error: err.message });
  }
};

// 4. התחברות

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const child = await Child.findOne({ email });
    const admin = await Admin.findOne({email})
    if(child){
    const valid = await bcrypt.compare(password, child.password);
    if (!child.isApproved||!valid) return res.status(401).json({ message: "unauthorized" });

    // יצירת טוקן JWT
    const token = jwt.sign(
      { id: child._id,childId:child.childId, email: child.email,role:child.role },
      process.env.ACCESS_TOKEN_SECRET,
      
    );
  
    res.json({token: token });
}
else{
  if(admin){
     const valid = await bcrypt.compare(password, admin.password);
       if (!valid) return res.status(401).json({ message: "unauthorized" });

    // יצירת טוקן JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email,role:admin.role },
      process.env.ACCESS_TOKEN_SECRET,
      
    );
  
    res.json({token: token });
  }
  else
     return res.status(404).json({ message: "unauthorized" });
}
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const child = await Child.findOne({ email });

    if (!child) return res.status(404).json({ message: "Email not found" });

    // מייצרים סיסמה זמנית
    const tempPassword =generatePassword()
    // מצפינים את הסיסמה
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    child.password = hashedPassword;
    await child.save();

    // שולחים למייל
    await sendMail(email, "Password Reset", `Your temporary password is: ${tempPassword}`);

    res.json({ message: "Temporary password sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerChild,
  verifyOTP,
  approveChild,
  login,
  forgotPassword
};
  