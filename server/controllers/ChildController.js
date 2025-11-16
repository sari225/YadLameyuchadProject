const Child = require("../models/Child");
const bcrypt = require("bcrypt");
const { sendMail } = require("../utils/sendMail");
const {generatePassword}=require("../utils/generatePassword")
const createChild = async (req, res) => {
  try {
    const child = req.body;

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    // בדיקה אם המייל כבר קיים
    const existingEmail = await Child.findOne({ email: child.email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists. Please use a different email address."
      });
    }

    // בדיקה אם מספר הזהות כבר קיים
    const existingChildId = await Child.findOne({ childId: child.childId });
    if (existingChildId) {
      return res.status(400).json({
        message: "childId already exists. This ID is already registered in the system."
      });
    }
    // ...המשך קוד רגיל ללא מחיקות מיותרות...
    const newChild = await Child.create({
      ...child,
      isApproved:true,
      isVerified:true,
      password: hashedPassword,
      role:"child"
    });

    res.status(201).json({message:"new child created successfully"});
    await sendMail(child.email, "Your Initial Password", `Your password is: ${password}`);

  } catch (error) {
    res.status(500).json({ message: "Error creating child", error: error.message });
  }
};

const getChildren = async (req, res) => {
  try {
    const children = await Child.find().select("-password");;
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: "Error fetching children", error: error.message });
  }
};

const getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).select("-password");;
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
    res.json(child);
  } catch (error) {
    res.status(500).json({ message: "Error fetching child", error: error.message });
  }
};

const updateChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
       
    if (req.body.childId) child.childId = req.body.childId;
    if (req.body.parentName) child.parentName = req.body.parentName;
    if (req.body.Fname) child.Fname = req.body.Fname;
    if (req.body.Lname) child.Lname = req.body.Lname;
  if (req.body.dateOfBirth) child.dateOfBirth = req.body.dateOfBirth;
    if (req.body.address) child.address = req.body.address;
    if (req.body.phone1) child.phone1 = req.body.phone1;
    if (req.body.phone2) child.phone2 = req.body.phone2;
    if (req.body.educationInstitution) child.educationInstitution = req.body.educationInstitution;
    child.allergies = req.body.allergies;
    if (typeof req.body.emailConsent !== 'undefined') child.emailConsent = req.body.emailConsent;
    if (req.body.email) child.email = req.body.email;
    child.definition = req.body.definition;
    await child.save();

    res.json({message:"child updated successfully"});
  } catch (error) {
    res.status(500).json({ message: "Error updating child", error: error.message });
  }
};

const deleteChild = async (req, res) => {
  try {
    const child = await Child.findByIdAndDelete(req.params.id);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }
    res.json({ message: "Child deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting child", error: error.message });
  }
};
const updatePassword = async (req, res) => {
  try {
   
    const { newPassword } = req.body; // הסיסמה החדשה

    // בדיקה אם הילד קיים
    const child = await Child.findById(req.user.id);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // ביטוי רגולרי לבדיקה שהסיסמה עומדת בדרישות
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
     
      return res.status(400).json({
        message:"The password must contain at least 8 characters, an uppercase letter, a lowercase letter, and a special character. "  });
    }

    // הצפנת הסיסמה החדשה
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // עדכון בבסיס הנתונים
    child.password = hashedPassword;
    await child.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

module.exports = { createChild,getChildren,getChildById,updateChild,deleteChild,updatePassword};
